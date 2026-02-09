import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const MatchPopup = ({ user, match, onClose, onChat }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 text-center shadow-2xl overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-rose-400 to-orange-500 opacity-20" />

                <h2 className="relative text-4xl font-black text-rose-500 font-outfit mb-2 drop-shadow-sm rotate-[-2deg]">It's a Match!</h2>
                <p className="relative text-slate-500 font-medium mb-8">You and {match.name || match.partner_name} liked each other</p>

                <div className="relative flex items-center justify-center gap-4 mb-8">
                    {/* User Photo */}
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden -rotate-6">
                        <img
                            src={user.photo || 'https://via.placeholder.com/150'}
                            className="w-full h-full object-cover"
                            alt="You"
                        />
                    </div>
                    {/* Heart Icon */}
                    <div className="absolute z-10 bg-white p-2 rounded-full shadow-lg">
                        <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={32} />
                    </div>
                    {/* Matched Photo */}
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden rotate-6">
                        <img
                            src={match.photo || match.partner_photo ? ((match.photo || match.partner_photo).startsWith('http') ? (match.photo || match.partner_photo) : `http://127.0.0.1:8000${match.photo || match.partner_photo}`) : 'https://via.placeholder.com/150'}
                            className="w-full h-full object-cover"
                            alt={match.name || match.partner_name}
                        />
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    <button
                        onClick={() => onChat(match.user_id || match.partner_id)}
                        className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={20} />
                        Send a Message
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        Keep Swiping
                    </button>
                </div>

                {/* Confetti Effect (CSS only for simplicity) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Can add confetti library later if needed */}
                </div>
            </div>
        </div>
    );
};

export default MatchPopup;
