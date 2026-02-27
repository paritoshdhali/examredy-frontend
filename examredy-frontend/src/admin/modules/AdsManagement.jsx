import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layout, Smartphone, Save, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Monitor, ExternalLink, ShieldCheck } from 'lucide-react';

const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
            <p className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                {type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {msg}
            </p>
        </div>
    );
};

const AdCard = ({ title, icon: Icon, value, onChange, isActive, onToggle, platform, adType }) => (
    <div className="bg-gray-900/40 border border-gray-800/50 p-6 rounded-[2rem] backdrop-blur-md hover:border-emerald-500/30 transition-all duration-500 group">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Icon className="text-emerald-500" size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</h4>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{platform} / {adType}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`transition-all duration-300 ${isActive ? 'text-emerald-500' : 'text-gray-600'}`}
            >
                {isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
        </div>

        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3 text-sm font-medium text-white outline-none focus:border-emerald-500/50 transition-colors uppercase placeholder:text-gray-700"
                placeholder="ENTER AD UNIT ID"
            />
            {!isActive && (
                <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.2em]">Inactive</span>
                </div>
            )}
        </div>
    </div>
);

export const AdsManagement = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    // Internal state for form handling
    const [formData, setFormData] = useState({
        'web-banner_top': '',
        'web-banner_middle': '',
        'web-banner_bottom': '',
        'app-app_banner': '',
        'app-app_interstitial': '',
        'web-banner_top-active': true,
        'web-banner_middle-active': true,
        'web-banner_bottom-active': true,
        'app-app_banner-active': true,
        'app-app_interstitial-active': true
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchAds = async () => {
        try {
            const res = await api.get('/admin/ads');
            setAds(res.data);

            // Map data to formData
            const newData = { ...formData };
            res.data.forEach(ad => {
                const key = `${ad.platform}-${ad.ad_type}`;
                newData[key] = ad.ad_unit_id;
                newData[`${key}-active`] = ad.is_active;
            });
            setFormData(newData);
        } catch (e) {
            showToast('Failed to load ad settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleUpdate = async (platform, adType) => {
        setSaving(true);
        const key = `${platform}-${adType}`;
        try {
            await api.post('/admin/ads', {
                platform,
                ad_type: adType,
                ad_unit_id: formData[key],
                is_active: formData[`${key}-active`]
            });
            showToast(`${adType.replace('_', ' ')} updated successfully`);
            fetchAds();
        } catch (e) {
            showToast('Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-transparent">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar flex flex-col space-y-8 animate-in fade-in duration-700">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header section with glassmorphism */}
            <div className="relative group overflow-hidden bg-gray-900/40 border border-gray-800/50 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl transition-all duration-700 hover:border-emerald-500/20">
                <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                    <ShieldCheck size={160} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">
                            <Layout size={12} /> Ads Control Panel
                        </div>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                            Ad Management
                        </h2>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em] max-w-lg">
                            Configure dynamic ad units for Website and Flutter app without code changes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Web Ads Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Monitor size={14} className="text-emerald-500" /> Website Ad Placements
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AdCard
                        title="Top Banner Slot"
                        platform="web"
                        adType="banner_top"
                        icon={Layout}
                        value={formData['web-banner_top']}
                        isActive={formData['web-banner_top-active']}
                        onChange={(val) => setFormData({ ...formData, 'web-banner_top': val })}
                        onToggle={() => setFormData({ ...formData, 'web-banner_top-active': !formData['web-banner_top-active'] })}
                    />
                    <AdCard
                        title="Middle Content Slot"
                        platform="web"
                        adType="banner_middle"
                        icon={Layout}
                        value={formData['web-banner_middle']}
                        isActive={formData['web-banner_middle-active']}
                        onChange={(val) => setFormData({ ...formData, 'web-banner_middle': val })}
                        onToggle={() => setFormData({ ...formData, 'web-banner_middle-active': !formData['web-banner_middle-active'] })}
                    />
                    <AdCard
                        title="Bottom Footer Slot"
                        platform="web"
                        adType="banner_bottom"
                        icon={Layout}
                        value={formData['web-banner_bottom']}
                        isActive={formData['web-banner_bottom-active']}
                        onChange={(val) => setFormData({ ...formData, 'web-banner_bottom': val })}
                        onToggle={() => setFormData({ ...formData, 'web-banner_bottom-active': !formData['web-banner_bottom-active'] })}
                    />
                </div>
                <div className="flex justify-end px-4">
                    <button
                        onClick={() => {
                            handleUpdate('web', 'banner_top');
                            handleUpdate('web', 'banner_middle');
                            handleUpdate('web', 'banner_bottom');
                        }}
                        disabled={saving}
                        className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={14} /> {saving ? 'SAVING CONFIG...' : 'SAVE WEB AD CONFIG'}
                    </button>
                </div>
            </div>

            {/* App Ads Section */}
            <div className="space-y-6 pb-12">
                <div className="flex items-center gap-4 px-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Smartphone size={14} className="text-emerald-500" /> Flutter App AdMob IDs
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdCard
                        title="In-App Banner Ad"
                        platform="app"
                        adType="app_banner"
                        icon={Smartphone}
                        value={formData['app-app_banner']}
                        isActive={formData['app-app_banner-active']}
                        onChange={(val) => setFormData({ ...formData, 'app-app_banner': val })}
                        onToggle={() => setFormData({ ...formData, 'app-app_banner-active': !formData['app-app_banner-active'] })}
                    />
                    <AdCard
                        title="Interstitial Fullscreen"
                        platform="app"
                        adType="app_interstitial"
                        icon={ExternalLink}
                        value={formData['app-app_interstitial']}
                        isActive={formData['app-app_interstitial-active']}
                        onChange={(val) => setFormData({ ...formData, 'app-app_interstitial': val })}
                        onToggle={() => setFormData({ ...formData, 'app-app_interstitial-active': !formData['app-app_interstitial-active'] })}
                    />
                </div>
                <div className="flex justify-end px-4">
                    <button
                        onClick={() => {
                            handleUpdate('app', 'app_banner');
                            handleUpdate('app', 'app_interstitial');
                        }}
                        disabled={saving}
                        className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={14} /> {saving ? 'SAVING CONFIG...' : 'SAVE APP AD CONFIG'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(17, 24, 39, 0.5); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(55, 65, 81, 1); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(75, 85, 99, 1); }
            `}</style>
        </div>
    );
};

export default AdsManagement;
