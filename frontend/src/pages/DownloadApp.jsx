import React from 'react';
import { Smartphone, Download, CheckCircle, Apple } from 'lucide-react';

const DownloadApp = () => {
    return (
        <div className="flex flex-col min-h-full items-center justify-center p-6 bg-slate-50 relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-rose-50 to-transparent -z-10 rounded-b-[3rem]" />

            <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">

                {/* Hero Icon */}
                <div className="mx-auto w-32 h-32 bg-white rounded-[2rem] shadow-2xl shadow-rose-200/50 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                    <Smartphone size={64} className="text-brand-primary" strokeWidth={1.5} />
                </div>

                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Get Twingle Mobile</h1>
                    <p className="mt-3 text-slate-500 leading-relaxed font-medium">
                        The full experience is even better on your phone. Swipe, match, and chat on the go!
                    </p>
                </div>

                <div className="grid gap-4">
                    {/* Android Button */}
                    <a
                        href="/downloads/app-release.apk"
                        download="Twingle.apk"
                        className="group flex items-center justify-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all text-left"
                    >
                        <Download size={28} className="text-green-400" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Download for</div>
                            <div className="text-xl font-bold font-bg leading-none">Android</div>
                        </div>
                    </a>

                    {/* iOS Button */}
                    <button
                        onClick={() => alert("iOS App is coming soon to the App Store!")}
                        className="group flex items-center justify-center gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all text-left"
                    >
                        <Apple size={28} className="text-slate-300 group-hover:text-white transition-colors" />
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Download for</div>
                            <div className="text-xl font-bold font-bg leading-none">iPhone</div>
                        </div>
                    </button>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-2">Why Download?</h3>
                    <FeatureItem text="Real-time Push Notifications" />
                    <FeatureItem text="Smoother Swiping Experience" />
                    <FeatureItem text="Location-based Matching" />
                    <FeatureItem text="Dark Mode Support" />
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text }) => (
    <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
        <CheckCircle size={16} className="text-green-500 shrink-0" />
        {text}
    </div>
);

export default DownloadApp;
