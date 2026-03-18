
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { MessageCircle, Heart, Lock } from 'lucide-react';

const Matches = () => {
    const [activeTab, setActiveTab] = useState('matches'); // matches | received | sent
    const [matches, setMatches] = useState([]);
    const [sentLikes, setSentLikes] = useState([]);
    const [receivedLikes, setReceivedLikes] = useState([]);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMatches();
        fetchSentLikes();
        fetchReceivedLikes();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await api.get('/matches/');
            const uniqueById = Array.from(new Map(res.data.map(item => [item.user_id, item])).values());
            const uniqueMatches = Array.from(new Map(uniqueById.map(item => [item.photo, item])).values());
            setMatches(uniqueMatches);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchSentLikes = async () => {
        try {
            const res = await api.get('/matches/sent/');
            setSentLikes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReceivedLikes = async () => {
        try {
            const res = await api.get('/matches/received/');
            setReceivedLikes(res.data.likes || []);
            setIsPremium(res.data.is_premium || false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#eaeff5]">
            {/* Header */}
            <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-3 bg-white/90 backdrop-blur-2xl sticky top-0 z-10 border-b border-slate-100">
                <h1 className="text-[28px] font-[900] tracking-tight text-slate-900 mb-5">Connections</h1>
                <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-1 shadow-inner gap-1">
                    <button
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(40); setActiveTab('matches'); }}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-95 ${activeTab === 'matches' ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Matches <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'matches' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 text-slate-500'}`}>{matches.length}</span>
                    </button>
                    <button
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(40); setActiveTab('received'); }}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-95 ${activeTab === 'received' ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Likes You <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'received' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 text-slate-500'}`}>{receivedLikes.length}</span>
                    </button>
                    <button
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(40); setActiveTab('sent'); }}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-95 ${activeTab === 'sent' ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Sent <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'sent' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 text-slate-500'}`}>{sentLikes.length}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-28 overscroll-y-contain">
                {activeTab === 'matches' ? (
                    matches.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {matches.map(match => (
                                <div key={match.id} className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-sm group cursor-pointer active:scale-95 transition-transform" onClick={() => navigate(`/chat/${match.user_id}`)}>
                                    <img
                                        src={match.photo ? (match.photo.startsWith('http') ? match.photo : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${match.photo}`) : 'https://via.placeholder.com/150'}
                                        className="w-full h-full object-cover"
                                        alt={match.name}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <p className="font-[800] text-white text-[17px] drop-shadow-md leading-tight">{match.name}</p>
                                        <button className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center shadow-[0_4px_12px_rgba(236,72,153,0.4)] transform transition active:scale-90 shrink-0">
                                            <MessageCircle size={18} fill="white" className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Heart className="text-slate-300" size={40} />
                            </div>
                            <h3 className="font-bold text-slate-600">No matches yet</h3>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-6 px-6 py-2 gradient-bg text-white rounded-full font-bold text-sm"
                            >
                                Start Swiping
                            </button>
                        </div>
                    )
                ) : activeTab === 'received' ? (
                    /* Liked Me (Received) Tab */
                    receivedLikes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {!isPremium && (
                                <div className="col-span-2 bg-gradient-to-r from-orange-100 to-rose-100 p-4 rounded-2xl mb-2 flex items-center justify-between border border-rose-200 shadow-sm">
                                    <div>
                                        <p className="font-black text-rose-600 tracking-tight">See who likes you</p>
                                        <p className="text-[11px] text-rose-500 font-bold mt-0.5">Upgrade to Gold to reveal</p>
                                    </div>
                                    <button onClick={() => navigate('/subscription')} className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[11px] font-black tracking-wide rounded-full shadow-md active:scale-95 transition-transform flex items-center gap-1.5 shrink-0">
                                        <Lock size={12} strokeWidth={3} /> UNLOCK
                                    </button>
                                </div>
                            )}
                            {receivedLikes.map(user => (
                                <div key={user.user_id} className={`relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-sm transition-transform ${isPremium ? 'active:scale-95 cursor-pointer' : 'cursor-pointer'}`} onClick={() => isPremium ? navigate(`/profile/${user.user_id}`) : navigate('/subscription')}>
                                    <img
                                        src={user.photo ? (user.photo.startsWith('http') ? user.photo : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${user.photo}`) : 'https://via.placeholder.com/150'}
                                        className={`w-full h-full object-cover transition-all ${!isPremium ? 'blur-xl scale-125 saturate-200 contrast-125 brightness-110' : ''}`}
                                        alt={isPremium ? user.name : "Someone"}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    
                                    {!isPremium && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
                                                <Heart className="text-white fill-white/80" size={24} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="font-[800] text-white text-[16px] drop-shadow-md">
                                            {isPremium ? `${user.name}, ${user.age || '?'}` : "Someone LIKED you!"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <h3 className="font-bold text-slate-600">No likes yet</h3>
                            <p className="text-slate-400 text-sm mt-1">Keep swiping to get noticed!</p>
                        </div>
                    )
                ) : (
                    /* Sent Likes Tab */
                    sentLikes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {sentLikes.map(user => (
                                <div key={user.user_id} className="relative aspect-[3/4] rounded-[24px] overflow-hidden opacity-90 border-[3px] border-slate-200/50 active:scale-95 transition-transform" onClick={() => navigate(`/profile/${user.user_id}`)}>
                                    <img
                                        src={user.photo ? (user.photo.startsWith('http') ? user.photo : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${user.photo}`) : 'https://via.placeholder.com/150'}
                                        className="w-full h-full object-cover saturate-[50%]"
                                        alt={user.name}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 flex items-center justify-center">
                                        <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[11px] font-black tracking-wider border border-white/40 shadow-xl uppercase">Pending</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="font-[800] text-white text-[16px] drop-shadow-md">{user.name}, {user.age || '?'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <h3 className="font-bold text-slate-600">No pending likes</h3>
                            <p className="text-slate-400 text-sm mt-1">You haven't liked anyone yet.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Matches;
