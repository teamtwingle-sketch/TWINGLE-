

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
        const interval = setInterval(checkUnread, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-full w-full bg-slate-50 overflow-hidden">
            {/* Top Header - Fixed */}
            {!isFullScreenPage && (
                <header className="fixed top-0 left-0 right-0 h-16 px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md z-30 flex items-center justify-between pt-[env(safe-area-inset-top)] shadow-sm">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg flex items-center justify-center transform rotate-3">
                            <Sparkles className="text-white w-5 h-5 fill-white/50" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-slate-800">TWINGLE</span>
                    </Link>
                    <div className="flex gap-2">
                        {isStaff && (
                            <NavLink to="/admin-dashboard" className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-full border border-slate-700 flex items-center gap-1">
                                <ShieldAlert size={12} /> Admin
                            </NavLink>
                        )}
                        <NavLink to="/subscription" className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-100 shadow-sm">
                            GO PREMIUM
                        </NavLink>
                    </div>
                </header>
            )}

            {/* Main Content Area - Scrollable */}
            <main
                className={`
                    absolute left-0 right-0 overflow-y-auto overscroll-contain
                    ${!isFullScreenPage
                        ? 'top-[64px] bottom-[80px]' // Space for Header & Nav
                        : 'inset-0 z-0' // Fullscreen
                    }
                `}
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <Outlet />
            </main>

            {/* Bottom Nav - Fixed */}
            {!isFullScreenPage && (
                <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-30">
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

