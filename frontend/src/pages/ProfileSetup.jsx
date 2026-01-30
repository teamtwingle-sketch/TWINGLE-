import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Camera, Save, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        photos: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile/');
            setProfile({
                ...res.data,
                relationship_intents: res.data.relationship_intents || [],
                photos: res.data.photos || []
            });
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

        try {
            await api.patch('/profile/', profile);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error('Failed to update profile');
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

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-6 pb-24 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 font-outfit">My Profile</h1>
                <p className="text-slate-500">How others see you on Mallu Match</p>
            </div>

            {/* Photos Section */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {profile.photos?.map((photo) => (
                    <div key={photo.id} className="relative flex-shrink-0 w-32 h-44 rounded-2xl overflow-hidden shadow-sm">
                        <img src={photo.image} className="w-full h-full object-cover" alt="" />
                        <button
                            onClick={async () => {
                                if (!window.confirm("Delete this photo?")) return;
                                try {
                                    await api.delete(`/photos/${photo.id}/`);
                                    fetchProfile();
                                } catch (err) { toast.error('Failed to delete photo'); }
                            }}
                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full text-[8px]"
                        >✕</button>
                    </div>
                ))}

                {/* Upload Placeholder */}
                {(!profile.photos || profile.photos.length < 3) && (
                    <div className="flex-shrink-0 w-32 h-44 bg-slate-200 rounded-2xl relative border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors">

                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                // Validation: Max Size 4MB
                                if (file.size > 4 * 1024 * 1024) {
                                    return toast.error("Image size must be less than 4MB");
                                }

                                // Validation: Image Type
                                if (!file.type.startsWith('image/')) {
                                    return toast.error("Please upload a valid image file");
                                }

                                const formData = new FormData();
                                formData.append('image', file);
                                formData.append('is_primary', (!profile.photos || profile.photos.length === 0));

                                const toastId = toast.loading("Uploading...");
                                try {
                                    await api.post('/photos/', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    fetchProfile();
                                    toast.update(toastId, { render: "Photo uploaded!", type: "success", isLoading: false, autoClose: 2000 });
                                } catch (err) {
                                    toast.update(toastId, { render: "Upload failed", type: "error", isLoading: false, autoClose: 2000 });
                                }
                            }}
                        />
                        <Camera size={24} />
                        <span className="text-[10px] mt-2 font-bold uppercase">Add Photo</span>
                    </div>
                )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">First Name</label>
                    <input
                        type="text"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-primary"
                        value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Gender</label>
                        <select
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-primary text-sm appearance-none"
                            value={profile.gender || 'male'}
                            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Interested In</label>
                        <select
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-primary text-sm appearance-none"
                            value={profile.interested_in || 'female'}
                            onChange={(e) => setProfile({ ...profile, interested_in: e.target.value })}
                        >
                            <option value="female">Women</option>
                            <option value="male">Men</option>
                            <option value="all">Everyone</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Height (cm)</label>
                        <input
                            type="number"
                            placeholder="175"
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-primary text-sm"
                            value={profile.height_cm || ''}
                            onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Birth Date</label>
                        <input
                            type="date"
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-primary text-sm"
                            value={profile.dob}
                            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">District</label>
                    <select
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-primary text-sm appearance-none"
                        value={profile.district}
                        onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    >
                        <option value="alappuzha">Alappuzha</option>
                        <option value="ernakulam">Ernakulam</option>
                        <option value="idukki">Idukki</option>
                        <option value="kannur">Kannur</option>
                        <option value="kasaragod">Kasaragod</option>
                        <option value="kollam">Kollam</option>
                        <option value="kottayam">Kottayam</option>
                        <option value="kozhikode">Kozhikode</option>
                        <option value="malappuram">Malappuram</option>
                        <option value="palakkad">Palakkad</option>
                        <option value="pathanamthitta">Pathanamthitta</option>
                        <option value="thiruvananthapuram">Thiruvananthapuram</option>
                        <option value="thrissur">Thrissur</option>
                        <option value="wayanad">Wayanad</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Relationship Intent <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                        {['Marriage', 'Serious Dating', 'Friendship', 'Situationship', 'Casual'].map(intent => (
                            <button
                                key={intent}
                                onClick={() => toggleIntent(intent)}
                                className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${profile.relationship_intents && profile.relationship_intents.includes(intent)
                                    ? 'bg-brand-primary border-brand-primary text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-primary/50'
                                    }`}
                            >
                                {intent}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Bio</label>
                    <textarea
                        rows="4"
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-primary"
                        placeholder="Tell us about yourself..."
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    ></textarea>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="w-full gradient-bg text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-lg"
            >
                <Save size={20} />
                Update Profile
            </button>

            <Link to="/terms" className="block text-center text-xs text-brand-primary font-bold hover:underline py-2">
                View Terms & Conditions
            </Link>

            <button
                onClick={handleLogout}
                className="w-full bg-white text-slate-400 font-bold py-4 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 active:bg-slate-50 transition-all text-xs"
            >
                <LogOut size={16} />
                Sign Out
            </button>
        </div>
    );
};

export default ProfileSetup;
