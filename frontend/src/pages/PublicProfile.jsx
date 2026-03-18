
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronLeft, MapPin, MessageCircle, ChevronRight, Check, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get(`/profile/${userId}/`);
                setUser(res.data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleSwipe = async (action) => {
        if (navigator.vibrate) navigator.vibrate(40);
        try {
            const res = await api.post('/swipe/', { target_id: userId, action });
            if (res.data.is_match) {
                toast.success("It's a Match! 💖");
                setUser(prev => ({ ...prev, is_matched: true, has_liked: true }));
            } else if (action === 'like') {
                setUser(prev => ({ ...prev, has_liked: true }));
                toast.success("Like sent! 💘");
            } else {
                toast.info("Passed");
                navigate(-1);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Daily limit reached.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
        </div>
    );

    if (!user) return <div className="p-8 text-center text-slate-500">User not found.</div>;

    const photos = user.photos || [];
    const activePhoto = photos[currentPhotoIndex]
        ? (photos[currentPhotoIndex].image.startsWith('http') ? photos[currentPhotoIndex].image : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}${photos[currentPhotoIndex].image}`)
        : 'https://via.placeholder.com/400x600';

    const nextPhoto = () => {
        if (currentPhotoIndex < photos.length - 1) {
            setCurrentPhotoIndex(prev => prev + 1);
        }
    };

    const prevPhoto = () => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative overflow-x-hidden">
            
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="absolute top-6 left-4 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"><ChevronLeft size={24} strokeWidth={3} /></button>

            {/* Photo Carousel */}
            <div className="relative h-[65vh] w-full bg-slate-900 overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.img
                        key={currentPhotoIndex}
                        src={activePhoto}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover"
                        alt={user.first_name}
                    />
                </AnimatePresence>

                {/* Photo Navigation Overlay */}
                <div className="absolute inset-0 flex">
                    <div className="w-1/2 h-full cursor-pointer" onClick={prevPhoto}></div>
                    <div className="w-1/2 h-full cursor-pointer" onClick={nextPhoto}></div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

                {/* Pagination Dots */}
                {photos.length > 1 && (
                    <div className="absolute top-8 left-0 right-0 flex justify-center gap-1.5 pointer-events-none z-10">
                        {photos.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentPhotoIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Profile Content Sheet */}
            <div className="relative -mt-10 bg-white rounded-t-[2rem] px-6 pt-8 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-[40vh]">
                {/* Name & Age */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            {user.first_name} <span className="text-2xl font-medium text-slate-500">{user.age}</span>
                            {user.is_verified && <div className="bg-blue-500 text-white rounded-full p-1"><Check size={16} strokeWidth={4} /></div>}
                        </h1>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1 font-medium">
                            <MapPin size={16} className="text-rose-500" />
                            <span className="capitalize">{user.district}</span>
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons Floating just above bio */}
                <div className="flex items-center gap-4 mb-8 justify-center mt-2">
                    {user.is_matched ? (
                        <button
                            onClick={() => navigate(`/chat/${userId}`)}
                            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={20} /> MESSAGE NOW
                        </button>
                    ) : user.has_liked ? (
                        <button
                            disabled
                            className="flex-1 bg-slate-100 text-slate-400 py-3.5 rounded-2xl font-black shadow-inner cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            LIKE SENT <Check size={18} strokeWidth={3} />
                        </button>
                    ) : (
                        <div className="flex gap-4 w-full">
                            <button onClick={() => handleSwipe('dislike')} className="flex-1 bg-slate-100 text-slate-500 py-3.5 rounded-2xl font-black hover:bg-slate-200 active:scale-95 transition-all flex justify-center items-center">
                                <X size={24} strokeWidth={3} />
                            </button>
                            <button onClick={() => handleSwipe('like')} className="flex-[2] bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95 transition-all flex justify-center items-center gap-2">
                                <Heart size={20} fill="white" /> LIKE BACK
                            </button>
                        </div>
                    )}
                </div>

                {/* Bio */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">About Me</h3>
                    <p className="text-slate-700 leading-relaxed text-[15px]">{user.bio || 'No bio yet.'}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <InfoCard label="Gender" value={user.gender} />
                    <InfoCard label="Height" value={user.height_cm ? `${user.height_cm} cm` : 'N/A'} />
                    <InfoCard label="Interested In" value={user.interested_in} />
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Looking For</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {user.relationship_intents?.map(i => (
                                <span key={i} className="text-[10px] font-bold bg-white text-rose-500 border border-rose-100 px-2.5 py-1 rounded-full shadow-sm">
                                    {i}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{label}</h3>
        <p className="font-semibold text-slate-800 capitalize">{value}</p>
    </div>
);

export default PublicProfile;
