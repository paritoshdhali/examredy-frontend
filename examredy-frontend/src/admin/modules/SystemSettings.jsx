import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, Save, CheckCircle2, Globe, Shield, CreditCard, Search, Mail, Phone, LayoutTemplate, Activity } from 'lucide-react';

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
            <p className="text-sm font-black uppercase tracking-widest">{msg}</p>
        </div>
    );
};

export const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    // State for different settings groups
    const [general, setGeneral] = useState({});
    const [freeLimit, setFreeLimit] = useState({});
    const [seo, setSeo] = useState({});
    const [payments, setPayments] = useState([]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            const data = res.data;

            // Map general settings
            setGeneral({
                SITE_TITLE: data.system.SITE_TITLE || '',
                SUPPORT_EMAIL: data.system.SUPPORT_EMAIL || '',
                WHATSAPP_NUMBER: data.system.WHATSAPP_NUMBER || '',
                FOOTER_TEXT: data.system.FOOTER_TEXT || '',
                GOOGLE_CLIENT_ID: data.system.GOOGLE_CLIENT_ID || ''
            });

            // Map SEO settings
            setSeo({
                META_TITLE: data.system.META_TITLE || data.system.SITE_TITLE || '',
                META_DESC: data.system.META_DESCRIPTION || data.system.META_DESC || '',
                META_KEYWORDS: data.system.META_KEYWORDS || '',
                GA_ID: data.system.GOOGLE_ANALYTICS_ID || '',
                SEARCH_CONSOLE_CODE: data.system.GOOGLE_SEARCH_CONSOLE_CODE || ''
            });

            // Map Free Limits
            setFreeLimit({
                FREE_SESSIONS_COUNT: data.freeLimit.FREE_SESSIONS_COUNT || '',
                FREE_SESSION_MCQS: data.freeLimit.FREE_SESSION_MCQS || '',
                FREE_SESSION_MINUTES: data.freeLimit.FREE_SESSION_MINUTES || '',
                POPUP_HEADING: data.freeLimit.POPUP_HEADING || '',
                POPUP_TEXT: data.freeLimit.POPUP_TEXT || '',
                RENEWAL_WINDOW_HOURS: data.freeLimit.RENEWAL_WINDOW_HOURS || ''
            });

            // Map Payments
            setPayments(data.payment || []);

        } catch (e) {
            console.error(e);
            showToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSaveGeneral = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings/global', { settings: general });
            showToast('General settings updated');
        } catch (e) {
            showToast('Failed to save general settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSEO = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings/global', {
                settings: {
                    META_TITLE: seo.META_TITLE,
                    META_DESCRIPTION: seo.META_DESC,
                    META_KEYWORDS: seo.META_KEYWORDS,
                    GOOGLE_ANALYTICS_ID: seo.GA_ID,
                    GOOGLE_SEARCH_CONSOLE_CODE: seo.SEARCH_CONSOLE_CODE
                }
            });
            showToast('SEO settings updated');
        } catch (e) {
            showToast('Failed to save SEO settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveFreeLimit = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings/free-limit', { settings: freeLimit });
            showToast('Free tier configuration updated');
        } catch (e) {
            showToast('Failed to save free tier configuration', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePayment = async (provider) => {
        const p = payments.find(x => x.provider === provider);
        if (!p) return;
        setSaving(true);
        try {
            await api.put(`/admin/settings/payments/${provider}`, {
                api_key: p.api_key,
                api_secret: p.api_secret,
                is_active: p.is_active
            });
            showToast(`${provider} configuration updated`);
        } catch (e) {
            showToast(`Failed to save ${provider}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const TABS = [
        { id: 'general', label: 'General Info', icon: LayoutTemplate },
        { id: 'freelimit', label: 'Free Tier Limits', icon: Activity },
        { id: 'seo', label: 'SEO & Analytics', icon: Search },
        { id: 'payments', label: 'Payment Gateways', icon: CreditCard }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-md shadow-2xl">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <Settings className="text-slate-400" size={40} />
                        System Settings
                    </h2>
                    <p className="text-gray-500 text-base font-medium mt-2 uppercase tracking-[0.2em]">
                        Global Configurations & Integrations
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Navigation Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-3">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-4 w-full p-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${isActive
                                        ? 'bg-slate-500/10 text-slate-300 border border-slate-500/20 shadow-lg shadow-slate-500/10'
                                        : 'bg-gray-900/40 text-gray-500 border border-gray-800/50 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-slate-400' : ''} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 shadow-2xl relative">

                        {/* GENERAL SETTINGS */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">General Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Platform Name</label>
                                        <input
                                            value={general.SITE_TITLE || ''}
                                            onChange={e => setGeneral({ ...general, SITE_TITLE: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-slate-500/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Support Email</label>
                                        <input
                                            value={general.SUPPORT_EMAIL || ''}
                                            onChange={e => setGeneral({ ...general, SUPPORT_EMAIL: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-slate-500/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">WhatsApp Business</label>
                                        <input
                                            value={general.WHATSAPP_NUMBER || ''}
                                            onChange={e => setGeneral({ ...general, WHATSAPP_NUMBER: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-slate-500/20 outline-none"
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div className="space-y-2 text-right"></div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Footer Copyright</label>
                                        <input
                                            value={general.FOOTER_TEXT || ''}
                                            onChange={e => setGeneral({ ...general, FOOTER_TEXT: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-slate-500/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Google OAuth Client ID</label>
                                        <input
                                            value={general.GOOGLE_CLIENT_ID || ''}
                                            onChange={e => setGeneral({ ...general, GOOGLE_CLIENT_ID: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-slate-500/20 outline-none"
                                            placeholder="XXXXX-YYYYY.apps.googleusercontent.com"
                                        />
                                        <p className="text-[10px] text-gray-600 font-black uppercase ml-1 mt-2 tracking-widest leading-relaxed">Required for "Continue with Google" buttons on Login & Register. Get this from the Google Cloud Console.</p>
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <button onClick={handleSaveGeneral} disabled={saving} className={`px-8 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-500/20 transition-all flex items-center gap-2 ${saving ? 'opacity-50' : 'active:scale-95'}`}>
                                        <Save size={18} /> {saving ? 'SAVING...' : 'SAVE GENERAL INFO'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* FREE TIER LIMITS */}
                        {activeTab === 'freelimit' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter mb-6 flex items-center gap-3">
                                    <Activity size={24} /> Platform Economics & Flow
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gray-950 p-6 rounded-[2rem] border border-gray-800 space-y-2 relative overflow-hidden">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Max Sessions / Day</label>
                                        <input
                                            type="number"
                                            value={freeLimit.FREE_SESSIONS_COUNT || ''}
                                            onChange={e => setFreeLimit({ ...freeLimit, FREE_SESSIONS_COUNT: e.target.value })}
                                            className="w-full bg-transparent text-white font-black text-4xl outline-none"
                                        />
                                    </div>
                                    <div className="bg-gray-950 p-6 rounded-[2rem] border border-gray-800 space-y-2 relative overflow-hidden">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Max MCQs / Session</label>
                                        <input
                                            type="number"
                                            value={freeLimit.FREE_SESSION_MCQS || ''}
                                            onChange={e => setFreeLimit({ ...freeLimit, FREE_SESSION_MCQS: e.target.value })}
                                            className="w-full bg-transparent text-white font-black text-4xl outline-none"
                                        />
                                    </div>
                                    <div className="bg-gray-950 p-6 rounded-[2rem] border border-gray-800 space-y-2 relative overflow-hidden">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Max Minutes / Session</label>
                                        <input
                                            type="number"
                                            value={freeLimit.FREE_SESSION_MINUTES || ''}
                                            onChange={e => setFreeLimit({ ...freeLimit, FREE_SESSION_MINUTES: e.target.value })}
                                            className="w-full bg-transparent text-white font-black text-4xl outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Paywall Heading</label>
                                        <input
                                            value={freeLimit.POPUP_HEADING || ''}
                                            onChange={e => setFreeLimit({ ...freeLimit, POPUP_HEADING: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Paywall Message</label>
                                        <textarea
                                            value={freeLimit.POPUP_TEXT || ''}
                                            onChange={e => setFreeLimit({ ...freeLimit, POPUP_TEXT: e.target.value })}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[100px] resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button onClick={handleSaveFreeLimit} disabled={saving} className={`px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 ${saving ? 'opacity-50' : 'active:scale-95'}`}>
                                        <CheckCircle2 size={18} /> {saving ? 'APPLYING...' : 'ENFORCE ECONOMICS'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SEO SETTINGS */}
                        {activeTab === 'seo' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <h3 className="text-2xl font-black text-blue-400 uppercase tracking-tighter mb-6 flex items-center gap-3">
                                    <Globe size={24} /> Discovery & Tracking
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] ml-1">Global Meta Title</label>
                                        <input
                                            value={seo.META_TITLE || ''}
                                            onChange={e => setSeo({ ...seo, META_TITLE: e.target.value })}
                                            className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] ml-1">Global Meta Description</label>
                                        <textarea
                                            value={seo.META_DESC || ''}
                                            onChange={e => setSeo({ ...seo, META_DESC: e.target.value })}
                                            className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-blue-500/30 outline-none min-h-[100px] resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] ml-1">Keywords</label>
                                        <input
                                            value={seo.META_KEYWORDS || ''}
                                            onChange={e => setSeo({ ...seo, META_KEYWORDS: e.target.value })}
                                            className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
                                            placeholder="comma, separated, keywords"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] ml-1">Google Analytics (G-XXXX)</label>
                                        <input
                                            value={seo.GA_ID || ''}
                                            onChange={e => setSeo({ ...seo, GA_ID: e.target.value })}
                                            className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                                            placeholder="G-..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] ml-1">Search Console Tag</label>
                                        <input
                                            value={seo.SEARCH_CONSOLE_CODE || ''}
                                            onChange={e => setSeo({ ...seo, SEARCH_CONSOLE_CODE: e.target.value })}
                                            className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl py-4 px-6 text-white font-bold text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <button onClick={handleSaveSEO} disabled={saving} className={`px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 ${saving ? 'opacity-50' : 'active:scale-95'}`}>
                                        <Save size={18} /> {saving ? 'UPDATING...' : 'SYNC SEO DATA'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PAYMENTS */}
                        {activeTab === 'payments' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <h3 className="text-2xl font-black text-violet-400 uppercase tracking-tighter mb-6 flex items-center gap-3">
                                    <Shield size={24} /> Financial Gateways
                                </h3>

                                <div className="space-y-6">
                                    {payments.map((gw, i) => (
                                        <div key={i} className={`p-8 rounded-[2.5rem] border ${gw.is_active ? 'bg-violet-500/5 border-violet-500/30' : 'bg-gray-900/50 border-gray-800'}`}>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-lg font-black text-white uppercase tracking-wider">{gw.provider}</h4>
                                                <div className="flex items-center gap-3 bg-gray-950 px-4 py-2 rounded-xl border border-gray-800">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer" htmlFor={`gw-${gw.provider}`}>
                                                        Enable Gateway
                                                    </label>
                                                    <input
                                                        id={`gw-${gw.provider}`}
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-violet-500"
                                                        checked={gw.is_active}
                                                        onChange={(e) => {
                                                            const upd = [...payments];
                                                            upd[i].is_active = e.target.checked;
                                                            setPayments(upd);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Access Key ID</label>
                                                    <input
                                                        value={gw.api_key || ''}
                                                        onChange={(e) => {
                                                            const upd = [...payments];
                                                            upd[i].api_key = e.target.value;
                                                            setPayments(upd);
                                                        }}
                                                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                                                        type="password"
                                                        placeholder="•••••••••••••••••"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Secret Access Token</label>
                                                    <input
                                                        value={gw.api_secret || ''}
                                                        onChange={(e) => {
                                                            const upd = [...payments];
                                                            upd[i].api_secret = e.target.value;
                                                            setPayments(upd);
                                                        }}
                                                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-4 px-6 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                                                        type="password"
                                                        placeholder="•••••••••••••••••"
                                                    />
                                                </div>
                                                <div className="pt-2">
                                                    <button onClick={() => handleSavePayment(gw.provider)} disabled={saving} className={`px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-violet-500/20 transition-all flex items-center gap-2 ${saving ? 'opacity-50' : 'active:scale-95'}`}>
                                                        <Save size={14} /> SAVE {gw.provider.toUpperCase()}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
