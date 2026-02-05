import React from 'react';
import { Sparkles } from 'lucide-react';

const PageLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="relative">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-rose-500 animate-spin-slow" />
                </div>
                {/* Optional: Add a subtle glow behind */}
                <div className="absolute top-0 left-0 w-full h-full bg-rose-400/20 blur-xl rounded-full -z-10"></div>
            </div>
        </div>
    );
};

export default PageLoader;
