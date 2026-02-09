
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { MessageCircle, Heart } from 'lucide-react';

const Matches = () => {
    const [activeTab, setActiveTab] = useState('matches'); // matches | sent
    const [matches, setMatches] = useState([]);
    const [sentLikes, setSentLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMatches();
        fetchSentLikes();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await api.get('/matches/');
            // Deduplicate matches based on user_id to prevent duplicates in UI
            const uniqueMatches = Array.from(new Map(res.data.map(item => [item.user_id, item])).values());
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

    return (
        <div className="flex flex-col h-full bg-[#eaeff5]">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 bg-white sticky top-0 z-10">
                <h1 className="text-2xl font-black text-slate-800 mb-4">Connections</h1>
                <div className="flex p-1 bg-slate-100 rounded-xl mb-2">
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'matches' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                    >
                        Matches <span className="ml-1 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full">{matches.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                    >
                        Sent <span className="ml-1 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full">{sentLikes.length}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-24">
                {activeTab === 'matches' ? (
                    matches.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {matches.map(match => (
                                <div key={match.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group cursor-pointer" onClick={() => navigate(`/chat/${match.user_id}`)}>
                                    <img
                                        src={match.photo ? (match.photo.startsWith('http') ? match.photo : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${match.photo}`) : 'https://via.placeholder.com/150'}
                                        className="w-full h-full object-cover"
                                        alt={match.name}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 text-white">
                                        <p className="font-bold">{match.name}</p>
                                        <button className="mt-2 w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                                            <MessageCircle size={16} fill="white" />
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
                ) : (
                    /* Sent Likes Tab */
                    sentLikes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {sentLikes.map(user => (
                                <div key={user.user_id} className="relative aspect-[3/4] rounded-2xl overflow-hidden grayscale-[50%] opacity-90 border-2 border-slate-200" onClick={() => navigate(`/profile/${user.user_id}`)}>
                                    <img
                                        src={user.photo ? (user.photo.startsWith('http') ? user.photo : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${user.photo}`) : 'https://via.placeholder.com/150'}
                                        className="w-full h-full object-cover"
                                        alt={user.name}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/30">Pending</span>
                                    </div>
                                    <div className="absolute bottom-3 left-3">
                                        <p className="font-bold text-white drop-shadow-md">{user.name}, {user.age}</p>
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
