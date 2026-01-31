
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { ChevronLeft, MapPin, MessageCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        ? (photos[currentPhotoIndex].image.startsWith('http') ? photos[currentPhotoIndex].image : `http://127.0.0.1:8000${photos[currentPhotoIndex].image}`)
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
        <div className="min-h-screen bg-slate-50 pb-20 relative">


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
                    <div className="w-1/2 h-full" onClick={prevPhoto}></div>
                    <div className="w-1/2 h-full" onClick={nextPhoto}></div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

                {/* Pagination Dots */}
                {photos.length > 1 && (
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                        {photos.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentPhotoIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
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
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                            {user.first_name} <span className="text-2xl font-medium text-slate-500">{user.age}</span>
                        </h1>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1 font-medium">
                            <MapPin size={16} className="text-rose-500" />
                            <span className="capitalize">{user.district}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/chat/${userId}`)}
                        className="bg-rose-500 text-white p-4 rounded-full shadow-lg shadow-rose-200 hover:bg-rose-600 transition-transform active:scale-90"
                    >
                        <MessageCircle size={24} />
                    </button>
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
