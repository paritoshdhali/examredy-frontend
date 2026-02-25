import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    PieChart, Power, PowerOff, Save, Code, FileText,
    Monitor, Smartphone, Layout, ChevronDown, ChevronUp,
    CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck
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

const SlotEditor = ({ label, icon: Icon, color, value, onChange, description }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={`bg-gray-900/60 border border-gray-800 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${expanded ? 'ring-1 ring-offset-0 ring-red-500/30' : ''}`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-8 flex items-center justify-between text-left hover:bg-gray-800/20 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <Icon size={22} className="text-gray-400" />
                    </div>
                    <div>
                        <h4 className="text-white text-base font-black uppercase tracking-tight">{label}</h4>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {value ? (
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg">CONFIGURED</span>
                    ) : (
                        <span className="px-3 py-1 bg-gray-500/10 border border-gray-700 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-lg">EMPTY</span>
                    )}
                    {expanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </div>
            </button>
            {expanded && (
                <div className="px-8 pb-8 animate-in slide-in-from-top duration-200">
                    <textarea
                        className="w-full h-40 bg-gray-950 border border-gray-800 rounded-2xl p-6 text-emerald-400 font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                        placeholder={`PASTE ${label.toUpperCase()} AD CODE HERE...`}
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

export const AdSenseCore = () => {
    const [config, setConfig] = useState({
        ADS_ENABLED: 'false',
        ADS_HEADER_SCRIPT: '',
        ADS_BODY_SCRIPT: '',
        ADS_TXT: '',
        ADS_TOP_BANNER: '',
        ADS_MID_CONTENT: '',
        ADS_BOTTOM_BANNER: '',
        ADS_LEFT_SIDEBAR: '',
        ADS_RIGHT_SIDEBAR: '',
        ADS_FOR_PREMIUM: 'false'
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
            const res = await api.get('/admin/settings');
            const sys = res.data.system || {};
            setConfig({
                ADS_ENABLED: sys.ADS_ENABLED || 'false',
                ADS_HEADER_SCRIPT: sys.ADS_HEADER_SCRIPT || '',
                ADS_BODY_SCRIPT: sys.ADS_BODY_SCRIPT || '',
                ADS_TXT: sys.ADS_TXT || '',
                ADS_TOP_BANNER: sys.ADS_TOP_BANNER || '',
                ADS_MID_CONTENT: sys.ADS_MID_CONTENT || '',
                ADS_BOTTOM_BANNER: sys.ADS_BOTTOM_BANNER || '',
                ADS_LEFT_SIDEBAR: sys.ADS_LEFT_SIDEBAR || '',
                ADS_RIGHT_SIDEBAR: sys.ADS_RIGHT_SIDEBAR || '',
                ADS_FOR_PREMIUM: sys.ADS_FOR_PREMIUM || 'false'
            });
        } catch (e) {
            showToast('Failed to load ad configuration', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const saveConfig = async () => {
        try {
            await api.put('/admin/settings/ads', config);
            showToast('Ad Network synchronized');
        } catch (e) { showToast('Save failed', 'error'); }
    };

    const toggleAds = () => {
        setConfig(prev => ({ ...prev, ADS_ENABLED: prev.ADS_ENABLED === 'true' ? 'false' : 'true' }));
    };

    const isEnabled = config.ADS_ENABLED === 'true';

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-10 rounded-[3rem] border border-gray-800/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-48 h-48 bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-5">
                        <PieChart className="text-red-500" size={40} />
                        AdSense Core
                    </h2>
                    <p className="text-gray-500 text-base font-medium mt-2 uppercase tracking-[0.2em]">
                        Monetization Network & Ad Unit Configuration
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={toggleAds}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${isEnabled
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500'
                            : 'bg-red-600 text-white shadow-red-500/20 hover:bg-red-500'
                            }`}
                    >
                        {isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                        {isEnabled ? 'ADS LIVE' : 'ADS OFF'}
                    </button>
                    <button
                        onClick={saveConfig}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Save size={18} /> Deploy Config
                    </button>
                </div>
            </div>

            {/* Global Status Card */}
            <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 transition-all duration-500 ${isEnabled
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
                }`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isEnabled ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {isEnabled ? <Power size={28} className="text-emerald-400" /> : <PowerOff size={28} className="text-red-400" />}
                </div>
                <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${isEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isEnabled ? 'Revenue Stream Active' : 'Revenue Stream Suspended'}
                    </h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {isEnabled ? 'All configured ad units are serving impressions to users' : 'Ads are globally disabled. No impressions will be served.'}
                    </p>
                </div>
            </div>

            {/* Premium Shield Toggle Card */}
            <div className={`p-8 rounded-[2.5rem] border flex items-center justify-between gap-6 transition-all duration-500 ${config.ADS_FOR_PREMIUM === 'true'
                ? 'bg-orange-500/5 border-orange-500/20'
                : 'bg-indigo-500/5 border-indigo-500/20'
                }`}>
                <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.ADS_FOR_PREMIUM === 'true' ? 'bg-orange-500/10' : 'bg-indigo-500/10'}`}>
                        <ShieldCheck className={config.ADS_FOR_PREMIUM === 'true' ? 'text-orange-400' : 'text-indigo-400'} size={28} />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black uppercase tracking-tight ${config.ADS_FOR_PREMIUM === 'true' ? 'text-orange-400' : 'text-indigo-400'}`}>
                            {config.ADS_FOR_PREMIUM === 'true' ? 'Premium Shield Disabled' : 'Premium Shield Active'}
                        </h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                            {config.ADS_FOR_PREMIUM === 'true' ? 'Ads are being shown even to Prime subscribers' : 'Ads are automatically hidden for all Prime subscribers'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setConfig(prev => ({ ...prev, ADS_FOR_PREMIUM: prev.ADS_FOR_PREMIUM === 'true' ? 'false' : 'true' }))}
                    className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${config.ADS_FOR_PREMIUM === 'true'
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}
                >
                    {config.ADS_FOR_PREMIUM === 'true' ? 'DISABLE ADS FOR PRO' : 'ENABLE ADS FOR PRO'}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Ad Slot Editors */}
                <div className="xl:col-span-2 space-y-6">
                    <h3 className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] px-4 flex items-center gap-2">
                        Ad Unit Placement Zones
                    </h3>

                    <SlotEditor
                        label="Top Banner" icon={Layout} color="cyan-400"
                        description="Above-the-fold hero placement • Highest CTR zone"
                        value={config.ADS_TOP_BANNER}
                        onChange={val => setConfig({ ...config, ADS_TOP_BANNER: val })}
                    />
                    <SlotEditor
                        label="Mid-Content" icon={Monitor} color="indigo-400"
                        description="In-feed native placement • Between content sections"
                        value={config.ADS_MID_CONTENT}
                        onChange={val => setConfig({ ...config, ADS_MID_CONTENT: val })}
                    />
                    <SlotEditor
                        label="Bottom Banner" icon={Smartphone} color="orange-400"
                        description="Sticky footer placement • Persistent visibility"
                        value={config.ADS_BOTTOM_BANNER}
                        onChange={val => setConfig({ ...config, ADS_BOTTOM_BANNER: val })}
                    />
                    <SlotEditor
                        label="Left Sidebar" icon={Monitor} color="pink-400"
                        description="Vertical skyscraper • Left side of main content"
                        value={config.ADS_LEFT_SIDEBAR}
                        onChange={val => setConfig({ ...config, ADS_LEFT_SIDEBAR: val })}
                    />
                    <SlotEditor
                        label="Right Sidebar" icon={Monitor} color="teal-400"
                        description="Vertical skyscraper • Right side of main content"
                        value={config.ADS_RIGHT_SIDEBAR}
                        onChange={val => setConfig({ ...config, ADS_RIGHT_SIDEBAR: val })}
                    />
                </div>

                {/* Global Scripts Sidebar */}
                <div className="space-y-8">
                    <div className="bg-gray-900/60 border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                        <h3 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-3">
                            <Code className="text-red-400" size={18} /> Network Scripts
                        </h3>

                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Header Script (AdSense Tag)</label>
                            <textarea
                                className="w-full h-28 bg-gray-950 border border-gray-800 rounded-2xl p-5 text-red-400 font-mono text-[10px] focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                                placeholder="<script async src='https://pagead2.googlesyndication.com/...'></script>"
                                value={config.ADS_HEADER_SCRIPT}
                                onChange={e => setConfig({ ...config, ADS_HEADER_SCRIPT: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Body Script (Auto Ads)</label>
                            <textarea
                                className="w-full h-28 bg-gray-950 border border-gray-800 rounded-2xl p-5 text-orange-400 font-mono text-[10px] focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                                placeholder="Google Auto Ads or custom in-body script..."
                                value={config.ADS_BODY_SCRIPT}
                                onChange={e => setConfig({ ...config, ADS_BODY_SCRIPT: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-900/60 border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                        <h3 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-3">
                            <FileText className="text-yellow-400" size={18} /> ads.txt Content
                        </h3>
                        <textarea
                            className="w-full h-36 bg-gray-950 border border-gray-800 rounded-2xl p-5 text-yellow-400 font-mono text-[10px] focus:ring-2 focus:ring-yellow-500/20 outline-none resize-none"
                            placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
                            value={config.ADS_TXT}
                            onChange={e => setConfig({ ...config, ADS_TXT: e.target.value })}
                        />
                        <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-2xl">
                            <p className="text-[9px] text-yellow-400 font-bold leading-relaxed flex gap-2">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                This content will be served at /ads.txt for AdSense verification. Keep this accurate to avoid approval issues.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdSenseCore;
