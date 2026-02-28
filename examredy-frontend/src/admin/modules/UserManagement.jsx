import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
    Users, Search, Shield, ShieldAlert, UserCheck, UserMinus,
    Calendar, Clock, RotateCcw, Activity, X, ChevronLeft,
    ChevronRight, ExternalLink, Mail, User
} from 'lucide-react';

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
            <p className="text-sm font-black uppercase tracking-widest">{msg}</p>
        </div>
    );
};

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    // Modals
    const [selUser, setSelUser] = useState(null);
    const [showActivity, setShowActivity] = useState(false);
    const [showSub, setShowSub] = useState(false);
    const [activityData, setActivityData] = useState({ history: [], todayCount: 0 });
    const [subData, setSubData] = useState({ action: 'extend', hours: 24, sessions: 0 });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users?page=${page}&search=${search}`);
            setUsers(res.data);
        } catch (e) {
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const toggleStatus = async (user) => {
        try {
            const res = await api.put(`/admin/users/${user.id}/status`, { is_active: !user.is_active });
            if (res.data.success) {
                showToast(res.data.message);
                fetchUsers();
            }
        } catch (e) { showToast('Update failed', 'error'); }
    };

    const updateRole = async (user, newRole) => {
        try {
            await api.put(`/admin/users/${user.id}/role`, { role: newRole });
            showToast(`User ${newRole === 'admin' ? 'promoted' : 'demoted'}`);
            fetchUsers();
        } catch (e) { showToast('Update failed', 'error'); }
    };

    const resetUsage = async (user) => {
        try {
            await api.post(`/admin/users/${user.id}/reset-usage`);
            showToast('Usage reset successful');
        } catch (e) { showToast('Reset failed', 'error'); }
    };

    const fetchActivity = async (user) => {
        setSelUser(user);
        try {
            const res = await api.get(`/admin/users/${user.id}/activity`);
            setActivityData(res.data);
            setShowActivity(true);
        } catch (e) { showToast('Failed to load activity', 'error'); }
    };

    const handleSubscription = async () => {
        try {
            await api.put(`/admin/users/${selUser.id}/subscription`, subData);
            showToast('Subscription updated');
            setShowSub(false);
            fetchUsers();
        } catch (e) { showToast('Update failed', 'error'); }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Users className="text-green-400" size={32} />
                        Identity & Access
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">
                        Manage users, roles and monetization tiers
                    </p>
                </div>

                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH EMAIL OR USERNAME..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-green-400/20 focus:border-green-400/40 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-800/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-5">User Identity</th>
                                <th className="px-6 py-5">Role & Status</th>
                                <th className="px-6 py-5">Subscription</th>
                                <th className="px-6 py-5">Joined At</th>
                                <th className="px-6 py-5 text-right">Operational Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {users.map(user => (
                                <tr key={user.id} className="group hover:bg-gray-800/20 transition-all duration-300">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg ${user.role === 'admin' ? 'bg-indigo-600 shadow-indigo-500/20' : user.sessions_left === -1 ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-500/20' : 'bg-gray-800 shadow-black/20'
                                                }`}>
                                                {user.username?.[0].toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-sm tracking-tight">{user.username}</p>
                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                    <Mail size={10} /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded">
                                                        <Shield size={10} /> Admin Access
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/10 border border-gray-500/20 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded">
                                                        <User size={10} /> Default User
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {user.is_active ? (
                                                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded">Active Account</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded">Restricted</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            {user.sessions_left === -1 ? (
                                                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded animate-pulse">Unlimited Sessions</span>
                                            ) : user.sessions_left > 0 ? (
                                                <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] font-black uppercase tracking-widest rounded">{user.sessions_left} Sessions Left</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-gray-500/10 border border-gray-500/20 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded">Free Tier</span>
                                            )}
                                            {user.premium_expiry && (
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    EXP: {new Date(user.premium_expiry).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <button
                                                title="View Activity"
                                                onClick={() => fetchActivity(user)}
                                                className="p-2 bg-gray-800 hover:bg-cyan-500/10 border border-gray-700 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 rounded-lg transition-all"
                                            >
                                                <Activity size={14} />
                                            </button>
                                            <button
                                                title="Subscription Logic"
                                                onClick={() => { setSelUser(user); setShowSub(true); }}
                                                className="p-2 bg-gray-800 hover:bg-pink-500/10 border border-gray-700 hover:border-pink-500/30 text-gray-400 hover:text-pink-400 rounded-lg transition-all"
                                            >
                                                <Calendar size={14} />
                                            </button>
                                            <button
                                                title="Reset Daily Quota"
                                                onClick={() => resetUsage(user)}
                                                className="p-2 bg-gray-800 hover:bg-yellow-500/10 border border-gray-700 hover:border-yellow-500/30 text-gray-400 hover:text-yellow-400 rounded-lg transition-all"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                            <button
                                                title={user.is_active ? "Restrict User" : "Enable User"}
                                                onClick={() => toggleStatus(user)}
                                                className={`p-2 bg-gray-800 border border-gray-700 rounded-lg transition-all ${user.is_active
                                                    ? 'hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-gray-400'
                                                    : 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 text-gray-400'
                                                    }`}
                                            >
                                                {user.is_active ? <UserMinus size={14} /> : <UserCheck size={14} />}
                                            </button>
                                            <button
                                                title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                onClick={() => updateRole(user, user.role === 'admin' ? 'user' : 'admin')}
                                                className="p-2 bg-gray-800 hover:bg-indigo-500/10 border border-gray-700 hover:border-indigo-500/30 text-gray-400 hover:text-indigo-400 rounded-lg transition-all"
                                            >
                                                {user.role === 'admin' ? <ShieldAlert size={14} /> : <Shield size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-gray-900/80 border-t border-gray-800 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Viewing Page {page}</p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 text-white rounded-lg transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL: ACTIVITY LOG */}
            {showActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-800/20">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <Activity className="text-cyan-400" /> User Activity Archive
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                    Last 50 attempts for <span className="text-cyan-400">{selUser?.email}</span> • Usage: {activityData.todayCount}
                                </p>
                            </div>
                            <button onClick={() => setShowActivity(false)} className="p-2 hover:bg-gray-800 rounded-xl transition-all"><X size={20} className="text-gray-500 hover:text-white" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {activityData.history.length === 0 ? (
                                <p className="text-center text-gray-600 italic py-20 text-sm">No recent activity detected.</p>
                            ) : (
                                activityData.history.map((h, i) => (
                                    <div key={i} className="bg-gray-950/50 border border-gray-800/50 p-4 rounded-2xl flex items-center justify-between gap-4 group">
                                        <div className="flex-1">
                                            <p className="text-gray-200 text-xs font-bold leading-relaxed">{h.question}</p>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                                <Clock size={10} /> {new Date(h.attempted_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border ${h.is_correct
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                                            }`}>
                                            {h.is_correct ? 'CORRECT' : 'WRONG'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: SUBSCRIPTION */}
            {showSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-800 bg-gray-800/20 flex items-center justify-between">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Calendar className="text-pink-400" /> Tier Control
                            </h3>
                            <button onClick={() => setShowSub(false)} className="p-2 hover:bg-gray-800 rounded-xl transition-all"><X size={18} className="text-gray-500 hover:text-white" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Operational Logic</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['extend', 'reduce', 'set_sessions', 'cancel'].map(act => (
                                        <button
                                            key={act}
                                            onClick={() => setSubData({ ...subData, action: act })}
                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${subData.action === act
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {act.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(subData.action === 'extend' || subData.action === 'reduce') && (
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Temporal Shift (Hours)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[24, 168, 720, 8760].map(h => (
                                            <button
                                                key={h}
                                                onClick={() => setSubData({ ...subData, hours: h })}
                                                className={`px-2 py-3 rounded-xl text-[10px] font-black text-white border transition-all ${subData.hours === h
                                                    ? 'bg-pink-600 border-pink-500'
                                                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                                                    }`}
                                            >
                                                {h >= 8760 ? '1Y' : h >= 720 ? '1M' : h >= 168 ? '1W' : '1D'}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="number"
                                        value={subData.hours}
                                        onChange={(e) => setSubData({ ...subData, hours: parseInt(e.target.value) || 0 })}
                                        className="mt-3 w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-black font-mono focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                                        placeholder="CUSTOM HOURS..."
                                    />
                                </div>
                            )}

                            {subData.action === 'set_sessions' && (
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Session Count Control</label>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <button
                                            onClick={() => setSubData({ ...subData, sessions: -1 })}
                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${subData.sessions === -1
                                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            Unlimited Status
                                        </button>
                                        <button
                                            onClick={() => setSubData({ ...subData, sessions: 10 })}
                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${subData.sessions === 10
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                                : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            Standard (10)
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        value={subData.sessions}
                                        onChange={(e) => setSubData({ ...subData, sessions: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-black font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        placeholder="INPUT SESSION COUNT (-1 for unlimited)..."
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleSubscription}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 active:scale-[0.98]"
                            >
                                Execute Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
