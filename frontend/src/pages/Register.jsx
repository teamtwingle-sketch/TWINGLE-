
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords don't match");
        }
        try {
            // 1. Register
            await api.post('/auth/register/', { email, password });

            // 2. Auto Login
            const loginRes = await api.post('/auth/login/', { email, password });
            localStorage.setItem('token', loginRes.data.access);
            localStorage.setItem('refresh', loginRes.data.refresh);
            localStorage.setItem('user_id', loginRes.data.user_id);

            toast.success('Welcome to Twingle!');
            window.location.href = '/profile-setup';
        } catch (err) {
            console.error(err);
            toast.error('Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand-secondary/10 flex items-center justify-center rounded-2xl mb-4">
                        <Sparkles className="text-brand-secondary w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Join Twingle</h1>
                    <p className="text-slate-500 mt-2">The journey to your special someone starts here</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-start gap-2 py-2">
                        <input type="checkbox" className="mt-1 accent-brand-primary" required />
                        <p className="text-[10px] text-slate-500">
                            By creating an account, you agree to our <Link to="/terms" className="underline hover:text-brand-primary">Terms</Link>, <Link to="/privacy" className="underline hover:text-brand-primary">Privacy Policy</Link> and <Link to="/guidelines" className="underline hover:text-brand-primary">Community Guidelines</Link>. Must be 18+ to use.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full gradient-bg text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98]"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    const res = await api.post('/auth/google/', { token: credentialResponse.credential });
                                    localStorage.setItem('token', res.data.access);
                                    localStorage.setItem('refresh', res.data.refresh);
                                    localStorage.setItem('user_id', res.data.user_id);
                                    localStorage.setItem('is_staff', res.data.is_staff);
                                    toast.success('Welcome!');
                                    window.location.href = '/profile-setup';
                                } catch (err) {
                                    console.error(err);
                                    toast.error('Google Sign-Up Failed');
                                }
                            }}
                            onError={() => toast.error('Sign-Up Failed')}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                            size="large"
                            width="300"
                            text="signup_with"
                        />
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-primary font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
