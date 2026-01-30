
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { MessageCircle, Heart } from 'lucide-react';

const Matches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await api.get('/matches/');
            setMatches(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="p-6 pb-24 h-full">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Your Matches</h1>

            {matches.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {matches.map(match => (
                        <div key={match.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group cursor-pointer" onClick={() => navigate(`/chat/${match.user_id}`)}>
                            <img src={match.photo ? (match.photo.startsWith('http') ? match.photo : `http://127.0.0.1:8000${match.photo}`) : 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
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
                    <p className="text-slate-400 text-sm mt-1">Keep swiping to find someone special!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2 gradient-bg text-white rounded-full font-bold text-sm"
                    >
                        Start Swiping
                    </button>
                </div>
            )}
        </div>
    );
};

export default Matches;
