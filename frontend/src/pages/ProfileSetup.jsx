import React, { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Camera, Save, LogOut, ChevronDown, X, Download, Check, Clock, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

const ProfileSetup = () => {
    const [profile, setProfile] = useState({
        first_name: '',
        dob: '',
        gender: 'male',
        interested_in: 'female',
        district: 'ernakulam',
        bio: '',
        relationship_intents: [],
        height_cm: '',
        relationship_intents: [],
        height_cm: '',
        photos: [],
        verification_attempts: 0 // New field to track attempts
    });
    const [loading, setLoading] = useState(true);

    // Camera Logic
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            streamRef.current = stream;

            // Small delay to ensure ref is attached
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            toast.error("Camera access denied or not available");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                setCapturedImage(blob);
                stopCamera();
            }, 'image/jpeg', 0.8);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    const submitVerification = async () => {
        if (!capturedImage) return;

        // Check Monthly Limit (3 attempts)
        const localAttempts = JSON.parse(localStorage.getItem('verification_attempts') || '{"count": 0}');
        // Use backend count if available, otherwise fallback to local
        const currentCount = profile.verification_attempts || localAttempts.count;

        if (currentCount >= 3) {
            toast.error("Monthly verification limit reached (3 attempts). Please try again next month.");
            setCapturedImage(null); // Reset captured image
            setIsCameraOpen(false); // Close camera interface
            return;
        }

        const formData = new FormData();
        formData.append('image', capturedImage, 'verification_live.jpg');

        try {
            const toastId = toast.loading("Uploading verification...");
            await api.post('/verification/request/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.update(toastId, { render: "Verification requested!", type: "success", isLoading: false, autoClose: 3000 });

            // Update Local Count
            const currentMonth = new Date().toISOString().slice(0, 7);
            const newCount = (localAttempts.count || 0) + 1;
            localStorage.setItem('verification_attempts', JSON.stringify({ month: currentMonth, count: newCount }));

            fetchProfile();
            setCapturedImage(null);
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.error || "Failed to upload.");
        }
    };

    useEffect(() => {
        fetchProfile();

        // Cleanup camera on unmount
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile/');
            setProfile({
                ...res.data,
                gender: res.data.gender || 'male',
                interested_in: res.data.interested_in || 'female',
                district: res.data.district || 'ernakulam',
                relationship_intents: Array.isArray(res.data.relationship_intents) ? res.data.relationship_intents : [],
                photos: res.data.photos || [],
                verification_attempts: res.data.verification_attempts || 0
            });

            // Sync with local storage for extra safety if backend doesn't persist
            const localAttempts = JSON.parse(localStorage.getItem('verification_attempts') || '{}');
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            if (localAttempts.month !== currentMonth) {
                localStorage.setItem('verification_attempts', JSON.stringify({ month: currentMonth, count: 0 }));
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile.first_name) return toast.error('First Name is required');
        if (!profile.gender) return toast.error('Gender is required');
        if (!profile.dob) return toast.error('Date of Birth is required');

        // Age Check
        const birthDate = new Date(profile.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            return toast.error("You must be at least 18 years old to use Twingle.");
        }
        if (!profile.relationship_intents || profile.relationship_intents.length === 0) return toast.error('Select at least one intent');
        if (profile.photos && profile.photos.length === 0) return toast.warning('Please add a photo to start matching!');

        // Sanitize data before sending (Do not send Image URLs or read-only fields back to DRF as JSON)
        const payload = {
            first_name: profile.first_name,
            dob: profile.dob,
            gender: profile.gender,
            interested_in: profile.interested_in,
            district: profile.district,
            bio: profile.bio,
            relationship_intents: profile.relationship_intents,
            height_cm: profile.height_cm === '' ? null : profile.height_cm,
        };

        try {
            await api.patch('/profile/', payload);
            toast.success('Profile updated successfully!');
        } catch (err) {
            console.error("Profile update error:", err);
            const errorMsg = err.response?.data ?
                Object.values(err.response.data).flat().join(', ') :
                'Failed to update profile';
            toast.error(errorMsg || 'Failed to update profile');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user_id');
        window.location.href = '/';
    };

    const toggleIntent = (intent) => {
        setProfile(prev => ({
            ...prev,
            relationship_intents: prev.relationship_intents.includes(intent)
                ? prev.relationship_intents.filter(i => i !== intent)
                : [...prev.relationship_intents, intent]
        }));
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
    );

    return (
        <div className="bg-[#eaeff5] min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 pt-safe flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 font-outfit tracking-tight">Edit Profile</h1>
                    <p className="text-xs font-semibold text-slate-500 tracking-wide">Customize your public card</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (window.confirm("Are you sure you want to PERMANENTLY delete your account? This action cannot be undone.")) {
                                try {
                                    await api.delete('/auth/delete/');
                                    localStorage.clear();
                                    window.location.href = '/';
                                } catch (e) { toast.error("Failed to delete account"); }
                            }
                        }}
                        className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 active:scale-95 transition-all"
                        title="Delete Account"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2.5 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        <LogOut size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="p-5 pb-32 space-y-8 max-w-lg mx-auto">

                {/* Photos Section */}
                <section>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Profile Photos</label>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 snap-x snap-mandatory scrollbar-hide">
                        {/* Add Photo Button (First if photos exist, to encourage adding more) */}
                        {(!profile.photos || profile.photos.length < 6) && (
                            <div className="relative flex-shrink-0 w-[100px] h-[140px] bg-white rounded-3xl border-2 border-dashed border-brand-primary/30 flex flex-col items-center justify-center gap-2 shadow-sm text-brand-primary snap-center active:scale-95 transition-transform overflow-hidden group">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (file.size > 15 * 1024 * 1024) return toast.error("Image size must be less than 15MB");
                                        
                                        const toastId = toast.loading("Compressing & Uploading...");
                                        try {
                                            const compressedFile = await compressImage(file);
                                            const formData = new FormData();
                                            formData.append('image', compressedFile);
                                            formData.append('is_primary', (!profile.photos || profile.photos.length === 0));

                                            await api.post('/photos/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                            fetchProfile();
                                            toast.update(toastId, { render: "Successfully uploaded", type: "success", isLoading: false, autoClose: 1500 });
                                        } catch (err) {
                                            toast.update(toastId, { render: "Upload failed", type: "error", isLoading: false, autoClose: 1500 });
                                        }
                                    }}
                                />
                                <div className="p-3 bg-brand-primary/10 rounded-full group-hover:bg-brand-primary/20 transition-colors">
                                    <Camera size={22} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold uppercase">Add New</span>
                            </div>
                        )}

                        {profile.photos?.map((photo) => (
                            <div key={photo.id} className="relative flex-shrink-0 w-[100px] h-[140px] rounded-3xl overflow-hidden shadow-md snap-center border-2 border-white">
                                <img src={photo.image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Remove this photo?")) return;
                                            try { await api.delete(`/photos/${photo.id}/`); fetchProfile(); } catch (err) { toast.error('Failed to delete'); }
                                        }}
                                        className="bg-red-500 text-white p-1.5 rounded-full shadow-lg active:scale-95"
                                    >
                                        <LogOut size={12} className="rotate-180" />
                                    </button>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Delete photo?")) return;
                                        try { await api.delete(`/photos/${photo.id}/`); fetchProfile(); } catch (err) { }
                                    }}
                                    className="absolute top-1 right-1 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Personal Details */}
                <section className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100 space-y-6">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                            Basic Info
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5 block">Display Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 px-5 py-4 rounded-xl text-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:font-normal"
                                    placeholder="Your Name"
                                    value={profile.first_name}
                                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5 block">Gender</label>
                                    <select
                                        className="w-full bg-slate-50 px-5 py-4 rounded-xl text-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none"
                                        value={profile.gender || 'male'}
                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-[42px] text-slate-400 pointer-events-none" size={16} />
                                </div>

                                <div className="relative">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5 block">Looking For</label>
                                    <select
                                        className="w-full bg-slate-50 px-5 py-4 rounded-xl text-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none"
                                        value={profile.interested_in || 'female'}
                                        onChange={(e) => setProfile({ ...profile, interested_in: e.target.value })}
                                    >
                                        <option value="female">Women</option>
                                        <option value="male">Men</option>
                                        <option value="all">Everyone</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-[42px] text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5 block">Birthday</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 px-5 py-4 rounded-xl text-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    value={profile.dob}
                                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5 block">Location (District)</label>
                                <select
                                    className="w-full bg-slate-50 px-5 py-4 rounded-xl text-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none capitalize"
                                    value={profile.district}
                                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                                >
                                    {[
                                        "alappuzha", "ernakulam", "idukki", "kannur", "kasaragod",
                                        "kollam", "kottayam", "kozhikode", "malappuram", "palakkad",
                                        "pathanamthitta", "thiruvananthapuram", "thrissur", "wayanad"
                                    ].map(d => (
                                        <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-[42px] text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5 block">Height (cm)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 175"
                                    className="w-full bg-slate-50 px-5 py-4 rounded-xl text-slate-800 font-bold border-none outline-none focus:ring-2 focus:ring-brand-primary/20 placeholder:font-normal"
                                    value={profile.height_cm || ''}
                                    onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Verification Section */}
                <section className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Verification
                    </h2>

                    {profile.is_verified ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Check size={20} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="font-bold">You are Verified!</h3>
                                <p className="text-xs opacity-80">Your blue tick is active.</p>
                            </div>
                        </div>
                    ) : profile.verification_status === 'pending' ? (
                        <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold">Verification Pending</h3>
                                <p className="text-xs opacity-80">We are reviewing your request.</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-slate-500 mb-4">
                                Get a Blue Tick! Take a selfie showing your face and <b>waving "Hi"</b> with your hand. <br />
                                <span className="text-xs font-bold text-slate-400 uppercase">Premium Users Only</span>
                            </p>

                            {profile.is_premium ? (
                                <div className="flex flex-col gap-4">
                                    {/* Camera Interface */}
                                    {isCameraOpen ? (
                                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] flex flex-col items-center justify-center">
                                            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                                            <canvas ref={canvasRef} className="hidden" />

                                            <div className="absolute top-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full z-20">
                                                <p className="text-white text-xs font-bold">Wave "Hi" with your hand! 👋</p>
                                            </div>

                                            <div className="absolute bottom-4 flex gap-4 z-20">
                                                <button onClick={stopCamera} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                                                    <X size={24} />
                                                </button>
                                                <button onClick={capturePhoto} className="p-4 bg-white rounded-full text-brand-primary shadow-lg border-4 border-white/50">
                                                    <Camera size={32} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : capturedImage ? (
                                        <div className="space-y-4">
                                            <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                                                {/* Display Blob Preview */}
                                                <img src={URL.createObjectURL(capturedImage)} className="w-full h-full object-cover" alt="Preview" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={retakePhoto} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">
                                                    Retake
                                                </button>
                                                <button onClick={submitVerification} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200">
                                                    Submit
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={startCamera}
                                            className="w-full py-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl text-blue-600 font-bold flex flex-col items-center gap-2 hover:bg-blue-100 transition-colors"
                                        >
                                            <div className="p-3 bg-white rounded-full shadow-sm">
                                                <Camera size={24} />
                                            </div>
                                            <span>Take Selfie (Face + Hand Wave 👋)</span>
                                            <span className="text-xs font-normal opacity-70">Live camera only</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <Link to="/subscription" className="block w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-center rounded-xl shadow-lg shadow-orange-200">
                                    Upgrade to Premium to Verify
                                </Link>
                            )}
                        </div>
                    )}
                </section>

                {/* Bio Section */}
                <section className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        About You
                    </h2>
                    <textarea
                        rows="4"
                        className="w-full bg-slate-50 px-5 py-4 rounded-xl text-slate-800 border-none outline-none focus:ring-2 focus:ring-brand-primary/20 text-[15px] leading-relaxed"
                        placeholder="Write something interesting about yourself..."
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    ></textarea>
                </section>

                {/* Intent Section */}
                <section className="bg-white rounded-[2rem] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Relationship Goals <span className="text-rose-500">*</span>
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                        {['Marriage', 'Serious Dating', 'Friendship', 'Situationship', 'Casual'].map(intent => (
                            <button
                                key={intent}
                                onClick={() => toggleIntent(intent)}
                                className={`px-5 py-3 rounded-xl text-sm font-bold border transition-all active:scale-95 touch-manipulation shadow-sm ${profile.relationship_intents && profile.relationship_intents.includes(intent)
                                    ? 'bg-gradient-to-br from-rose-500 to-red-500 border-transparent text-white shadow-rose-200 shadow-md'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200'
                                    }`}
                            >
                                {intent}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="pt-4 space-y-4">
                    <button
                        onClick={handleSave}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all text-lg"
                    >
                        <Save size={20} strokeWidth={2.5} />
                        Save Changes
                    </button>

                    {/* Get App Section */}
                    <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden mt-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="text-white space-y-1">
                                <h2 className="text-lg font-black tracking-tight">Get Twingle App</h2>
                                <p className="text-xs text-slate-300 font-medium opacity-90">Smoother, faster dating experience with push notifications.</p>
                            </div>
                            <Link to="/download" className="shrink-0 bg-white text-slate-900 px-4 py-3 rounded-xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <Download size={16} className="text-brand-primary" strokeWidth={3} />
                                Get App
                            </Link>
                        </div>
                    </section>

                    <Link to="/terms" className="block text-center text-xs text-slate-400 font-semibold hover:text-slate-600 py-2">
                        Terms & Conditions • Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
