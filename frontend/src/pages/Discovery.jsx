
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Undo, Zap, Star, MapPin, Check, MessageCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../api/client';
import { toast } from 'react-toastify';
import MatchPopup from '../components/MatchPopup';

const SwipeCard = ({ user, onSwipe, onTap }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const isDragging = React.useRef(false);

    const handleDragStart = () => {
        isDragging.current = true;
    };

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe(user.user_id, 'like');
        } else if (info.offset.x < -100) {
            onSwipe(user.user_id, 'dislike');
        }

        // Small delay to prevent tap from firing immediately after drag
        setTimeout(() => {
            isDragging.current = false;
        }, 200);
    };

    const handleTap = () => {
        if (!isDragging.current) {
            onTap();
        }
    };
    return (
        <motion.div
            style={{ x, rotate, opacity, position: 'absolute' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTap={handleTap}
            className="absolute inset-0 m-auto w-full max-w-sm h-full max-h-[70vh] cursor-grab active:cursor-grabbing"
        >
            <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                    src={user.photos?.[0] ? (user.photos[0].startsWith('http') ? user.photos[0] : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${user.photos[0]}`) : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'}
                    className="w-full h-full object-cover pointer-events-none"
                    alt={user.first_name}
                    data-testid="swipe-card-img"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x600?text=No+Image'; }}
                />

                {/* Indicators */}
                <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-green-500 rounded-lg px-4 py-2 -rotate-12">
                    <span className="text-green-500 font-black text-4xl uppercase">Like</span>
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-red-500 rounded-lg px-4 py-2 rotate-12">
                    <span className="text-red-500 font-black text-4xl uppercase">Nope</span>
                </motion.div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white pointer-events-none">
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold">{user.first_name || 'Someone'}{user.age ? `, ${user.age}` : ''}</h2>
                        {user.is_verified && <div className="bg-blue-500 text-white rounded-full p-1"><Check size={14} strokeWidth={4} /></div>}
                    </div>
                    <div className="flex items-center gap-1 text-slate-200 mt-1">
                        <MapPin size={16} />
                        <span className="text-sm">{user.district || 'Kerala'} district</span>
                    </div>
                    <p className="mt-2 text-sm line-clamp-2 text-slate-300 italic">
                        "{user.bio || 'Seeking a meaningful connection...'}"
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const Discovery = ({ onMatch: propOnMatch }) => {
    const { onMatch: contextOnMatch } = useOutletContext() || {};
    const onMatch = propOnMatch || contextOnMatch;
    const [users, setUsers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [profileCompleted, setProfileCompleted] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [matchData, setMatchData] = useState(null); // { match_details }
    const [myProfile, setMyProfile] = useState(null); // To show my photo in popup

    useEffect(() => {
        checkProfile();
        fetchDiscovery();
    }, []);

    const checkProfile = async () => {
        try {
            const res = await api.get('/profile/');
            const p = res.data;
            setMyProfile({
                photo: p.photos?.[0]?.image ? (p.photos[0].image.startsWith('http') ? p.photos[0].image : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${p.photos[0].image}`) : 'https://via.placeholder.com/150'
            });

            if (!p.gender || !p.dob || !p.relationship_intents?.length || !p.photos?.length) {
                setProfileCompleted(false);
                toast.warning("Please complete your profile to start matching!");
                setTimeout(() => window.location.href = '/profile-setup', 1500);
            }
        } catch (err) { }
    };

    const fetchDiscovery = async () => {
        try {
            const res = await api.get('/discovery/');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSwipe = async (targetId, action) => {
        try {
            const res = await api.post('/swipe/', { target_id: targetId, action });
            if (res.data.is_match) {
                toast.success("It's a Match! 💖");
                // Show Popup via global context function OR event dispatch
                if (onMatch) {
                    onMatch(res.data.match_details);
                } else {
                    // Fallback for when rendered as children (AppLayout prop)
                    window.dispatchEvent(new CustomEvent('trigger-new-match', { detail: res.data.match_details }));
                }
            }
            setCurrentIndex(prev => prev + 1);
        } catch (err) {
            if (err.response?.status === 403) {
                toast.info(err.response.data.error);
            }
        }
    };

    const handleUndo = async () => {
        try {
            const res = await api.post('/swipe/undo/');
            toast.success("Undone!");
            // Refresh to bring back the user
            fetchDiscovery();
            setCurrentIndex(0);
        } catch (err) {
            toast.error(err.response?.data?.error || "Cannot undo");
        }
    };

    const handleButtonSwipe = (action) => {
        if (users.length <= currentIndex) return;
        const target = users[currentIndex];
        handleSwipe(target.user_id, action);
    };

    if (loading) return <div className="flex-1 flex items-center justify-center font-bold text-slate-400">Finding matches...</div>;
    if (!profileCompleted) return <div className="flex-1 flex items-center justify-center font-bold text-slate-400">Redirecting to profile setup...</div>;

    const currentBatch = users.slice(currentIndex, currentIndex + 2).reverse();

    return (
        <div className="flex-1 flex flex-col p-4 w-full h-full relative overflow-hidden">
            {/* Match Popup */}
            {/* Match Popup is now handled globally in AppLayout */}

            {/* SEO Heading */}
            <h1 className="sr-only">Twingle - The No. 1 Mallu Dating App for Malayalis | Best Malayalam Dating Site</h1>

            <div className="flex-1 relative w-full flex items-center justify-center my-4">
                {users.length > currentIndex ? (
                    <AnimatePresence>
                        {currentBatch.map((user, idx) => (
                            <SwipeCard
                                key={user.user_id}
                                user={user}
                                onSwipe={handleSwipe}
                                onTap={() => setSelectedUser(user)}
                            />
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="text-center p-8 glass rounded-3xl">
                        <div className="text-brand-primary text-6xl mb-4">📍</div>
                        <h3 className="text-xl font-bold">No more profiles nearby</h3>
                        <p className="text-slate-500 mt-2">Try expanding your radius or wait for new users.</p>
                        <button
                            onClick={() => { setCurrentIndex(0); fetchDiscovery(); }}
                            className="mt-6 text-brand-primary font-bold hover:underline"
                        >
                            Refresh
                        </button>
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div className="h-24 shrink-0 flex items-center justify-center gap-6 pb-4">
                <button
                    onClick={handleUndo}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg text-yellow-500 active:scale-95 transition-transform"
                >
                    <Undo size={20} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => handleButtonSwipe('dislike')}
                    className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-red-500 text-red-500 bg-white shadow-xl transform active:scale-90 transition-transform hover:bg-red-50 touch-manipulation"
                >
                    <X size={32} strokeWidth={3} />
                </button>
                <button
                    onClick={() => handleButtonSwipe('like')}
                    className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-green-500 text-green-500 bg-white shadow-xl transform active:scale-90 transition-transform hover:bg-green-50 touch-manipulation"
                >
                    <Heart size={32} fill="currentColor" />
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg text-purple-500 active:scale-95 transition-transform">
                    <Zap size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl p-6 overflow-y-auto"
                    >
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500"
                        >
                            <X />
                        </button>
                        <div className="mt-8">
                            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mb-6">
                                <img
                                    src={selectedUser.photos?.[0] ? (selectedUser.photos[0].startsWith('http') ? selectedUser.photos[0] : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${selectedUser.photos[0]}`) : ''}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x600?text=No+Image'; }}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-3xl font-black text-slate-900">{selectedUser.first_name}, {selectedUser.age}</h2>
                                {selectedUser.is_verified && <div className="bg-blue-500 text-white rounded-full p-1"><Check size={16} strokeWidth={4} /></div>}
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 font-medium mt-1">
                                <MapPin size={18} />
                                <span className="capitalize">{selectedUser.district}</span>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-bold text-slate-900 mb-2">About</h3>
                                <p className="text-slate-600 leading-relaxed text-lg italic">
                                    "{selectedUser.bio}"
                                </p>
                            </div>

                            {/* Basic Details only as per requirements for Discovery */}
                            <div className="mt-8 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                                <p className="text-center text-sm font-semibold text-brand-primary">
                                    Match with {selectedUser.first_name} to see full profile!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Discovery;
