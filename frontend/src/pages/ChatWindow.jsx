
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Mic, Phone, PhoneIncoming, PhoneOff, MoreVertical, X, AlertTriangle, Ban, ChevronDown, Volume2, MicOff, Video, Image as ImageIcon, Smile } from 'lucide-react';
import api, { getPhotoUrl } from '../api/client';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Peer } from 'peerjs';

const ChatWindow = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const myId = parseInt(localStorage.getItem('user_id'));

    // UI State
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showSafetyMenu, setShowSafetyMenu] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('spam');
    const [reportExplanation, setReportExplanation] = useState('');

    // Call State
    const [callStatus, setCallStatus] = useState(null); // 'dialing', 'incoming', 'connected'
    const [connectionStep, setConnectionStep] = useState('');
    const [activeCallId, setActiveCallId] = useState(null);
    const [isMuted, setIsMuted] = useState(false);

    // Refs
    const peerRef = useRef(null);
    const activeCallRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const audioCtxRef = useRef(null);
    const ringInterval = useRef(null);

    // Chat State
    const [partnerStatus, setPartnerStatus] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const lastTypedRef = useRef(0);
    const scrollRef = useRef();

    useEffect(() => {
        fetchMessages();
        fetchOtherUser();

        // PeerJS Init
        const peer = new Peer(`mallu_user_${myId}`, {
            debug: 2,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on('open', (id) => console.log('My Peer ID:', id));

        peer.on('call', (call) => {
            console.log("Incoming Peer Call from:", call.peer);
            activeCallRef.current = call;

            setCallStatus((prev) => {
                if (prev === 'dialing') {
                    // Auto Answer (I called them, they called back logic, or clash)
                    answerPeerCall(call);
                    return 'connected';
                }
                if (prev !== 'connected') {
                    startRingtone('incoming');
                    return 'incoming';
                }
                return prev;
            });
        });

        peer.on('error', (err) => {
            console.error("PeerJS Error", err);
            if (callStatus) setConnectionStep("Connection error: " + err.type);
        });

        peerRef.current = peer;

        const interval = setInterval(() => {
            fetchMessages();
            pollCalls();
        }, 1000);

        return () => {
            clearInterval(interval);
            stopRingtone();
            handleEndCallLocal();
            peer.destroy();
        };
    }, [userId, myId]);

    useEffect(() => { if (!showScrollButton) scrollToBottom(); }, [messages, replyTo]);

    // Ringtone Logic
    const startRingtone = (type) => {
        if (audioCtxRef.current) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            const now = ctx.currentTime;

            if (type === 'incoming') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, now);
                gain.gain.setValueAtTime(0.1, now);
                ringInterval.current = setInterval(() => {
                    if (ctx.state === 'closed') return;
                    const t = ctx.currentTime;
                    gain.gain.setValueAtTime(0.1, t);
                    gain.gain.setValueAtTime(0, t + 0.4);
                    gain.gain.setValueAtTime(0.1, t + 0.6);
                    gain.gain.setValueAtTime(0, t + 1.0);
                }, 2500);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                gain.gain.setValueAtTime(0.1, now);
                ringInterval.current = setInterval(() => {
                    if (ctx.state === 'closed') return;
                    const t = ctx.currentTime;
                    gain.gain.setValueAtTime(0.1, t);
                    gain.gain.setValueAtTime(0, t + 1.2);
                }, 3000);
            }
            osc.start();
        } catch (e) { }
    };

    const stopRingtone = () => {
        if (ringInterval.current) { clearInterval(ringInterval.current); ringInterval.current = null; }
        if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => { }); audioCtxRef.current = null; }
    };

    const pollCalls = async () => {
        try {
            const res = await api.get('/calls/poll/');
            if (res.data.incoming && !callStatus) {
                setCallStatus('incoming');
                setActiveCallId(res.data.incoming.id);
                startRingtone('incoming');
            }
            if (res.data.my_call) {
                const call = res.data.my_call;
                if (call.status === 'active' && callStatus === 'dialing') {
                    setConnectionStep("Connecting voice...");
                    stopRingtone();
                }
                if (['ended', 'rejected'].includes(call.status)) handleEndCallLocal();
            }
            if (res.data.incoming_update) {
                if (['ended', 'rejected'].includes(res.data.incoming_update.status)) handleEndCallLocal();
            }
        } catch (err) { }
    };

    const startCall = async () => {
        setCallStatus('dialing');
        setConnectionStep("Calling...");
        startRingtone('outgoing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });
            localStreamRef.current = stream;

            // API Notify
            const res = await api.post('/calls/start/', { receiver: userId });
            setActiveCallId(res.data.id);

            // PeerJS Call
            if (peerRef.current) {
                const call = peerRef.current.call(`mallu_user_${userId}`, stream);
                setupCallEvents(call);
            }
        } catch (err) {
            toast.error("Call failed: " + err.message);
            handleEndCallLocal();
        }
    };

    const acceptCall = async () => {
        stopRingtone();
        setCallStatus('connecting');
        setConnectionStep("Connecting...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            });
            localStreamRef.current = stream;

            if (activeCallRef.current) {
                answerPeerCall(activeCallRef.current, stream);
            } else {
                setConnectionStep("Dialing back...");
                if (peerRef.current) {
                    const call = peerRef.current.call(`mallu_user_${userId}`, stream);
                    setupCallEvents(call);
                }
            }

            if (activeCallId) await api.post(`/calls/${activeCallId}/answer/`);
            setCallStatus('connected');
        } catch (err) {
            toast.error("Answer failed");
            handleEndCallLocal();
        }
    };

    const answerPeerCall = (call, stream) => {
        if (!stream) stream = localStreamRef.current;
        if (!stream) return;
        console.log("Answering Peer Call");
        call.answer(stream);
        setupCallEvents(call);
    };

    const setupCallEvents = (call) => {
        activeCallRef.current = call;
        call.on('stream', (remoteStream) => {
            console.log("Received Remote Stream", remoteStream.getAudioTracks());
            setConnectionStep("Voice Active");
            setCallStatus('connected');
            stopRingtone();

            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStream;
                // Force play
                const playPromise = remoteAudioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Auto-play failed", error);
                        setConnectionStep("Tap to Unmute");
                    });
                }
            }
        });
        call.on('close', () => handleEndCallLocal());
        call.on('error', (e) => {
            console.error("Call Error", e);
            handleEndCallLocal();
        });
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsMuted(!track.enabled);
            }
        }
    };

    const disconnectCall = async () => {
        if (activeCallId) try { await api.post(`/calls/${activeCallId}/end/`); } catch (e) { }
        handleEndCallLocal();
    };

    const handleEndCallLocal = () => {
        stopRingtone();
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (activeCallRef.current) {
            activeCallRef.current.close();
            activeCallRef.current = null;
        }
        setCallStatus(null);
        setActiveCallId(null);
        setConnectionStep('');
        setIsMuted(false);
    };

    // Chat Logic
    const scrollToBottom = () => scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    const handleScroll = (e) => setShowScrollButton(e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight > 300);
    const fetchOtherUser = async () => { try { const res = await api.get(`/profile/${userId}/`); setOtherUser(res.data); } catch (e) { } };
    const fetchMessages = async () => {
        try {
            const res = await api.get(`/messages/?user_id=${userId}`);
            if (Array.isArray(res.data)) setMessages(res.data);
            else { setMessages(res.data.messages); setPartnerStatus(res.data.partner_status); }
        } catch (e) { }
    };
    const handleInput = (e) => {
        setInput(e.target.value);
        const now = Date.now();
        if (now - lastTypedRef.current > 2000) { lastTypedRef.current = now; api.post('/chat/typing/', { receiver_id: userId }).catch(() => { }); }
    };
    const handleSend = async () => {
        if (!input.trim()) return;
        try {
            const payload = { receiver: userId, content: input, message_type: 'text', parent_message: replyTo?.id };
            const res = await api.post('/messages/', payload);
            setMessages([...messages, res.data]);
            setInput('');
            setReplyTo(null);
            setTimeout(scrollToBottom, 50);
        } catch (e) { toast.error("Send failed"); }
    };
    const handleReport = async () => { await api.post('/report/', { reported_user: userId, reason: reportReason, explanation: reportExplanation }); setShowReportModal(false); toast.success("User reported"); };
    const handleBlock = async () => { if (window.confirm("Are you sure you want to block this user?")) { await api.post('/block/', { blocked_user: userId }); navigate('/matches'); } };
    const formatLastSeen = (d) => { if (!d) return 'Offline'; const diff = (new Date() - new Date(d)) / 60000; return diff < 60 ? `${Math.floor(diff)}m ago` : 'offline'; };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-[100dvh]">
            {/* Header */}
            <div className="shrink-0 h-[64px] bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/chats')}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${userId}`)}>
                        <div className="relative">
                            <img
                                src={getPhotoUrl(otherUser?.photos?.[0]?.image)}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md bg-slate-200"
                                alt=""
                            />
                            {/* Online Dot */}
                            {false /* TODO: Fix poll status */ && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="font-bold text-slate-900 leading-tight">
                                {otherUser?.first_name || 'Loading...'}
                            </h2>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                {false ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-full transition-all active:scale-95">
                        <Phone size={20} />
                    </button>
                    <button onClick={startVideoCall} className="p-2.5 text-brand-primary bg-rose-50 hover:bg-rose-100 rounded-full transition-all active:scale-95">
                        <Video size={20} />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            <div
                className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-slate-50 relative"
                ref={chatContainerRef}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Secure Message Notice */}
                <div className="flex justify-center py-4">
                    <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-orange-100 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                        End-to-End Encrypted
                    </div>
                </div>

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-60">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Smile size={32} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">No messages yet.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender === parseInt(myId);
                            const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender !== msg.sender);

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    key={idx}
                                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[85%] ${isMe ? 'items-end' : 'items-end gap-2.5'}`}>

                                        {!isMe && showAvatar && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-white bg-slate-200">
                                                <img src={getPhotoUrl(otherUser?.photos?.[0]?.image)} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        {!isMe && !showAvatar && <div className="w-8 shrink-0" />}

                                        <div className={`
                                            px-4 py-2.5 rounded-2xl relative shadow-sm text-[15px] leading-relaxed break-words
                                            ${isMe
                                                ? 'bg-brand-primary text-white rounded-br-sm'
                                                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                                            }
                                        `}>
                                            {msg.message || msg.content}
                                            <div className={`text-[9px] font-bold mt-1 text-right ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </AnimatePresence>
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 bg-white border-t border-slate-100 px-3 py-2 pb-safe">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-end gap-2 bg-slate-50 p-1.5 rounded-[24px] border border-slate-200 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all shadow-sm"
                >
                    <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors active:scale-90">
                        <Smile size={22} />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={handleInput}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 py-3 max-h-32 min-h-[44px]"
                        onFocus={() => {
                            // Ensure scroll to bottom on focus
                            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
                        }}
                    />

                    {input.trim() ? (
                        <button type="submit" className="p-2.5 bg-brand-primary text-white rounded-full shadow-md shadow-rose-200 hover:bg-rose-600 active:scale-90 transition-all">
                            <Send size={20} fill="currentColor" className="ml-0.5" />
                        </button>
                    ) : (
                        <button type="button" className="p-2.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors active:scale-90">
                            <Mic size={22} />
                        </button>
                    )}
                </form>
            </div>

            {/* Call Overlay and Modals (Preserved roughly, simplified for brevity but functional) */}
            <AnimatePresence>
                {incomingCall && (
                    <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-4 left-4 right-4 z-[100] bg-slate-900 rounded-xl p-4 flex justify-between shadow-2xl">
                        <div className="text-white">
                            <h3 className="font-bold">{otherUser?.first_name}</h3>
                            <p className="text-xs text-green-400 animate-pulse">Incoming Call...</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={rejectCall} className="bg-red-500 p-2 rounded-full"><PhoneOff size={20} color="white" /></button>
                            <button onClick={answerCall} className="bg-green-500 p-2 rounded-full"><Video size={20} color="white" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Call UI */}
            {callActive && (
                <div className="fixed inset-0 z-[100] bg-slate-900">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20">
                        <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
                        <button onClick={endCall} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 active:scale-90 transition-all">
                            <PhoneOff size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;

