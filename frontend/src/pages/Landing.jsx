import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Zap, MessageCircle, Sparkles, ChevronDown, ChevronUp, MapPin, Download, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { PROGRAMMATIC_PAGES, KERALA_DISTRICTS } from '../data/seoPagesData';

const Landing = () => {
    const [openFaq, setOpenFaq] = useState(0);

    const landingFaqs = [
        {
            question: "Which is the best Mallu dating app in Kerala?",
            answer: "Twingle is ranked the #1 Mallu dating app for Malayalis in Kerala and worldwide. It offers 100% photo selfie verification (Blue Tick), district-based matching across all 14 Kerala districts, in-app voice calling, and affordable plans starting at just ₹199."
        },
        {
            question: "Is there a free Malayalam dating website or app?",
            answer: "Yes, Twingle offers free signup, profile customization, daily free swiping, mutual matching, and free messaging between matched singles on both web (https://twingle.online) and mobile."
        },
        {
            question: "How does Twingle protect users from fake profiles?",
            answer: "Twingle has a zero-tolerance policy for catfishing and fake accounts. Users can undergo live selfie verification to earn a verified Blue Checkmark. Additionally, our automated moderation blocks external links and phone number spam in chat."
        },
        {
            question: "What is the most affordable dating app for Mallus?",
            answer: "Twingle is the most affordable dating app in Kerala. While international apps charge ₹1,000+ per month with recurring card bills, Twingle's Gold Plan is just ₹199 for 30 days via direct UPI (GPay, PhonePe, Paytm) with zero auto-renew traps."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title="Twingle | No. 1 Mallu Dating App for Malayalis in Kerala"
                description="Twingle is the #1 Mallu Dating App & Website for Malayalis. Verified profiles, Kerala district matching, private voice calls, and affordable plans from ₹199."
                canonical="https://twingle.online/"
                keywords="mallu dating app, mallu dating website, malayalis dating app, malayalam dating app, best mallu dating app, affordable dating app for mallus, kerala dating, malayali matrimony"
                faqs={landingFaqs}
            />

            {/* Hero Section */}
            <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden gradient-bg text-white">
                <div className="z-10">
                    <div className="animate-fade-in-up">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/30">
                            <Sparkles className="w-12 h-12 fill-white animate-pulse" />
                        </div>
                    </div>
                    {/* Title is STATIC for LCP */}
                    <h1 className="text-5xl font-black mb-4 tracking-tight font-outfit">Twingle</h1>
                    <p className="text-xl opacity-90 mb-10 max-w-md mx-auto font-medium">
                        The No. 1 Mallu Dating App For Malayalis. Find Your Special Someone In Kerala.
                    </p>

                    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto animate-fade-in-up">
                        <Link
                            to="/login"
                            className="bg-white text-brand-primary font-black py-4 px-12 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl tracking-wide uppercase"
                        >
                            Get Started
                        </Link>
                        <p className="text-sm font-medium opacity-80">
                            New here? <Link to="/register" className="underline hover:text-white font-bold">Create Account</Link>
                        </p>
                    </div>
                </div>

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

            {/* Programmatic SEO Guides Showcase */}
            <section className="py-16 px-6 bg-slate-50 border-y border-slate-100">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">
                            Kerala’s Official Mallu Dating Hub
                        </h2>
                        <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
                            Purpose-built dating for Malayalis seeking genuine connections, serious relationships, and vivaham across Kerala and worldwide.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                        {Object.values(PROGRAMMATIC_PAGES).map((p) => (
                            <Link
                                key={p.slug}
                                to={`/${p.slug}`}
                                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group"
                            >
                                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block mb-1">
                                    {p.badge}
                                </span>
                                <h3 className="font-bold text-slate-800 text-base group-hover:text-rose-600 transition-colors">
                                    {p.keyword}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                    {p.description}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {/* Kerala Districts Directory */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                        <h3 className="text-lg font-bold text-slate-900 font-outfit mb-3 flex items-center gap-2">
                            <MapPin size={18} className="text-rose-500" /> Browse Singles by Kerala District:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {KERALA_DISTRICTS.map((d) => (
                                <Link
                                    key={d.slug}
                                    to={`/dating/${d.slug}`}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                                >
                                    {d.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Landing FAQ Section */}
            <section className="py-16 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Got questions? Here is everything you need to know about Twingle.
                    </p>
                </div>

                <div className="space-y-3">
                    {landingFaqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-rose-600 transition-colors"
                            >
                                <span>{faq.question}</span>
                                {openFaq === idx ? (
                                    <ChevronUp size={18} className="text-rose-500 shrink-0" />
                                ) : (
                                    <ChevronDown size={18} className="text-slate-400 shrink-0" />
                                )}
                            </button>
                            {openFaq === idx && (
                                <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-200/60 font-medium">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100 text-center text-slate-500 text-sm bg-white">
                <p className="font-bold text-slate-700">© 2026 Twingle. Made with ❤️ for Kerala.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    The No. 1 Mallu Dating App & Website for Malayalis in Kerala, Bangalore, Dubai, and worldwide.
                </p>
                <div className="flex justify-center flex-wrap gap-6 mt-6 font-bold text-[10px] uppercase tracking-widest">
                    <Link to="/mallu-dating-app" className="hover:text-rose-600">Mallu Dating App</Link>
                    <Link to="/mallu-dating-website" className="hover:text-rose-600">Mallu Dating Website</Link>
                    <Link to="/best-mallu-dating-app" className="hover:text-rose-600">Best Dating App</Link>
                    <Link to="/affordable-dating-app-for-mallus" className="hover:text-rose-600">Affordable Plans</Link>
                    <Link to="/download" className="hover:text-rose-600">Download APK</Link>
                    <Link to="/privacy" className="hover:text-rose-600">Privacy</Link>
                    <Link to="/terms" className="hover:text-rose-600">Terms</Link>
                    <Link to="/safety" className="hover:text-rose-600">Safety</Link>
                </div>
            </footer>
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
