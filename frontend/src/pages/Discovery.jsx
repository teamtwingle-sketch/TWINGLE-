
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Undo, Zap, Star, MapPin } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';

const SwipeCard = ({ user, onSwipe }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe(user.user_id, 'like');
        } else if (info.offset.x < -100) {
            onSwipe(user.user_id, 'dislike');
        }
    };

    return (
        <motion.div
            style={{ x, rotate, opacity, position: 'absolute' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 m-auto w-full max-w-sm h-full max-h-[70vh] cursor-grab active:cursor-grabbing"
        >
            <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                    src={user.photos?.[0] ? (user.photos[0].startsWith('http') ? user.photos[0] : `http://127.0.0.1:8000${user.photos[0]}`) : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'}
                    className="w-full h-full object-cover pointer-events-none"
                    alt={user.first_name}
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

const Discovery = () => {
    const [users, setUsers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const [profileCompleted, setProfileCompleted] = useState(true);

    useEffect(() => {
        checkProfile();
        fetchDiscovery();
    }, []);

    const checkProfile = async () => {
        try {
            const res = await api.get('/profile/');
            // Check mandatory fields: Gender, DOB, Intent, Photos
            const p = res.data;
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
                toast.success("It's a Match! 🎉", {
                    position: "top-center",
                    autoClose: 5000,
                });
            }
            setCurrentIndex(prev => prev + 1);
        } catch (err) {
            if (err.response?.status === 403) {
                toast.info(err.response.data.error);
            }
        }
    };

    const handleButtonSwipe = (action) => {
        if (users.length <= currentIndex) return;
        const target = users[currentIndex]; // The one currently at the index is the one being viewed?
        // Wait, slice logic: [currentIndex, currentIndex+2]. Reverse.
        // If users=[A, B, C], index=0. Slice=[A, B]. Reverse=[B, A].
        // A is at bottom of map (rendered last => on top). 
        // A is users[0].
        // So yes, users[currentIndex] is the target.
        handleSwipe(target.user_id, action);
    };

    if (loading) return <div className="flex-1 flex items-center justify-center font-bold text-slate-400">Finding matches...</div>;
    if (!profileCompleted) return <div className="flex-1 flex items-center justify-center font-bold text-slate-400">Redirecting to profile setup...</div>;

    const currentBatch = users.slice(currentIndex, currentIndex + 2).reverse();

    return (
        <div className="flex-1 flex flex-col p-4 w-full h-full relative overflow-hidden">
            {/* SEO Heading */}
            <h1 className="sr-only">Twingle - The Best Mallu Dating App for Malayalis | Number One Malayalam Dating Site</h1>

            <div className="flex-1 relative w-full flex items-center justify-center my-4">
                {users.length > currentIndex ? (
                    <AnimatePresence>
                        {currentBatch.map((user, idx) => (
                            <SwipeCard
                                key={user.user_id}
                                user={user}
                                onSwipe={handleSwipe}
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
            <div className="h-24 shrink-0 flex items-center justify-center gap-8 pb-4">
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
            </div>
        </div>
    );
};

export default Discovery;
