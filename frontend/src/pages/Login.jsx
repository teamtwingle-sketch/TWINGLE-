
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Heart, Sparkles } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login/', { email, password });
            localStorage.setItem('token', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            localStorage.setItem('user_id', res.data.user_id);
            localStorage.setItem('is_staff', res.data.is_staff);
            toast.success('Welcome back!');
            // Force reload to update App.jsx authentication state
            window.location.href = '/';
        } catch (err) {
            toast.error('Invalid credentials');
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-center items-center gradient-bg p-4 overflow-y-auto">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand-primary/10 flex items-center justify-center rounded-2xl mb-4">
                        <Sparkles className="text-brand-primary w-10 h-10 fill-brand-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Twingle</h1>
                    <p className="text-slate-500 mt-2">Dating for the Malayali Heart</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                            placeholder="kuttan@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full gradient-bg text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98]"
                    >
                        Sign In
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
                                    window.location.href = '/';
                                } catch (err) {
                                    console.error(err);
                                    toast.error('Google Login Failed');
                                }
                            }}
                            onError={() => toast.error('Login Failed')}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                            size="large"
                            width="300"
                        />
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-600">
                    New here?{' '}
                    <Link to="/register" className="text-brand-primary font-bold hover:underline">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
