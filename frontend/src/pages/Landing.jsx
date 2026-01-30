import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Zap, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Landing = () => {
    const [started, setStarted] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPopup(true);
        }, 30000); // 30 seconds
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden gradient-bg text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10"
                >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
                        <Sparkles className="w-12 h-12 fill-white animate-pulse" />
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight font-outfit">Twingle</h1>
                    <p className="text-xl opacity-90 mb-10 max-w-md mx-auto font-medium">
                        The Number 1 Dating Platform For Malayalis. Find Your Special Someone In Kerala.
                    </p>

                    {/* Dynamic Action Buttons */}
                    <AnimatePresence mode="wait">
                        {!started ? (
                            <motion.button
                                key="start-btn"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onClick={() => setStarted(true)}
                                className="bg-white text-brand-primary font-black py-4 px-12 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all text-xl tracking-wide"
                            >
                                GET STARTED
                            </motion.button>
                        ) : (
                            <motion.div
                                key="auth-buttons"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col gap-4 w-full max-w-xs mx-auto"
                            >
                                <Link
                                    to="/register"
                                    className="bg-white text-brand-primary font-bold py-4 rounded-2xl shadow-xl hover:scale-105 transition-transform text-lg"
                                >
                                    Create Account
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-brand-primary/20 backdrop-blur-sm border border-white/30 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-colors text-lg"
                                >
                                    Sign In
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Decorative elements */}
                <div className="absolute top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 -right-20 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl"></div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                <FeatureCard
                    icon={<Shield className="text-brand-primary" size={32} />}
                    title="Safe & Secure"
                    desc="Strict moderation and manual payment verification to keep our community safe."
                />
                <FeatureCard
                    icon={<Zap className="text-orange-500" size={32} />}
                    title="Smart Matching"
                    desc="Algorithm tailored for Malayali preferences, interests, and districts."
                />
                <FeatureCard
                    icon={<MessageCircle className="text-blue-500" size={32} />}
                    title="Premium Extras"
                    desc="Unlock unlimited swipes, rewind, and profile boosts with our Gold & Platinum plans."
                />
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-slate-100 text-center text-slate-400 text-sm">
                <p>© 2026 Twingle. Made with ❤️ for Kerala.</p>
                <div className="flex justify-center gap-6 mt-4 font-bold text-[10px] uppercase tracking-widest">
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                    <Link to="/safety">Safety</Link>
                </div>
            </footer>

            {/* Auto Popup Modal */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
                        >
                            <button
                                onClick={() => setShowPopup(false)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-brand-primary fill-brand-primary" />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 mb-2">Ready to Mingle?</h2>
                            <p className="text-slate-500 mb-8">Join thousands of Malayalis finding true love on Twingle today.</p>

                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/register"
                                    className="block w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                >
                                    Create Account
                                </Link>
                                <Link
                                    to="/login"
                                    className="block w-full bg-slate-50 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"
                                >
                                    Log In
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 border border-slate-100">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default Landing;
