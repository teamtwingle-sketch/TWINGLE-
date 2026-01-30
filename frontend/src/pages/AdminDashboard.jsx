
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { LayoutDashboard, Users, AlertTriangle, CreditCard, Check, X, Ban, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'reports') fetchReports();
        if (activeTab === 'payments') fetchPayments();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats/');
            setStats(res.data);
            setLoading(false);
        } catch (err) { }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users/');
            setUsers(res.data);
        } catch (err) { }
    };

    const fetchReports = async () => {
        try {
            const res = await api.get('/admin/reports/');
            setReports(res.data);
        } catch (err) { }
    };

    const fetchPayments = async () => {
        try {
            const res = await api.get('/admin/payments/');
            setPayments(res.data);
        } catch (err) { }
    };

    const handleBan = async (id) => {
        if (!window.confirm('Ban this user permanently?')) return;
        try {
            await api.post(`/admin/users/${id}/ban/`);
            toast.success('User banned');
            fetchUsers();
        } catch (err) { toast.error('Failed'); }
    };

    const handleResolve = async (id) => {
        try {
            await api.post(`/admin/reports/${id}/resolve/`);
            toast.success('Report resolved');
            fetchReports();
            fetchStats();
        } catch (err) { toast.error('Failed'); }
    };

    const handlePayment = async (id, action) => {
        try {
            await api.post(`/admin/payments/${id}/${action}/`);
            toast.success(`Payment ${action}ed`);
            fetchPayments();
            fetchStats();
        } catch (err) { toast.error('Failed'); }
    };

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto pb-24">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <ShieldAlert className="text-brand-primary" /> Admin Dashboard
            </h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<Users />} label="Total Users" value={stats?.total_users} color="bg-blue-500" />
                <StatCard icon={<CreditCard />} label="Premium Users" value={stats?.premium_users} color="bg-green-500" />
                <StatCard icon={<AlertTriangle />} label="Pending Reports" value={stats?.pending_reports} color="bg-red-500" />
                <StatCard icon={<CreditCard />} label="Pending Payments" value={stats?.pending_payments} color="bg-orange-500" />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6 overflow-x-auto">
                <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18} />} />
                <TabButton label="Manage Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} />
                <TabButton label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<AlertTriangle size={18} />} />
                <TabButton label="Payments" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<CreditCard size={18} />} />
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="bg-white p-8 rounded-2xl shadow text-center text-slate-500">
                    Welcome to the Admin Control Center. Select a tab to manage resources.
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Premium</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="p-4">
                                        <div className="font-bold">{u.email}</div>
                                        <div className="text-xs text-slate-400">ID: {u.id}</div>
                                    </td>
                                    <td className="p-4"><Badge status={u.status} /></td>
                                    <td className="p-4">{u.is_premium ? 'Yes' : 'No'}</td>
                                    <td className="p-4">
                                        {u.status !== 'perm_banned' && (
                                            <button onClick={() => handleBan(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                                <Ban size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="space-y-4">
                    {reports.length === 0 && <div className="text-slate-500">No reports.</div>}
                    {reports.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                            <div>
                                <div className="font-bold text-red-500 flex items-center gap-2">
                                    <AlertTriangle size={16} /> {r.reason}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">
                                    Reported User ID: {r.reported_user} by Reporter ID: {r.reporter}
                                </div>
                                <div className="text-sm italic text-slate-500">"{r.explanation}"</div>
                            </div>
                            <div>
                                {!r.resolved ? (
                                    <button onClick={() => handleResolve(r.id)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm">
                                        Resolve
                                    </button>
                                ) : <span className="text-green-500 font-bold">Resolved</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'payments' && (
                <div className="space-y-4">
                    {payments.length === 0 && <div className="text-slate-500">No pending payments.</div>}
                    {payments.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                            <div>
                                <div className="font-bold">Plan ID: {p.plan}</div>
                                <div className="text-sm">User ID: {p.user}</div>
                                <div className="text-sm text-slate-400">{new Date(p.created_at).toLocaleDateString()}</div>
                                {p.screenshot && (
                                    <a href={p.screenshot} target="_blank" rel="noreferrer" className="text-brand-primary text-xs underline block mt-1">View Screenshot</a>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {p.status === 'pending' ? (
                                    <>
                                        <button onClick={() => handlePayment(p.id, 'approve')} className="bg-green-500 text-white p-2 rounded-lg"><Check /></button>
                                        <button onClick={() => handlePayment(p.id, 'reject')} className="bg-red-500 text-white p-2 rounded-lg"><X /></button>
                                    </>
                                ) : <span className="capitalize font-bold text-slate-500">{p.status}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-4 rounded-2xl shadow flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-bold">{value || 0}</div>
            <div className="text-xs text-slate-500 uppercase">{label}</div>
        </div>
    </div>
);

const TabButton = ({ label, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${active ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
    >
        {icon} {label}
    </button>
);

const Badge = ({ status }) => {
    const colors = {
        active: 'bg-green-100 text-green-700',
        perm_banned: 'bg-red-100 text-red-700',
        under_review: 'bg-orange-100 text-orange-700'
    };
    return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${colors[status] || 'bg-slate-100'}`}>
            {status}
        </span>
    );
};

export default AdminDashboard;
