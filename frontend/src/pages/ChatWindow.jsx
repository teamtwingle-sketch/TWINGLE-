
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Mic, Phone, PhoneIncoming, PhoneOff, MoreVertical, X, AlertTriangle, Ban, ChevronDown, Volume2, MicOff, Video, Image as ImageIcon, Smile, Check, CheckCheck } from 'lucide-react';
import api from '../api/client';
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

        // 1. PeerJS Init
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
                    stopRingtone();
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

        // 2. WebSocket Init (Replacing Message Polling)
        const token = localStorage.getItem('token');
        let ws = null;
        if (token) {
            // Calculate WS URL
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const wsUrl = apiBase.replace('http', 'ws').replace('/api', '') + '/ws/chat/?token=' + token;

            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("Connected to Chat WebSocket");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.message) {
                    const newMsg = data.message;
                    // Only append if it belongs to THIS chat (userId matches sender or receiver)
                    // The 'userId' from useParams is a string, compare safely
                    const partnerId = parseInt(userId);

                    if (newMsg.sender === partnerId || (newMsg.sender === myId && newMsg.receiver === partnerId)) {
                        setMessages((prev) => {
                            // Deduplicate just in case (e.g. if we sent it and got echo)
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });

                        // If we are looking at bottom, scroll to new message
                        if (!showScrollButton) setTimeout(scrollToBottom, 50);

                        // If partner is typing, clear it since they sent a message
                        setPartnerStatus(prev => ({ ...prev, is_typing: false }));
                    }
                }
            };

            ws.onclose = () => console.log("Chat WebSocket Disconnected");
        }

        // 3. Keep Polling for Calls & Presence (Status updates need this)
        const interval = setInterval(() => {
            pollCalls();
            fetchMessages(); // Restored for typing/online status
        }, 3000);

        return () => {
            clearInterval(interval);
            stopRingtone();
            handleEndCallLocal();
            peer.destroy();
            if (ws) ws.close();
        };
    }, [userId, myId]);

    useEffect(() => { if (!showScrollButton) scrollToBottom(); }, [messages, replyTo]);

    // Ringtone Logic - Sweet & Mild
    const startRingtone = (type) => {
        if (audioCtxRef.current) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            if (type === 'incoming') {
                // Smooth "Ding-Dong" pattern
                const playNote = (time) => {
                    // High Note (E5)
                    const osc1 = ctx.createOscillator();
                    const gain1 = ctx.createGain();
                    osc1.connect(gain1);
                    gain1.connect(ctx.destination);
                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(659.25, time);
                    gain1.gain.setValueAtTime(0, time);
                    gain1.gain.linearRampToValueAtTime(0.1, time + 0.1); // Soft attack
                    gain1.gain.exponentialRampToValueAtTime(0.001, time + 1.2); // Slow decay
                    osc1.start(time);
                    osc1.stop(time + 1.2);

                    // Low Note (C5)
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(ctx.destination);
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(523.25, time + 0.8);
                    gain2.gain.setValueAtTime(0, time + 0.8);
                    gain2.gain.linearRampToValueAtTime(0.1, time + 0.9);
                    gain2.gain.exponentialRampToValueAtTime(0.001, time + 2.5);
                    osc2.start(time + 0.8);
                    osc2.stop(time + 2.5);
                };

                const now = ctx.currentTime;
                playNote(now);
                ringInterval.current = setInterval(() => {
                    if (ctx.state === 'closed') return;
                    playNote(ctx.currentTime + 0.2); // slight buffer
                }, 3000);

            } else {
                // Outgoing - Soft Pulse
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, ctx.currentTime);

                // Pulse effect via Gain LFO manually simulated
                const now = ctx.currentTime;
                gain.gain.setValueAtTime(0.05, now);

                // Create a gentle pulse loop manually if LFO is complex
                // Let's use standard LFO for simplicity if supported, or just a simple beep loop but softer
                // Simple soft beep loop:
                const beep = (t) => {
                    gain.gain.cancelScheduledValues(t);
                    gain.gain.setValueAtTime(0, t);
                    gain.gain.linearRampToValueAtTime(0.08, t + 0.2);
                    gain.gain.linearRampToValueAtTime(0.08, t + 0.8);
                    gain.gain.linearRampToValueAtTime(0, t + 1.0);
                };

                beep(now);
                osc.start(now);

                ringInterval.current = setInterval(() => {
                    if (ctx.state === 'closed') return;
                    beep(ctx.currentTime);
                }, 2000);
            }
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
        const msgContent = input; // capture for rollback
        try {
            setInput(''); // Optimistic clear
            setReplyTo(null);

            const payload = { receiver: userId, content: msgContent, message_type: 'text', parent_message: replyTo?.id };
            const res = await api.post('/messages/', payload);

            setMessages(prev => {
                if (prev.some(m => m.id === res.data.id)) return prev;
                return [...prev, res.data];
            });
            setTimeout(scrollToBottom, 50);
        } catch (e) {
            console.error("Send failed", e);
            // If it's a server error (500), the message likely saved but signal failed.
            // Don't restore text to input, just warn.
            // If it's a server error (500) or network glitch, the message likely saved.
            // Suppress "unstable connection" toast to avoid annoying the user.
            if (!e.response || e.response.status >= 500) {
                console.warn("Message sent with warnings:", e);
            } else {
                toast.error("Send failed");
                setInput(msgContent); // Only restore if it was a client/400 error
            }
        }
    };
    const handleReport = async () => { await api.post('/report/', { reported_user: userId, reason: reportReason, explanation: reportExplanation }); setShowReportModal(false); toast.success("User reported"); };
    const handleBlock = async () => { if (window.confirm("Are you sure you want to block this user?")) { await api.post('/block/', { blocked_user: userId }); navigate('/matches'); } };
    const formatLastSeen = (d) => { if (!d) return 'Offline'; const diff = (new Date() - new Date(d)) / 60000; return diff < 60 ? `${Math.floor(diff)}m ago` : 'offline'; };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#eaeff5] z-50 flex flex-col overflow-hidden supports-[height:100dvh]:h-[100dvh]">
            {/* Hidden Audio */}
            <audio ref={remoteAudioRef} autoPlay playsInline style={{ width: 0, height: 0, opacity: 0 }} />

            {/* Header - Fixed & Stable */}
            <header className="shrink-0 h-[60px] px-4 bg-white border-b border-slate-200 shadow-md flex items-center justify-between z-20 safe-top">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors active:scale-95 touch-manipulation">
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer touch-manipulation" onClick={() => navigate(`/profile/${userId}`)}>
                        <div className="relative">
                            <img
                                src={otherUser?.photos?.[0]?.image ? (otherUser.photos[0].image.startsWith('http') ? otherUser.photos[0].image : `http://127.0.0.1:8000${otherUser.photos[0].image}`) : 'https://via.placeholder.com/150'}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shadow-md"
                                alt=""
                            />
                            {partnerStatus?.is_online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-slate-900 leading-tight text-[15px]">{otherUser?.first_name || 'User'}</h3>
                            <span className={`text-[11px] font-bold tracking-wide uppercase ${partnerStatus?.is_typing ? 'text-rose-500 animate-pulse' : partnerStatus?.is_online ? 'text-green-600' : 'text-slate-500'}`}>
                                {partnerStatus?.is_typing ? 'Typing...' : (partnerStatus?.is_online ? 'Active now' : `Seen ${formatLastSeen(partnerStatus?.last_seen)}`)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={startCall} className="p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 touch-manipulation">
                        <Phone size={20} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => toast.info("Video call coming soon!")} className="p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 touch-manipulation">
                        <Video size={20} strokeWidth={2.5} />
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowSafetyMenu(!showSafetyMenu)} className={`p-2.5 rounded-full transition-all active:scale-95 touch-manipulation ${showSafetyMenu ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:text-slate-800"}`}>
                            <MoreVertical size={20} strokeWidth={2.5} />
                        </button>

                        <AnimatePresence>
                            {showSafetyMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute top-12 right-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 origin-top-right py-1.5 ring-1 ring-black/5"
                                >
                                    <button onClick={() => navigate(`/profile/${userId}`)} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-3">
                                        View Profile
                                    </button>
                                    <button onClick={() => { setShowReportModal(true); setShowSafetyMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50 text-orange-500 flex items-center gap-3">
                                        <AlertTriangle size={16} /> Report
                                    </button>
                                    <button onClick={handleBlock} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-red-50 text-red-600 flex items-center gap-3">
                                        <Ban size={16} /> Block User
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Chat Body - Flexible & Scrollable */}
            <div
                className="flex-1 overflow-y-auto w-full px-4 pt-4 pb-2 overscroll-contain touch-pan-y"
                id="chat-container"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)',
                    WebkitOverflowScrolling: 'touch'
                }}
                onScroll={handleScroll}
            >
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 opacity-60">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-md border border-slate-200 transform rotate-3">
                            <Smile size={40} className="text-rose-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-500 font-semibold text-sm tracking-wide">Start the conversation!</p>
                    </div>
                )}

                <div className="space-y-4 pb-8">
                    {messages.map((msg, idx) => {
                        // Handle Call Notifications
                        if (msg.message_type === 'call') {
                            return (
                                <div key={idx} className="flex justify-center my-6 opacity-70">
                                    <div className="bg-slate-200/60 backdrop-blur-sm border border-slate-300 text-slate-600 text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                        <Phone size={12} strokeWidth={2.5} />
                                        <span>{msg.content}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            );
                        }

                        const isMe = msg.sender === parseInt(localStorage.getItem('user_id'));
                        const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender !== msg.sender);

                        return (
                            <motion.div
                                key={idx}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start items-end gap-2.5'} w-full relative`}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={{ left: 0.1, right: 0.7 }}
                                onDragEnd={(e, { offset, velocity }) => {
                                    if (offset.x > 80) {
                                        setReplyTo(msg);
                                        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
                                    }
                                }}
                            >
                                {/* Reply Indicator Icon (shows when dragging) */}
                                <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronLeft size={20} className="rotate-180" />
                                </div>

                                {/* Avatar Removed */}

                                <div className={`relative max-w-[80%] group select-none touch-pan-y`}>
                                    {msg.reply_to && (
                                        <div className="text-[10px] mb-1.5 p-2 rounded-xl bg-black/5 border-l-[3px] border-slate-400 backdrop-blur-sm">
                                            <p className="font-bold text-slate-700">{msg.reply_to.sender}</p>
                                            <p className="truncate text-slate-600 font-medium">{msg.reply_to.content}</p>
                                        </div>
                                    )}

                                    <div className={`
                                        px-4 py-3 text-[15px] leading-relaxed shadow-sm
                                        ${isMe
                                            ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-rose-200/50'
                                            : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 shadow-md shadow-slate-200/40'
                                        }
                                    `}>
                                        {msg.content}
                                    </div>

                                    <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                                        <span className="text-[9px] font-bold text-slate-400">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && (
                                            msg.is_read ? (
                                                <CheckCheck size={14} className="text-blue-500 ml-0.5" strokeWidth={2.5} />
                                            ) : (
                                                <CheckCheck size={14} className="text-slate-300 ml-0.5" strokeWidth={2.5} />
                                            )
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div ref={scrollRef} className="h-1" />
            </div>

            {/* Scroll Button */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={scrollToBottom}
                        className="absolute bottom-28 right-5 bg-white p-3 rounded-full shadow-xl border border-slate-100 text-rose-500 z-20 hover:bg-rose-50 transition-colors"
                    >
                        <ChevronDown size={24} strokeWidth={3} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Input Area - Pinned to Bottom via Flex */}
            <div className="shrink-0 bg-white border-t border-slate-100 pb-safe z-30 relative shadow-[0_-1px_10px_rgba(0,0,0,0.03)] w-full">
                {replyTo && (
                    <div className="flex justify-between items-center mb-0 bg-slate-50 p-2.5 mx-3 mt-2 rounded-xl border border-slate-200">
                        <div className="flex flex-col text-xs">
                            <span className="font-bold text-rose-500 mb-0.5">Replying to message</span>
                            <span className="text-slate-600 font-medium line-clamp-1">{replyTo.content}</span>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"><X size={14} /></button>
                    </div>
                )}

                <div className="flex items-end gap-2.5 p-3 w-full">
                    <button className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-95 shrink-0 touch-manipulation">
                        <ImageIcon size={24} strokeWidth={2} />
                    </button>

                    <div className="flex-1 bg-slate-100/80 hover:bg-slate-100 transition-colors rounded-[24px] px-4 py-2.5 min-h-[50px] flex items-center border border-transparent focus-within:border-rose-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-500/10 focus-within:shadow-sm">
                        <input
                            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-[15px] font-medium min-w-0"
                            placeholder="Message..."
                            value={input}
                            onChange={handleInput}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`p-3.5 rounded-2xl transition-all duration-200 transform shrink-0 touch-manipulation ${input.trim() ? 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 active:scale-95 rotate-3' : 'bg-slate-100 text-slate-300 scale-100'}`}
                    >
                        {input.trim() ? <Send size={22} className="ml-0.5" strokeWidth={2.5} /> : <Mic size={24} strokeWidth={2} />}
                    </button>
                </div>
            </div>

            {/* Call Overlay */}
            <AnimatePresence>
                {callStatus && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                        className="fixed inset-0 z-[60] bg-slate-900 flex flex-col items-center justify-between py-12"
                    >
                        {/* Call UI Content - Kept same as before but ensured full screen */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img src={otherUser?.photos?.[0]?.image ? (otherUser.photos[0].image.startsWith('http') ? otherUser.photos[0].image : `http://127.0.0.1:8000${otherUser.photos[0].image}`) : 'https://via.placeholder.com/150'} className="w-full h-full object-cover opacity-30 blur-3xl scale-125" />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>

                        {/* Top Info */}
                        <div className="relative z-10 flex flex-col items-center mt-12">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-50" />
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative z-10">
                                    <img src={otherUser?.photos?.[0]?.image ? (otherUser.photos[0].image.startsWith('http') ? otherUser.photos[0].image : `http://127.0.0.1:8000${otherUser.photos[0].image}`) : 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight mb-2">{otherUser?.first_name}</h2>
                            <p className="text-rose-200 font-medium tracking-wide animate-pulse">{connectionStep || (callStatus === 'incoming' ? 'Incoming Call...' : 'Calling...')}</p>
                        </div>

                        {/* Controls */}
                        <div className="relative z-10 mb-8 w-full max-w-sm px-8">
                            {callStatus === 'incoming' ? (
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex flex-col items-center gap-2">
                                        <button onClick={disconnectCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-transform active:scale-95">
                                            <PhoneOff size={28} />
                                        </button>
                                        <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Decline</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <button onClick={acceptCall} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-transform active:scale-95 animate-bounce">
                                            <PhoneIncoming size={28} />
                                        </button>
                                        <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Accept</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8 items-center w-full">
                                    <div className="flex gap-6">
                                        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                        </button>
                                        <button className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 backdrop-blur-md pointer-events-none opacity-50">
                                            <Volume2 size={24} />
                                        </button>
                                        <button className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 backdrop-blur-md pointer-events-none opacity-50">
                                            <Video size={24} />
                                        </button>
                                    </div>

                                    <button onClick={disconnectCall} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-600 transition-all transform hover:scale-105 active:scale-95">
                                        <PhoneOff size={32} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                        >
                            <h3 className="font-bold text-xl mb-4 text-slate-800">Report User</h3>
                            <div className="space-y-3 mb-4">
                                {['spam', 'harassment', 'fake', 'other'].map(r => (
                                    <label key={r} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input type="radio" name="reason" value={r} checked={reportReason === r} onChange={(e) => setReportReason(e.target.value)} className="accent-rose-500 w-5 h-5" />
                                        <span className="capitalize font-medium text-slate-700">{r}</span>
                                    </label>
                                ))}
                            </div>
                            <textarea
                                placeholder="Additional details..."
                                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none mb-4"
                                rows={3}
                                value={reportExplanation}
                                onChange={(e) => setReportExplanation(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200">Cancel</button>
                                <button onClick={handleReport} className="flex-1 py-3 bg-red-500 font-bold text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-200">Submit Report</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatWindow;

