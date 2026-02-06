
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

    const [verifications, setVerifications] = useState([]);

    useEffect(() => {
        fetchStats();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'reports') fetchReports();
        if (activeTab === 'payments') fetchPayments();
        if (activeTab === 'verifications') fetchVerifications();
    }, [activeTab]);

    const fetchVerifications = async () => {
        try {
            const res = await api.get('/admin/verification/');
            setVerifications(res.data);
        } catch (err) { }
    };

    const handleVerification = async (id, action) => {
        try {
            await api.post(`/admin/verification/${id}/verify/`, { action });
            toast.success(`Verification ${action}ed`);
            fetchVerifications();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'Action Failed');
            console.error(err);
        }
    };



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
                <StatCard icon={<Users />} label="New Today" value={stats?.new_users_today} color="bg-indigo-500" />
                <StatCard icon={<CreditCard />} label="Revenue" value={`₹${stats?.total_revenue || 0}`} color="bg-green-600" />
                <StatCard icon={<Check />} label="Verified" value={stats?.verified_users} color="bg-teal-500" />
                <StatCard icon={<AlertTriangle />} label="Pending Verif." value={stats?.pending_verifications} color="bg-orange-500" />
                <StatCard icon={<Users />} label="Males" value={stats?.gender_split?.male} color="bg-blue-400" />
                <StatCard icon={<Users />} label="Females" value={stats?.gender_split?.female} color="bg-pink-400" />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6 overflow-x-auto">
                <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18} />} />
                <TabButton label="Verifications" active={activeTab === 'verifications'} onClick={() => setActiveTab('verifications')} icon={<Check size={18} />} />
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

            {activeTab === 'verifications' && (
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    {verifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No pending verifications.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {verifications.map(v => (
                                <div key={v.id} className="border rounded-xl p-4 flex gap-4">
                                    <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                        {v.verification_image ? (
                                            <a href={v.verification_image.startsWith('http') ? v.verification_image : `${(api.defaults.baseURL || '').replace('/api', '') || 'http://127.0.0.1:8000'}${v.verification_image}`} target="_blank" rel="noreferrer">
                                                <img
                                                    src={v.verification_image.startsWith('http') ? v.verification_image : `${(api.defaults.baseURL || '').replace('/api', '') || 'http://127.0.0.1:8000'}${v.verification_image}`}
                                                    className="w-full h-full object-cover"
                                                    alt="Proof"
                                                />
                                            </a>
                                        ) : <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">No Image</div>}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{v.first_name}, {v.age}</h3>
                                        <p className="text-sm text-slate-500 mb-2">User ID: {v.id}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => handleVerification(v.id, 'approve')} className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">Approve</button>
                                            <button onClick={() => handleVerification(v.id, 'reject')} className="bg-red-100 text-red-500 px-3 py-1 rounded text-sm font-bold border border-red-200">Reject</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    {payments.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No pending payments found.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="p-4">User Details</th>
                                    <th className="p-4">Plan / Date</th>
                                    <th className="p-4">Proof</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">User ID: {p.user}</div>
                                            <div className="text-xs text-slate-400">Txn: #{p.id}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-brand-primary">{p.plan_name || `Plan ${p.plan}`}</div>
                                            <div className="text-xs text-slate-400">{new Date(p.created_at).toLocaleString()}</div>
                                        </td>
                                        <td className="p-4">
                                            {p.screenshot ? (
                                                <a
                                                    href={p.screenshot}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    <CreditCard size={14} /> View Proof
                                                </a>
                                            ) : <span className="text-slate-400 text-xs">No screenshot</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            {p.status === 'pending' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handlePayment(p.id, 'approve')}
                                                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 shadow-sm active:scale-95 transition-all"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handlePayment(p.id, 'reject')}
                                                        className="flex items-center gap-1 bg-red-50 text-red-500 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
