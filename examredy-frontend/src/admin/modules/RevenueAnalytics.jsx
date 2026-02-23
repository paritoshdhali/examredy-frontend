import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    TrendingUp, IndianRupee, Users, ShoppingCart,
    Calendar, ArrowUpRight, ArrowDownRight, Activity,
    Download, Filter, RefreshCw, Layers, Search
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

// Custom SVG Line Chart Component
const MiniChart = ({ data, color = "#10b981", height = 80 }) => {
    if (!data || data.length < 2) return <div className="h-20 flex items-center justify-center text-gray-700 font-bold uppercase text-[10px]">Insufficient Data</div>;

    const maxVal = Math.max(...data.map(d => d.amount), 1);
    const width = 300;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - (d.amount / maxVal) * height
    }));

    const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaData = pathData + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaData} fill="url(#gradient)" />
            <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#000" stroke={color} strokeWidth="2" className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer" />
            ))}
        </svg>
    );
};

export const RevenueAnalytics = () => {
    const [revenue, setRevenue] = useState({ total: 0, today: 0, thisMonth: 0, thisYear: 0, chartData: [] });
    const [subs, setSubs] = useState({ activePremium: 0, totalUsers: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [revRes, subRes, transRes] = await Promise.all([
                api.get('/admin/analytics/revenue'),
                api.get('/admin/analytics/subscriptions'),
                api.get('/admin/payments/transactions')
            ]);
            setRevenue(revRes.data);
            setSubs(subRes.data);
            setTransactions(transRes.data);
        } catch (e) {
            showToast('Analytics sync failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            <Toast msg={toast.msg} type={toast.type} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-10 rounded-[3rem] border border-gray-800/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div>
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-5">
                        <TrendingUp className="text-emerald-500" size={48} />
                        Revenue Engine
                    </h2>
                    <p className="text-gray-500 text-base font-medium mt-3 uppercase tracking-[0.3em]">
                        Performance Metrics & Financial Intelligence
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={fetchData}
                        className={`p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl border border-gray-700 transition-all ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                        <Download size={18} /> Export Data
                    </button>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Cumulative Revenue', val: revenue.total, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: '24h Performance', val: revenue.today, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                    { label: 'Monthly Velocity', val: revenue.thisMonth, icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Market Share (Active)', val: subs.activePremium, unit: 'PRO', icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' }
                ].map((card, i) => (
                    <div key={i} className="bg-gray-950 border border-gray-800 p-8 rounded-[2.5rem] relative group hover:border-white/10 transition-all duration-300">
                        <div className={`w-14 h-14 ${card.bg} rounded-2xl mb-6 flex items-center justify-center border border-white/5`}>
                            <card.icon className={card.color} size={28} />
                        </div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{card.label}</p>
                        <div className="text-3xl font-black text-white tracking-tight">
                            {card.unit ? card.val : formatCurrency(card.val)}
                            {card.unit && <span className="text-xs text-gray-600 ml-2">{card.unit}</span>}
                        </div>
                        <div className="absolute top-8 right-8 text-emerald-500 flex items-center gap-1">
                            <ArrowUpRight size={14} />
                            <span className="text-[10px] font-black italic">+8.4%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Analytics Segment */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Visual Trend Chart */}
                <div className="xl:col-span-2 bg-gray-900/40 border border-gray-800 rounded-[3rem] p-10 flex flex-col min-h-[450px]">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-white text-xl font-black uppercase tracking-tight">Revenue Trajectory</h3>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Rolling 30-Day Performance Array</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-2 px-4 py-1.5 bg-gray-950 border border-gray-800 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                Live Sync
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 relative mt-4">
                        <div className="h-full w-full">
                            <MiniChart data={revenue.chartData} height={150} color="#10b981" />
                        </div>

                        {/* Grid lines placeholder */}
                        <div className="absolute inset-0 grid grid-rows-4 pointer-events-none opacity-[0.03]">
                            {[...Array(5)].map((_, i) => <div key={i} className="border-t border-white"></div>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-12">
                        {revenue.chartData.slice(-4).map((d, i) => (
                            <div key={i} className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800">
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">
                                    {new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </p>
                                <p className="text-white text-sm font-black">₹{d.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Dashboard */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all"></div>

                        <h3 className="text-white text-lg font-black uppercase tracking-tight flex items-center gap-4 mb-8">
                            <Layers className="text-indigo-400" /> Subscription Health
                        </h3>

                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Market Penetration</p>
                                    <p className="text-white text-sm font-black">{Math.round((subs.activePremium / subs.totalUsers) * 100 || 0)}%</p>
                                </div>
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                                        style={{ width: `${(subs.activePremium / subs.totalUsers) * 100 || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="bg-gray-800/20 p-6 rounded-3xl border border-gray-800/50 text-center">
                                    <div className="text-2xl font-black text-indigo-400 mb-1">{subs.activePremium}</div>
                                    <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Active Pass</div>
                                </div>
                                <div className="bg-gray-800/20 p-6 rounded-3xl border border-gray-800/50 text-center">
                                    <div className="text-2xl font-black text-gray-400 mb-1">{subs.totalUsers - subs.activePremium}</div>
                                    <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Free Tier</div>
                                </div>
                            </div>

                            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem]">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                                    Economic Recommendation: Incentivize conversion with a 24-hour flash sale for free tier users.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-500 border border-emerald-400/20 p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)] shadow-emerald-500/20 flex items-center justify-between text-white group cursor-pointer hover:scale-[1.02] transition-all">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Fiscal Year Target</p>
                            <h4 className="text-3xl font-black tracking-tight">₹1.2M <span className="text-sm opacity-60 font-bold ml-1">PA</span></h4>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all">
                            <ShoppingCart size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Ledger */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-gray-800 flex items-center justify-between bg-gray-800/20">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <ShoppingCart className="text-emerald-500" /> Recent Invoices
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input
                            placeholder="SEARCH TRANSACTION..."
                            className="bg-gray-950 border border-gray-800 rounded-2xl py-3 pl-12 pr-6 text-white text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500/20 outline-none w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-950">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Transaction ID</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Entity (User)</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Fiscal amount</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Temporal stamp</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {transactions.slice(0, 10).map((t) => (
                                <tr key={t.id} className="hover:bg-gray-800/10 transition-colors">
                                    <td className="px-10 py-6 font-mono text-[11px] text-gray-400">{t.razorpay_payment_id || 'INTERNAL_SYS'}</td>
                                    <td className="px-10 py-6">
                                        <p className="text-white text-xs font-black">{t.user_email || 'GUEST_USER'}</p>
                                        <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest mt-0.5">Verified Identity</p>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="text-white text-sm font-black italic">{formatCurrency(t.amount)}</div>
                                    </td>
                                    <td className="px-10 py-6 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                        {new Date(t.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${t.status === 'captured' || t.status === 'success'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center opacity-20">
                                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.4em]">Zero Transactions Detected in Buffer</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;
