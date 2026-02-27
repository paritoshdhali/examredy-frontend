import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlobalCategories, SchoolCentral, UniversityHub, CompetitiveArena } from './modules/EducationModules';
import { NeuralHub } from './modules/NeuralHub';
import { UserManagement } from './modules/UserManagement';
import { PrimeArchitecture } from './modules/PrimeArchitecture';
import { MCQModeration } from './modules/MCQModeration';
import { RevenueAnalytics } from './modules/RevenueAnalytics';
import { AdSenseCore } from './modules/AdSenseCore';
import { LegalCompliance } from './modules/LegalCompliance';
import { SystemSettings } from './modules/SystemSettings';
import { AdsManagement } from './modules/AdsManagement';
import { DashboardOverview } from './modules/DashboardOverview';
import { ReferralManagement } from './modules/ReferralManagement';
import {
    LayoutDashboard, School, GraduationCap, Briefcase,
    Users, CreditCard, Cpu, CheckSquare,
    DollarSign, PieChart, FileText, Settings, LogOut,
    ChevronRight, ShieldCheck
} from 'lucide-react';

// ─── Sidebar menu definition ───────────────────────────────────────────────
const MENU = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-400' },
    { id: 'categories', label: 'Global Categories', icon: CheckSquare, color: 'text-pink-400' },
    { id: 'school', label: 'School Central', icon: School, color: 'text-blue-400' },
    { id: 'university', label: 'University Hub', icon: GraduationCap, color: 'text-violet-400' },
    { id: 'competitive', label: 'Competitive Arena', icon: Briefcase, color: 'text-yellow-400' },
    { id: 'users', label: 'User Management', icon: Users, color: 'text-green-400' },
    { id: 'prime', label: 'Prime Architecture', icon: CreditCard, color: 'text-pink-400' },
    { id: 'ai', label: 'Neural Hub (AI)', icon: Cpu, color: 'text-cyan-400' },
    { id: 'mcq', label: 'MCQ Moderation', icon: CheckSquare, color: 'text-orange-400' },
    { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'ads', label: 'AdSense Core', icon: PieChart, color: 'text-red-400' },
    { id: 'legal', label: 'Legal Compliance', icon: FileText, color: 'text-gray-400' },
    { id: 'settings', label: 'System Settings', icon: Settings, color: 'text-slate-400' },
    { id: 'referral', label: 'Referral Program', icon: Users, color: 'text-pink-400' },
    { id: 'ads_management', label: 'Ads Management', icon: PieChart, color: 'text-emerald-400' },
];

// ─── Module placeholder renderer ──────────────────────────────────────────
const MODULE_META = {
    dashboard: { title: 'Dashboard', desc: 'Overview Analytics & System Diagnostics', badge: 'CORE' },
    categories: { title: 'Global Categories', desc: 'Manage all top-level exam and education categories', badge: 'EDUCATION' },
    school: { title: 'School Central', desc: 'State → Board → Class → Stream → Subject → Chapter hierarchy', badge: 'EDUCATION' },
    university: { title: 'University Hub', desc: 'University → Degree → Semester management', badge: 'EDUCATION' },
    competitive: { title: 'Competitive Arena', desc: 'UPSC / SSC / NEET papers and stages', badge: 'EDUCATION' },
    users: { title: 'User Management', desc: 'Identity, role, subscription controls', badge: 'ACCESS' },
    prime: { title: 'Prime Architecture', desc: 'Subscription plans and monetization tiers', badge: 'ECONOMICS' },
    ai: { title: 'Neural Hub (AI)', desc: 'AI provider config and model selection', badge: 'AI' },
    mcq: { title: 'MCQ Moderation', desc: 'Review and approve AI-generated questions', badge: 'CONTENT' },
    revenue: { title: 'Revenue Analytics', desc: 'Transactions, payments and revenue reports', badge: 'ECONOMICS' },
    ads: { title: 'AdSense Core', desc: 'Ad slots, scripts and ads.txt management', badge: 'MARKETING' },
    legal: { title: 'Legal Compliance', desc: 'Privacy Policy, Terms and legal docs editor', badge: 'POLICY' },
    settings: { title: 'System Settings', desc: 'SEO, branding, global toggles and config', badge: 'SYSTEM' },
    referral: { title: 'Referral Program', desc: 'Incentive tracking and reward management', badge: 'GROWTH' },
    ads_management: { title: 'Ads Management', desc: 'Dynamic Ad Mob and Web banner IDs', badge: 'MARKETING' },
};

const BADGE_COLORS = {
    CORE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    EDUCATION: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ACCESS: 'bg-green-500/10 text-green-400 border-green-500/20',
    ECONOMICS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    AI: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    CONTENT: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    MARKETING: 'bg-red-500/10 text-red-400 border-red-500/20',
    POLICY: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    SYSTEM: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    GROWTH: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

function ModulePlaceholder({ id }) {
    // Real modules
    if (id === 'dashboard') return <DashboardOverview />;
    if (id === 'categories') return <GlobalCategories />;
    if (id === 'school') return <SchoolCentral />;
    if (id === 'university') return <UniversityHub />;
    if (id === 'competitive') return <CompetitiveArena />;
    if (id === 'ai') return <NeuralHub />;
    if (id === 'users') return <UserManagement />;
    if (id === 'prime') return <PrimeArchitecture />;
    if (id === 'mcq') return <MCQModeration />;
    if (id === 'revenue') return <RevenueAnalytics />;
    if (id === 'ads') return <AdSenseCore />;
    if (id === 'legal') return <LegalCompliance />;
    if (id === 'settings') return <SystemSettings />;
    if (id === 'referral') return <ReferralManagement />;
    if (id === 'ads_management') return <AdsManagement />;

    const meta = MODULE_META[id] || MODULE_META.dashboard;
    const menuItem = MENU.find(m => m.id === id) || MENU[0];
    const Icon = menuItem.icon;
    const badgeClass = BADGE_COLORS[meta.badge] || BADGE_COLORS.CORE;

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-10 text-center">
            <div className="max-w-lg w-full">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-gray-800 border border-gray-700`}>
                    <Icon size={36} className={menuItem.color} />
                </div>

                {/* Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 ${badgeClass}`}>
                    {meta.badge}
                </span>

                {/* Title */}
                <h2 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">
                    {meta.title}
                </h2>

                {/* Description */}
                <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                    {meta.desc}
                </p>

                {/* Status */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-left">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-3">Module Status</p>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm font-bold">Layer 2 Layout</span>
                        <span className="text-green-400 text-[10px] font-black bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">✓ STABLE</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-sm font-bold">Feature Module</span>
                        <span className="text-yellow-400 text-[10px] font-black bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">⏳ NEXT LAYER</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main AdminDashboard Component ─────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const activeMenuItem = MENU.find(m => m.id === activeTab) || MENU[0];
    const ActiveIcon = activeMenuItem.icon;

    return (
        <div className="flex min-h-screen bg-gray-950 font-sans">

            {/* ── Left Sidebar ───────────────────────────────────────── */}
            <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-30 overflow-hidden">

                {/* Brand */}
                <div className="px-5 py-5 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-black text-sm tracking-tight leading-none">EXAMREDY</p>
                        <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Admin v2.0</p>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    {MENU.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left group ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={16} className={isActive ? 'text-white' : item.color} />
                                <span className="flex-1 truncate">{item.label}</span>
                                {isActive && <ChevronRight size={14} className="opacity-60 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-gray-800 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-bold"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Area ──────────────────────────────────────────── */}
            <div className="flex-1 ml-60 flex flex-col min-h-screen">

                {/* Top Header */}
                <header className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">

                    {/* Left: breadcrumb */}
                    <div className="flex items-center gap-3">
                        <ActiveIcon size={18} className={activeMenuItem.color} />
                        <h1 className="text-white font-black text-base uppercase tracking-tight">
                            {activeMenuItem.label}
                        </h1>
                    </div>

                    {/* Right: admin info */}
                    <div className="flex items-center gap-4">
                        {/* Role Badge */}
                        <span className="hidden md:inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                            Admin
                        </span>

                        {/* Admin name + avatar */}
                        <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-white text-xs font-black leading-none">
                                    {user?.username || user?.email?.split('@')[0] || 'Admin'}
                                </p>
                                <p className="text-gray-500 text-[10px] font-bold mt-0.5">
                                    {user?.email || 'admin@examredy.in'}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-black">
                                    {(user?.username || user?.email || 'A')[0].toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-xs font-bold"
                        >
                            <LogOut size={14} />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Module Content */}
                <main className="flex-1">
                    <ModulePlaceholder id={activeTab} />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
