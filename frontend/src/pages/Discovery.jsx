
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Undo, Zap, Star, MapPin } from 'lucide-react';
import api, { getPhotoUrl } from '../api/client';
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
            className="w-full max-w-md aspect-[3/4] cursor-grab active:cursor-grabbing"
        >
            <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                    src={getPhotoUrl(user.photos?.[0])}
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
        <div
            className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full min-h-[70vh] relative overflow-hidden"
            style={{
                backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(254,60,114,0.1) 0%, transparent 40%)'
            }}
        >
            <div className="relative w-full aspect-[3/4] max-h-[70vh] flex items-center justify-center">
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
                    <div className="text-center p-8 glass rounded-3xl mx-4">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">📍</div>
                        <h3 className="text-xl font-bold text-slate-800">No more profiles nearby</h3>
                        <p className="text-slate-500 mt-2 font-medium">Try expanding your radius or wait for new users.</p>
                        <button
                            onClick={() => { setCurrentIndex(0); fetchDiscovery(); }}
                            className="mt-6 flex items-center gap-2 mx-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl active:scale-95 transition-transform"
                        >
                            <Undo size={16} /> Check Again
                        </button>
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            {users.length > currentIndex && (
                <div className="mt-8 flex items-center justify-center gap-8 pb-4">
                    <button
                        onClick={() => handleButtonSwipe('dislike')}
                        className="w-16 h-16 flex items-center justify-center rounded-full border border-slate-200 text-red-500 bg-white shadow-xl shadow-red-100/50 transform active:scale-90 transition-transform"
                    >
                        <X size={32} strokeWidth={3} />
                    </button>

                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 transform active:scale-90 transition-transform">
                        <Zap size={20} fill="currentColor" />
                    </button>

                    <button
                        onClick={() => handleButtonSwipe('like')}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-300 transform active:scale-90 transition-transform"
                    >
                        <Heart size={32} fill="currentColor" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Discovery;
