
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getPhotoUrl } from '../api/client';
import { toast } from 'react-toastify';
import { Search, MoreHorizontal, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();
    const prevChatsRef = useRef([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchChats = async () => {
        try {
            const res = await api.get('/chats/');
            const newChats = res.data;

            // Notify new messages
            newChats.forEach(nc => {
                const old = prevChatsRef.current.find(oc => oc.user_id === nc.user_id);
                if (nc.unread_count > (old?.unread_count || 0)) {
                    toast.info(`New message from ${nc.name}`, { icon: '💬' });
                }
            });

            setChats(newChats);
            prevChatsRef.current = newChats;
        } catch (err) {
            console.error(err);
        }
    };

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 bg-white min-h-full">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-10 px-6 pt-6 pb-4 border-b border-slate-50">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Messages</h1>
                    <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search matches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="pb-20">
                {filteredChats.map((chat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={chat.user_id}
                        onClick={() => navigate(`/chat/${chat.user_id}`)}
                        className="px-6 py-4 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-none group"
                    >
                        <div className="relative">
                            <img
                                src={getPhotoUrl(chat.photo)}
                                className="w-16 h-16 rounded-full object-cover bg-slate-100 ring-2 ring-white shadow-sm group-hover:ring-rose-100 transition-all"
                                alt=""
                            />
                            {/* Online Status Dot (Simulated for now if not in data, or use unread indicator logic) */}
                            {chat.unread_count > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-white"></span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-lg text-slate-800 truncate">{chat.name}</h3>
                                <span className={`text-[11px] font-bold uppercase tracking-wide ${chat.unread_count > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {chat.time ? new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <p className={`text-sm truncate leading-relaxed ${chat.unread_count > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                                    {chat.last_msg}
                                </p>
                                {chat.unread_count > 0 && (
                                    <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-bold rounded-full shadow-sm shadow-rose-200">
                                        {chat.unread_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredChats.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-32 px-10 text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-50 transform -rotate-3">
                        <MessageCircle size={40} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No conversations yet</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Match with new people to start chatting with them!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all text-sm tracking-wide"
                    >
                        START DISCOVERING
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatList;
