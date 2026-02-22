import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Gift, Save, CheckCircle2, TrendingUp, Users, Link as LinkIcon, AlertCircle, Settings } from 'lucide-react';

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
            <p className="text-sm font-black uppercase tracking-widest">{msg}</p>
        </div>
    );
};

export const ReferralManagement = () => {
    const [referrals, setReferrals] = useState([]);
    const [settings, setSettings] = useState({
        REFERRAL_ENABLED: 'false',
        REFERRAL_REWARD_TYPE: 'days',
        REFERRAL_REWARD_DURATION: '2',
        REFERRAL_MIN_PURCHASE_RS: '10'
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [refRes, setRes] = await Promise.all([
                api.get('/admin/referrals'),
                api.get('/admin/settings')
            ]);
            setReferrals(refRes.data);

            setSettings({
                REFERRAL_ENABLED: setRes.data.system.REFERRAL_ENABLED || 'false',
                REFERRAL_REWARD_TYPE: setRes.data.system.REFERRAL_REWARD_TYPE || 'days',
                REFERRAL_REWARD_DURATION: setRes.data.system.REFERRAL_REWARD_DURATION || setRes.data.system.REFERRAL_REWARD_DAYS || '2',
                REFERRAL_MIN_PURCHASE_RS: setRes.data.system.REFERRAL_MIN_PURCHASE_RS || '10'
            });
        } catch (e) {
            showToast('Failed to load referral data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            await api.put('/admin/settings/referral', settings);
            showToast('Referral Protocol Updated');
        } catch (e) {
            showToast('Update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleManualGrant = async (id) => {
        if (!window.confirm('Manually issue this reward to BOTH users?')) return;
        setLoading(true);
        try {
            await api.post(`/admin/referrals/${id}/grant`);
            showToast('Manual Reward Granted!');
            fetchData();
        } catch (e) {
            showToast(e.response?.data?.error || 'Grant failed', 'error');
            setLoading(false); // only disable loading on error since fetchData will handle it on success
        }
    };

    const stats = {
        total: referrals.length,
        successful: referrals.filter(r => r.reward_given).length,
        pending: referrals.filter(r => !r.reward_given).length
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-md shadow-2xl">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <Gift className="text-indigo-500" size={40} />
                        Referral Program
                    </h2>
                    <p className="text-gray-500 text-base font-medium mt-2 uppercase tracking-[0.2em]">
                        Viral Growth & Incentive Control Center
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Settings and Stats */}
                <div className="space-y-8">

                    {/* Settings Panel */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl"></div>

                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-indigo-500/10">
                            <h3 className="text-white text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <Settings className="text-indigo-400" size={20} /> Configuration
                            </h3>
                            <div className="flex items-center gap-3 bg-gray-900/80 px-4 py-2 rounded-xl border border-indigo-500/20">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 cursor-pointer" htmlFor="ref-enabled">
                                    {settings.REFERRAL_ENABLED === 'true' ? 'ACTIVE' : 'DISABLED'}
                                </label>
                                <input
                                    id="ref-enabled"
                                    type="checkbox"
                                    className="w-4 h-4 accent-indigo-500"
                                    checked={settings.REFERRAL_ENABLED === 'true'}
                                    onChange={(e) => setSettings({ ...settings, REFERRAL_ENABLED: String(e.target.checked) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] text-indigo-300 font-black uppercase tracking-widest pl-1">Multiplier</label>
                                    <input
                                        type="number"
                                        value={settings.REFERRAL_REWARD_DURATION}
                                        onChange={(e) => setSettings({ ...settings, REFERRAL_REWARD_DURATION: e.target.value })}
                                        className="w-full bg-gray-900/80 border border-indigo-500/30 rounded-2xl py-4 px-5 text-white font-black text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-indigo-300 font-black uppercase tracking-widest pl-1">Time Unit</label>
                                    <select
                                        value={settings.REFERRAL_REWARD_TYPE}
                                        onChange={(e) => setSettings({ ...settings, REFERRAL_REWARD_TYPE: e.target.value })}
                                        className="w-full bg-gray-900/80 border border-indigo-500/30 rounded-2xl py-4 px-5 text-white font-black text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="hours">HOURS</option>
                                        <option value="days">DAYS</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] text-indigo-300 font-black uppercase tracking-widest pl-1">Min Purchase to Trigger (₹)</label>
                                <input
                                    type="number"
                                    value={settings.REFERRAL_MIN_PURCHASE_RS}
                                    onChange={(e) => setSettings({ ...settings, REFERRAL_MIN_PURCHASE_RS: e.target.value })}
                                    className="w-full bg-gray-900/80 border border-indigo-500/30 rounded-2xl py-4 px-5 text-white font-black text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                />
                            </div>

                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4 mt-2">
                                <AlertCircle className="text-indigo-400 mt-0.5 shrink-0" size={16} />
                                <div className="text-[11px] text-indigo-200 uppercase tracking-widest leading-relaxed font-bold">
                                    If enabled, when a referred user buys a plan &gt;= ₹{settings.REFERRAL_MIN_PURCHASE_RS}, both parties automatically receive {settings.REFERRAL_REWARD_DURATION} {settings.REFERRAL_REWARD_TYPE} of Prime Access.
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                disabled={loading}
                                className={`w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50 text-indigo-200' : 'text-white hover:bg-indigo-500 active:scale-95'}`}
                            >
                                <Save size={16} /> Apply Settings
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/60 p-6 rounded-[2rem] border border-gray-800 flex flex-col items-center justify-center text-center">
                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Referrals</span>
                            <span className="text-3xl font-black text-white">{stats.total}</span>
                        </div>
                        <div className="bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-500/20 flex flex-col items-center justify-center text-center">
                            <span className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest mb-2">Success (Paid)</span>
                            <span className="text-3xl font-black text-emerald-400">{stats.successful}</span>
                        </div>
                    </div>

                    {/* Link Generator Demo */}
                    <div className="bg-gray-900/40 p-6 rounded-[2rem] border border-gray-800 space-y-4">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                            <LinkIcon size={12} /> Link Format Structure
                        </label>
                        <div className="bg-black/50 p-4 rounded-xl border border-gray-800 font-mono text-[11px] text-gray-400 break-all select-all">
                            https://examredy.in?ref=<span className="text-indigo-400">username</span>
                        </div>
                    </div>

                </div>

                {/* Right Column: Referral Table */}
                <div className="xl:col-span-2">
                    <div className="bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 shadow-2xl h-full">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mb-8">
                            <Users className="text-indigo-400" size={24} /> Referral Registry
                        </h3>

                        {referrals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <Users size={48} className="opacity-20 mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest">No referrals logged yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-800 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                            <th className="p-4">Referrer</th>
                                            <th className="p-4">Referred User</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4 whitespace-nowrap text-center">Status</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-300">
                                        {referrals.map((r, i) => (
                                            <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                                                <td className="p-4 font-bold">{r.referrer_email || `ID: ${r.referrer_id}`}</td>
                                                <td className="p-4 text-gray-400">{r.referred_email || `ID: ${r.referred_user_id}`}</td>
                                                <td className="p-4 text-gray-500 text-xs">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {r.reward_given ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                            <CheckCircle2 size={10} /> Completed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20">
                                                            <TrendingUp size={10} /> Pending Purchase
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {!r.reward_given && (
                                                        <button
                                                            onClick={() => handleManualGrant(r.id)}
                                                            disabled={loading}
                                                            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                        >
                                                            Manual Grant
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReferralManagement;
