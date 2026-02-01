
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Info } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';

const PublicChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('connecting');
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

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        let wsUrl = apiBase.replace('http', 'ws').replace('/api', '') + '/ws/chat/?token=' + token;
        try {
            const url = new URL(apiBase);
            const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${protocol}//${url.host}/ws/chat/?token=${token}`;
        } catch (e) { }

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

        try {
            const res = await api.post('/public-chat/', { content: input });
            setInput('');
            // Optimistic update not needed as WS is fast, but we can do it if desired.
            // But strict validation happens on server (Regex), so better wait for WS or successful post response.
            // Actually, let's wait for WS broadcast to avoid duplication/out-of-order.
        } catch (err) {
            if (err.response?.data?.error) {
                toast.warning(err.response.data.error);
            } else {
                toast.error("Failed to send");
            }
        }
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                <div className="text-center py-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 inline-block px-3 py-1 rounded-full">
                        Welcome to the Public Lounge
                    </p>
                    <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                        This is a global group. Messages are visible to everyone. No images or links allowed.
                    </p>
                </div>

                {messages.map((msg, idx) => {
                    const isMe = msg.sender === parseInt(userId);
                    return (
                        <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                    <span className="text-[10px] font-bold text-slate-500 ml-1 mb-0.5">
                                        {msg.sender_name || 'User'}
                                    </span>
                                )}
                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm break-words
                                    ${isMe
                                            ? 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white rounded-br-none'
                                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 mt-1 mx-1 opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 pb-safe z-30">
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
                <div className="text-center mt-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        Text only • No links • No numbers
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicChat;
