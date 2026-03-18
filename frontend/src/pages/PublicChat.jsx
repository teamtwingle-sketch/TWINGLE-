
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Info, X, Reply } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const PublicChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('connecting');
    const [replyTo, setReplyTo] = useState(null);
    const scrollRef = useRef(null);
    const userId = localStorage.getItem('user_id');
    const wsRef = useRef(null);

    useEffect(() => {
        fetchHistory();
        connectWS();
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    useEffect(() => scrollToBottom(), [messages]);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/public-chat/');
            if (Array.isArray(res.data)) {
                setMessages(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const connectWS = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        let wsUrl;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

        try {
            if (apiBase.startsWith('http')) {
                const url = new URL(apiBase);
                const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                wsUrl = `${protocol}//${url.host}/ws/chat/?token=${token}`;
            } else {
                // Handle relative path (e.g., /api)
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                wsUrl = `${protocol}//${window.location.host}/ws/chat/?token=${token}`;
            }
        } catch (e) {
            console.error("WebSocket URL Construction Failed:", e);
            wsUrl = `ws://localhost:8000/ws/chat/?token=${token}`;
        }

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setStatus('connected');
        ws.onclose = () => setStatus('disconnected');
        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'public_message') {
                const msg = data.message;
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
            }
        };
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const tempMsg = {
            id: Date.now(),
            content: input,
            sender: parseInt(userId),
            sender_name: 'Me',
            timestamp: new Date().toISOString(),
            reply_to: replyTo ? {
                id: replyTo.id,
                sender_name: replyTo.sender_name,
                content: replyTo.content
            } : null
        };

        const payload = {
            content: input,
            parent_message: replyTo ? replyTo.id : null
        };

        try {
            setInput('');
            setReplyTo(null); // Clear reply
            setMessages(prev => [...prev, tempMsg]); // Optimistic Add

            const res = await api.post('/public-chat/', payload);

            // Replace temp message with real one from server
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data : m));
        } catch (err) {
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            if (err.response?.data?.error) {
                toast.warning(err.response.data.error);
            } else {
                toast.error("Failed to send");
            }
            setInput(tempMsg.content);
        }
    };

    const handleSwipeReply = (msg) => {
        setReplyTo(msg);
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(50);
    };

    return (
        <div className="flex flex-col h-full bg-[#eaeff5] relative">
            {/* Header */}
            <header className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Users className="text-brand-primary" size={24} />
                        Public Lounge
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                        {status === 'connected' ? 'Live Community Chat' : 'Connecting...'}
                    </p>
                </div>
                <button
                    onClick={() => toast.info("Welcome to the Public Lounge! No photos, links, or phone numbers allowed. Keep it safe & fun!", { icon: <Info size={18} /> })}
                    className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                >
                    <Info size={20} />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                <div className="text-center py-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 inline-block px-3 py-1 rounded-full">
                        Welcome to the Public Lounge
                    </p>
                    <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                        This is a global group. Messages are visible to everyone. No images or links allowed. Swipe right to reply.
                    </p>
                </div>

                {messages.map((msg, idx) => (
                    <SwipeableMessage
                        key={msg.id || idx}
                        msg={msg}
                        isMe={msg.sender === parseInt(userId)}
                        onReply={handleSwipeReply}
                    />
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
                {/* Reply Preview */}
                <AnimatePresence>
                    {replyTo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Reply size={20} className="text-brand-primary shrink-0" />
                                <div className="border-l-2 border-brand-primary pl-3">
                                    <p className="text-xs font-bold text-brand-primary">
                                        Replying to {replyTo.sender_name || 'User'}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                        {replyTo.content}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-slate-200 rounded-full">
                                <X size={16} className="text-slate-500" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-3 pb-safe">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-[2rem] px-2 py-2 pr-2 border border-transparent focus-within:border-brand-primary/30 focus-within:bg-white focus-within:shadow-md transition-all">
                        <input
                            className="flex-1 bg-transparent border-none outline-none px-4 text-slate-800 placeholder:text-slate-400 font-medium h-[44px]"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all transform active:scale-95 ${input.trim()
                                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20'
                                : 'bg-slate-200 text-slate-400'
                                }`}
                        >
                            <Send size={20} className={input.trim() ? 'ml-0.5' : ''} />
                        </button>
                    </div>
                </div>
                <div className="text-center pb-2 bg-white">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        Text only • Swipe to reply
                    </p>
                </div>
            </div>
        </div>
    );
};

const SwipeableMessage = ({ msg, isMe, onReply }) => {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 50], [0, 1]);
    const xInput = [0, 50]; // Input range for opacity

    return (
        <div className={`relative flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
            {/* Reply Icon Background Layer */}
            <motion.div
                style={{ opacity, x: 20 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-0 text-slate-400"
            >
                <Reply size={20} />
            </motion.div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                    if (info.offset.x > 50) {
                        onReply(msg);
                    }
                }}
                style={{ x }}
                className={`flex flex-col max-w-[85%] z-10 relative cursor-grab active:cursor-grabbing ${isMe ? 'items-end' : 'items-start'}`}
            >
                {!isMe && (
                    <span className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5">
                        {msg.sender_name || 'User'}
                    </span>
                )}

                <div
                    className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm break-words relative w-full
                    ${isMe
                            ? 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                        }`}
                >
                    {/* Render Reply Context if exists */}
                    {msg.reply_to && (
                        <div className={`mb-2 text-xs border-l-2 pl-2 rounded py-1 ${isMe ? 'border-white/50 bg-white/10' : 'border-brand-primary/50 bg-slate-50'}`}>
                            <span className={`font-bold block ${isMe ? 'text-white/90' : 'text-brand-primary'}`}>
                                {msg.reply_to.sender_name}
                            </span>
                            <span className={`block truncate ${isMe ? 'text-white/70' : 'text-slate-500'}`}>
                                {msg.reply_to.content}
                            </span>
                        </div>
                    )}

                    {msg.content}
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 mx-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </motion.div>
        </div>
    );
};

export default PublicChat;
