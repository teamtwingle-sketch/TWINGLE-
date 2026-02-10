import { motion } from 'framer-motion';

const MatchPopup = ({ user, match, onClose, onChat }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-rose-400 to-orange-500 opacity-20" />

                <h2 className="relative text-4xl font-black text-rose-500 font-outfit mb-2 drop-shadow-sm rotate-[-2deg]">It's a Match!</h2>
                <p className="relative text-slate-500 font-medium mb-8">You and {match.name || match.partner_name} liked each other</p>

                <div className="relative flex items-center justify-center gap-4 mb-8">
                    {/* User Photo */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden -rotate-6"
                    >
                        <img
                            src={user.photo || 'https://via.placeholder.com/150'}
                            className="w-full h-full object-cover"
                            alt="You"
                        />
                    </motion.div>
                    {/* Heart Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.4 }}
                        className="absolute z-10 bg-white p-2 rounded-full shadow-lg"
                    >
                        <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={32} />
                    </motion.div>
                    {/* Matched Photo */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden rotate-6"
                    >
                        <img
                            src={(() => {
                                const p = match.photo || match.partner_photo;
                                if (!p) return 'https://via.placeholder.com/150';
                                if (p.startsWith('http')) return p;
                                return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${p}`;
                            })()}
                            className="w-full h-full object-cover"
                            alt={match.name || match.partner_name}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                        />
                    </motion.div>
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

                {/* CSS Confetti */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                    <div className="confetti-piece"></div>
                </div>
                <style>{`
                    .confetti-piece {
                        position: absolute;
                        width: 10px;
                        height: 10px;
                        background: #ffd300;
                        top: 0;
                        opacity: 0;
                    }
                    .confetti-piece:nth-child(1) { left: 7%; transform: rotate(-40deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 182ms; animation-duration: 1116ms; }
                    .confetti-piece:nth-child(2) { left: 14%; transform: rotate(4deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 161ms; animation-duration: 1076ms; }
                    .confetti-piece:nth-child(3) { left: 21%; transform: rotate(-51deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 481ms; animation-duration: 1103ms; }
                    .confetti-piece:nth-child(4) { left: 28%; transform: rotate(61deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 334ms; animation-duration: 708ms; }
                    .confetti-piece:nth-child(5) { left: 35%; transform: rotate(-52deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 302ms; animation-duration: 776ms; }
                    .confetti-piece:nth-child(6) { left: 42%; transform: rotate(38deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 180ms; animation-duration: 1168ms; }
                    .confetti-piece:nth-child(7) { left: 49%; transform: rotate(11deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 395ms; animation-duration: 1200ms; }
                    .confetti-piece:nth-child(8) { left: 56%; transform: rotate(49deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 14ms; animation-duration: 887ms; }
                    .confetti-piece:nth-child(9) { left: 63%; transform: rotate(-72deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 149ms; animation-duration: 805ms; }
                    .confetti-piece:nth-child(10) { left: 70%; transform: rotate(10deg); animation: makeItRain 1000ms infinite ease-out; animation-delay: 351ms; animation-duration: 1059ms; }
                    
                    @keyframes makeItRain {
                        from { opacity: 0; }
                        50% { opacity: 1; }
                        to { transform: translateY(350px); }
                    }
                `}</style>
            </motion.div>
        </motion.div>
    );
};

export default MatchPopup;
