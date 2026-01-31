

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, matchPath } from 'react-router-dom';
import { Flame, Star, MessageCircle, User, LayoutDashboard, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../api/client';

const AppLayout = () => {
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    // Check if we are in a specific chat window
    // We want to hide the global header/nav only for the specific chat room
    const isChatWindow = matchPath("/chat/:userId", location.pathname);

    const isFullScreenPage = isChatWindow;

    // Poll for unread messages
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const checkUnread = async () => {
            try {
                // If we are already on the chat list page, the page itself handles updates, 
                // but we still want the badge to be accurate if we navigate away.
                // ideally this endpoint would be lighter, like /notifications/count/
                const res = await api.get('/chats/');
                const totalUnread = res.data.reduce((acc, chat) => acc + (chat.unread_count || 0), 0);
                setUnreadCount(totalUnread);
            } catch (err) {
                // silient fail
            }
        };

        checkUnread();
        checkUnread();
        const interval = setInterval(checkUnread, 15000); // Poll every 15s instead of 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50">
            {/* Top Header - Hidden in Full Screen Pages */}
            {!isFullScreenPage && (
                <header className="h-16 px-6 border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between shadow-sm">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-pink-600 to-rose-700 rounded-xl shadow-lg flex items-center justify-center transform rotate-0 hover:rotate-3 transition-transform">
                            <Sparkles className="text-white w-5 h-5 fill-white/80" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-slate-800 drop-shadow-sm">TWINGLE</span>
                    </Link>
                    <div className="flex gap-2">
                        {isStaff && (
                            <NavLink to="/admin-dashboard" className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full border border-slate-800 flex items-center gap-1 shadow-md">
                                <ShieldAlert size={12} /> Admin
                            </NavLink>
                        )}
                        <NavLink to="/subscription" className="px-3.5 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200 shadow-sm hover:bg-rose-100 transition-colors">
                            GO PREMIUM
                        </NavLink>
                    </div>
                </header>
            )}

            {/* Main Container */}
            <main className={`flex-1 overflow-y-auto flex flex-col bg-[#eaeff5] ${!isFullScreenPage ? 'pb-0' : ''}`}>
                <Outlet />
            </main>

            {/* Bottom Nav - Hidden in Full Screen Pages */}
            {!isFullScreenPage && (
                <nav className="h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-20">
                    <NavItem to="/" icon={<Flame />} label="Discover" />
                    <NavItem to="/matches" icon={<Star />} label="Matches" />
                    <NavItem to="/chats" icon={<MessageCircle />} label="Chats" badgeCount={unreadCount} />
                    <NavItem to="/profile-setup" icon={<User />} label="Profile" />
                </nav>
            )}
        </div>
    );
};

const NavItem = ({ to, icon, label, badgeCount }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex flex-col items-center justify-center gap-1 w-16 transition-all duration-300 relative
      ${isActive ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-slate-600'}
    `}
    >
        <div className="relative">
            {React.cloneElement(icon, {
                size: 28,
                strokeWidth: icon.type.name === 'Flame' && to === '/' ? 2.5 : 2,
                className: "transition-all duration-300"
            })}
            {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                    {badgeCount > 9 ? '9+' : badgeCount}
                </span>
            )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </NavLink>
);

export default AppLayout;

