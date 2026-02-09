

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, matchPath } from 'react-router-dom';
import { Flame, Star, MessageCircle, User, LayoutDashboard, ShieldAlert, Sparkles, Bell } from 'lucide-react';
import api from '../api/client';

import MatchPopup from './MatchPopup';

const AppLayout = ({ children }) => {
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [matchPopupData, setMatchPopupData] = useState(null);
    const [newMatchCount, setNewMatchCount] = useState(0);
    const [myPhoto, setMyPhoto] = useState(null);

    // Check if we are in a specific chat window
    // We want to hide the global header/nav only for the specific chat room
    const isChatWindow = matchPath("/chat/:userId", location.pathname);

    const isFullScreenPage = isChatWindow;

    // Fetch My Photo on Mount
    useEffect(() => {
        const fetchMyPhoto = async () => {
            try {
                const res = await api.get('/profile/');
                if (res.data.photos && res.data.photos.length > 0) {
                    const p = res.data.photos[0].image;
                    setMyPhoto(p.startsWith('http') ? p : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${p}`);
                }
            } catch (e) { }
        };
        fetchMyPhoto();

        // Clear new match count if on matches page
        if (location.pathname === '/matches') {
            setNewMatchCount(0);
        }
    }, [location.pathname]);

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
        const interval = setInterval(checkUnread, 15000); // Poll every 15s instead of 5s
        return () => clearInterval(interval);
    }, []);

    // Listen for custom match event (from Discovery page)
    useEffect(() => {
        const handleNewMatch = () => {
            if (location.pathname !== '/matches') {
                setNewMatchCount(prev => prev + 1);
            }
        };
        window.addEventListener('trigger-new-match', handleNewMatch);
        return () => window.removeEventListener('trigger-new-match', handleNewMatch);
    }, [location.pathname]);

    // Global WebSocket for Notifications (Matches)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        let wsUrl;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

        try {
            if (apiBase.startsWith('http')) {
                const url = new URL(apiBase);
                const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                wsUrl = `${protocol}//${url.host}/ws/chat/?token=${token}`;
            } else {
                // Handle relative path (e.g., /api)
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                wsUrl = `${protocol}//${window.location.host}/ws/chat/?token=${token}`;
            }
        } catch (e) {
            console.error("WebSocket URL Construction Failed:", e);
            wsUrl = `ws://localhost:8000/ws/chat/?token=${token}`;
        }

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log("WS Connected");
        ws.onerror = (e) => console.log("WS Error", e);

        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'match_notification') {
                    console.log("Match Notification Received:", data);
                    // Show popup for BOTH users (initiator and receiver)
                    setMatchPopupData(data);

                    // Increment new match badge if not currently on matches page
                    if (location.pathname !== '/matches') {
                        setNewMatchCount(prev => prev + 1);
                    }

                    // Always show toast for visibility
                    import('react-toastify').then(({ toast }) => {
                        toast.success(`It's a Match! You matched with ${data.partner_name} 💖`, {
                            icon: "💘",
                            autoClose: 5000
                        });
                    });
                    // Trigger haptics
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                }
            } catch (err) { }
        };

        return () => ws.close();
    }, []);

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50">
            {/* Global Match Popup */}
            {matchPopupData && (
                <MatchPopup
                    user={{ photo: myPhoto }}
                    match={{
                        name: matchPopupData.partner_name,
                        photo: matchPopupData.partner_photo,
                        user_id: matchPopupData.partner_id
                    }}
                    onClose={() => setMatchPopupData(null)}
                    onChat={(id) => {
                        setMatchPopupData(null);
                        window.location.href = `/chat/${id}`;
                    }}
                />
            )}

            {/* Top Header - Hidden in Full Screen Pages */}
            {!isFullScreenPage && (
                <header className="h-16 px-6 border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between shadow-sm">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-pink-600 to-rose-700 rounded-xl shadow-lg flex items-center justify-center transform rotate-0 hover:rotate-3 transition-transform">
                            <Sparkles className="text-white w-5 h-5 fill-white/80" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-slate-800 drop-shadow-sm">TWINGLE</span>
                    </Link>
                    <div className="flex gap-2 items-center">
                        <NotificationBell />

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
                {children || <Outlet />}
            </main>

            {/* Bottom Nav - Hidden in Full Screen Pages */}
            {!isFullScreenPage && (
                <nav className="h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-20">
                    <NavItem to="/" icon={<Flame />} label="Discover" />
                    <NavItem to="/matches" icon={<Star />} label="Matches" badgeCount={newMatchCount} />
                    <NavItem to="/public-chat" icon={<Sparkles />} label="Hub" />
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
      ${isActive ? 'text-brand-primary scale-110' : 'text-slate-500 hover:text-slate-700'}
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

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(false);

    const toggle = () => {
        if (!open) fetchNotifs();
        setOpen(!open);
    };

    const fetchNotifs = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
            setUnread(false); // Clear badge locally for now (should ideally check if any is_read=False)
        } catch (e) { }
    };

    return (
        <div className="relative">
            <button onClick={toggle} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                <Bell size={20} />
                {unread && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 font-bold text-slate-700 text-sm">Notifications</div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">No notifications yet</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={`p-4 border-b hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                                        <div className="font-bold text-sm text-slate-800">{n.title}</div>
                                        <div className="text-xs text-slate-500 mt-1">{n.body}</div>
                                        <div className="text-[10px] text-slate-400 mt-2 text-right">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AppLayout;

