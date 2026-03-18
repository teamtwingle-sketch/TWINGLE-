

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, matchPath } from 'react-router-dom';
import { Flame, Star, MessageCircle, User, LayoutDashboard, ShieldAlert, Sparkles, Bell, Download } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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
        const handleNewMatch = (e) => {
            // e.detail contains match info from Discovery API response
            if (e.detail) {
                // Normalize data to match WebSocket structure
                setMatchPopupData({
                    partner_id: e.detail.user_id,
                    partner_name: e.detail.name,
                    partner_photo: e.detail.photo,
                    is_initiator: true // Since this event comes from local action (swipe)
                });
            }

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

                // ... (in onmessage handler)
                if (data.type === 'match_notification') {
                    console.log("Match Notification Received (WS):", data);

                    // Explicitly log the initiator status
                    console.log("Is Initiator:", data.is_initiator);

                    // Only show popup and toasts for the PASSIVE user (receiver). 
                    // Initiator sees it via Discovery API response immediately.
                    if (!data.is_initiator) {
                        console.log("Setting Match Popup Data for Receiver");
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
                            console.log("Toast dispatched");
                        });

                        // Signal NotificationBell to update
                        window.dispatchEvent(new Event('new-notification'));

                        // Trigger haptics
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    }
                }
            } catch (err) { }
        };

        return () => ws.close();
    }, []);

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50">
            {/* Global Match Popup */}
            <AnimatePresence>
                {matchPopupData && (
                    <MatchPopup
                        key="match-popup"
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
            </AnimatePresence>

            {/* Top Header - Hidden in Full Screen Pages */}
            {!isFullScreenPage && (
                <header className="h-[68px] px-5 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl sticky top-0 z-10 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] pt-[env(safe-area-inset-top,0px)]">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-[10px] shadow-sm flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all">
                            <Sparkles className="text-white w-4 h-4 fill-white/90" />
                        </div>
                        <span className="font-[800] text-[22px] tracking-tight text-slate-800 drop-shadow-sm">TWINGLE</span>
                    </Link>
                    <div className="flex gap-2 items-center">
                        <NotificationBell />

                        {isStaff && (
                            <NavLink to="/admin-dashboard" className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black tracking-wide rounded-full shadow-md active:scale-95 transition-transform flex items-center gap-1">
                                <ShieldAlert size={12} /> Admin
                            </NavLink>
                        )}

                        <NavLink to="/subscription" className="px-3.5 py-1.5 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 text-[11px] font-black tracking-wide rounded-full border border-rose-200/50 shadow-sm hover:shadow-md active:scale-95 transition-all">
                            PREMIUM
                        </NavLink>
                    </div>
                </header>
            )}

            {/* Main Container */}
            <main className={`flex-1 overflow-y-auto flex flex-col bg-[#eaeff5] ${!isFullScreenPage ? 'pb-0' : ''}`}>
                {children
                    ? React.Children.map(children, child =>
                        React.isValidElement(child)
                            ? React.cloneElement(child, {
                                onMatch: (matchDetails) => {
                                    setMatchPopupData({
                                        partner_id: matchDetails.user_id,
                                        partner_name: matchDetails.name,
                                        partner_photo: matchDetails.photo,
                                        is_initiator: true
                                    });
                                    if (location.pathname !== '/matches') {
                                        setNewMatchCount(prev => prev + 1);
                                    }
                                    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
                                }
                            })
                            : child
                    )
                    : <Outlet context={{
                        onMatch: (matchDetails) => {
                            setMatchPopupData({
                                partner_id: matchDetails.user_id,
                                partner_name: matchDetails.name,
                                partner_photo: matchDetails.photo,
                                is_initiator: true
                            });
                            // Also trigger badge update
                            if (location.pathname !== '/matches') {
                                setNewMatchCount(prev => prev + 1);
                            }
                            // Trigger Haptics
                            if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
                        }
                    }} />}
            </main>

            {/* Bottom Nav - Hidden in Full Screen Pages */}
            {!isFullScreenPage && (
                <nav className="h-[84px] bg-white/90 backdrop-blur-3xl border-t border-slate-200/40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,20px)] pt-1 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-20 shrink-0 select-none">
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
      flex flex-col items-center justify-center gap-[3px] w-16 transition-all duration-300 relative active:scale-90
      ${isActive ? 'text-brand-primary' : 'text-slate-400 hover:text-slate-600'}
    `}
    >
        {({ isActive }) => (
            <>
                <div className="relative">
                    {React.cloneElement(icon, {
                        size: 26,
                        strokeWidth: isActive ? 3 : 2,
                        className: `transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'scale-100'}`
                    })}
                    {badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white">
                            {badgeCount > 9 ? '9+' : badgeCount}
                        </span>
                    )}
                </div>
                <span className={`text-[10px] tracking-wide transition-all ${isActive ? 'font-black scale-105' : 'font-semibold'}`}>
                    {label}
                </span>
            </>
        )}
    </NavLink>
);

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(false);

    const toggle = () => {
        if (!open) {
            fetchNotifs();
            setUnread(false); // Clear badge when opening
        }
        setOpen(!open);
    };

    const fetchNotifs = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
            // We only clear unread on 'toggle' (open), so we don't setUnread(false) here if it was triggered by a new event
        } catch (e) { }
    };

    useEffect(() => {
        const handleNewNotif = () => {
            setUnread(true);
            fetchNotifs();
        };
        window.addEventListener('new-notification', handleNewNotif);
        return () => window.removeEventListener('new-notification', handleNewNotif);
    }, []);

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

