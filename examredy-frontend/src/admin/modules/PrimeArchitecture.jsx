import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    CreditCard, Plus, Edit3, Trash2, Power, PowerOff,
    Gift, TrendingUp, Users, Clock, IndianRupee, Save,
    CheckCircle2, AlertCircle, X, ChevronRight, Settings
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

export const PrimeArchitecture = () => {
    const [plans, setPlans] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [settings, setSettings] = useState({ REFERRAL_REWARD_DAYS: '2', REFERRAL_MIN_PURCHASE_RS: '10' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    // Modals
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [planForm, setPlanForm] = useState({ name: '', duration_hours: 24, price: 99, is_active: true, sessions_limit: 10, referral_bonus_sessions: 2 });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansRes, refRes, settingsRes] = await Promise.all([
                api.get('/admin/plans'),
                api.get('/admin/referrals'),
                api.get('/admin/settings')
            ]);
            setPlans(plansRes.data);
            setReferrals(refRes.data);
            setSettings({
                REFERRAL_REWARD_DAYS: settingsRes.data.system.REFERRAL_REWARD_DAYS || '2',
                REFERRAL_MIN_PURCHASE_RS: settingsRes.data.system.REFERRAL_MIN_PURCHASE_RS || '10'
            });
        } catch (e) {
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSavePlan = async () => {
        if (!planForm.name) return showToast('Plan name is required', 'error');
        console.log('[DEBUG-PLAN-SAVE] Target:', editingPlan ? `PUT /plans/${editingPlan.id}` : 'POST /plans');
        console.log('[DEBUG-PLAN-SAVE] Payload:', planForm);
        setLoading(true);
        try {
            if (editingPlan) {
                await api.put(`/admin/plans/${editingPlan.id}`, planForm);
                showToast('Plan updated successfully');
            } else {
                await api.post('/admin/plans', planForm);
                showToast('New plan added');
            }
            setShowPlanModal(false);
            setEditingPlan(null);
            fetchData();
        } catch (e) {
            console.error('Save error:', e);
            showToast(e.response?.data?.error || 'Operation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const togglePlanStatus = async (plan) => {
        try {
            await api.put(`/admin/plans/${plan.id}/status`, { is_active: !plan.is_active });
            showToast(`Plan ${plan.is_active ? 'disabled' : 'enabled'}`);
            fetchData();
        } catch (e) { showToast('Toggle failed', 'error'); }
    };

    const deletePlan = async (id) => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/plans/${id}`);
            showToast('Plan deleted');
            fetchData();
        } catch (e) { showToast('Delete failed', 'error'); }
    };

    const saveReferralSettings = async () => {
        try {
            await api.put('/admin/settings/referral', settings);
            showToast('Referral rules updated');
        } catch (e) { showToast('Update failed', 'error'); }
    };

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-500">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-md shadow-2xl">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <CreditCard className="text-pink-500" size={40} />
                        Prime Architecture
                    </h2>
                    <p className="text-gray-500 text-base font-medium mt-2 uppercase tracking-[0.2em]">
                        Subscription Economy & Incentive Engineering
                    </p>
                </div>
                <button
                    onClick={() => { setEditingPlan(null); setPlanForm({ name: '', duration_hours: 24, price: 99, is_active: true, sessions_limit: 10, referral_bonus_sessions: 2 }); setShowPlanModal(true); }}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={20} /> New Plan
                </button>
            </div>

            <div className="w-full">

                {/* Plans List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            Active Subscription Tiers
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className={`relative p-8 rounded-[2rem] border transition-all duration-300 group ${plan.is_active
                                ? 'bg-gray-900/60 border-gray-800 hover:border-pink-500/30'
                                : 'bg-gray-900/20 border-gray-800/50 grayscale'
                                }`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700">
                                        <IndianRupee size={24} className={plan.is_active ? 'text-emerald-400' : 'text-gray-600'} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingPlan(plan); setPlanForm(plan); setShowPlanModal(true); }} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all"><Edit3 size={16} /></button>
                                        <button onClick={() => deletePlan(plan.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <h4 className="text-white text-xl font-black uppercase tracking-tight mb-2">{plan.name}</h4>
                                <p className="text-pink-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
                                    <TrendingUp size={14} /> {plan.sessions_limit} PREMIUM SESSIONS
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-800">
                                    <div className="text-2xl font-black text-white">₹{plan.price}</div>
                                    <button
                                        onClick={() => togglePlanStatus(plan)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.is_active
                                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            }`}
                                    >
                                        {plan.is_active ? <Power size={12} /> : <PowerOff size={12} />}
                                        {plan.is_active ? 'ACTIVE' : 'DISABLED'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL: ADD/EDIT PLAN */}
            {showPlanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 shadow-2xl">
                    <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8 border-b border-gray-800 flex items-center justify-between bg-gray-800/20">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                {editingPlan ? <Settings className="text-pink-500" /> : <Plus className="text-emerald-500" />}
                                {editingPlan ? 'Edit Configuration' : 'Establish New Tier'}
                            </h3>
                            <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-gray-800 rounded-2xl text-gray-400 hover:text-white transition-all"><X size={24} /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Plan Identity (Name)</label>
                                <input
                                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-black text-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                                    placeholder="MONTHLY PASS, 1 HOUR ACCESS..."
                                    value={planForm.name}
                                    onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Sessions Limit</label>
                                    <input
                                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-black text-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                                        type="number"
                                        value={planForm.sessions_limit}
                                        onChange={e => setPlanForm({ ...planForm, sessions_limit: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Referral Bonus (Sessions)</label>
                                    <input
                                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-black text-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                                        type="number"
                                        value={planForm.referral_bonus_sessions}
                                        onChange={e => setPlanForm({ ...planForm, referral_bonus_sessions: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Price (₹)</label>
                                    <input
                                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-black text-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                                        type="number"
                                        value={planForm.price}
                                        onChange={e => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-2xl border border-gray-700/50">
                                    <input
                                        id="plan-active"
                                        type="checkbox"
                                        className="w-5 h-5 accent-pink-500"
                                        checked={planForm.is_active}
                                        onChange={e => setPlanForm({ ...planForm, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="plan-active" className="text-xs font-black text-gray-300 uppercase tracking-widest cursor-pointer">Active</label>
                                </div>
                            </div>

                            <button
                                onClick={handleSavePlan}
                                disabled={loading}
                                className={`w-full py-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-pink-500/20 mt-6 transition-transform active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
                            >
                                {loading ? 'PROCESSING...' : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        {editingPlan ? 'SAVE CHANGES' : 'CREATE PLAN'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrimeArchitecture;
