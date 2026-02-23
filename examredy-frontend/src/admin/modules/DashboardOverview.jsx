import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Users,
    CreditCard,
    Database,
    DollarSign,
    Activity,
    ArrowUpRight,
    UserPlus,
    Clock,
    Zap,
    LayoutDashboard
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-gray-900/40 border border-gray-800/50 p-6 rounded-[2.5rem] backdrop-blur-md shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] -mr-8 -mt-8 rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`}></div>
        <div className="relative flex justify-between items-start">
            <div className="space-y-4">
                <div className={`p-3 rounded-2xl bg-gray-950 border border-gray-800 w-fit ${color.split(' ')[1]}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h4>
                    <p className="text-3xl font-black text-white mt-1 tracking-tighter">
                        {typeof value === 'number' && title.includes('REVENUE') ? `₹${value.toLocaleString()}` : value.toLocaleString()}
                    </p>
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                        <ArrowUpRight size={12} /> {trend}
                    </div>
                )}
            </div>
        </div>
    </div>
);

export const DashboardOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        totalMcqs: 0,
        totalRevenue: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/dashboard/stats');
            setStats(res.data.stats);
            setRecentActivity(res.data.recentActivity);
        } catch (e) {
            console.error('Failed to fetch dashboard stats', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-md shadow-2xl">
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <LayoutDashboard className="text-indigo-500" size={40} />
                        Systems Control
                    </h2>
                    <p className="text-gray-500 text-base font-medium mt-2 uppercase tracking-[0.2em]">
                        Live Platform Intelligence & Metrics
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-gray-950/50 p-4 rounded-3xl border border-gray-800/50">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-gray-300 font-black text-[10px] uppercase tracking-widest">Global Status: Operational</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="TOTAL REGISTERED USERS"
                    value={stats.totalUsers}
                    icon={Users}
                    color="from-indigo-500 text-indigo-400"
                    trend="+12% this week"
                />
                <StatCard
                    title="ACTIVE PREMIUM TIERS"
                    value={stats.premiumUsers}
                    icon={CreditCard}
                    color="from-pink-500 text-pink-400"
                />
                <StatCard
                    title="MCQ POOL CAPACITY"
                    value={stats.totalMcqs}
                    icon={Database}
                    color="from-cyan-500 text-cyan-400"
                />
                <StatCard
                    title="TOTAL PLATFORM REVENUE"
                    value={stats.totalRevenue}
                    icon={DollarSign}
                    color="from-emerald-500 text-emerald-400"
                    trend="Record Month"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Activity className="text-indigo-400" size={20} />
                            Live Activity Stream
                        </h3>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Real-time</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-800/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Identity</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">MCQ Generations</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Last Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/30">
                                {recentActivity.map((activity, idx) => (
                                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center font-black text-xs text-indigo-400 group-hover:border-indigo-500/50 transition-all">
                                                    {activity.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{activity.username}</p>
                                                    <p className="text-[10px] text-gray-600 font-bold">{activity.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-3 py-1 bg-gray-950 border border-gray-800 rounded-full text-xs font-black text-white">
                                                {activity.count} UNITS
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-gray-500 uppercase">
                                                <Clock size={12} />
                                                {new Date(activity.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recentActivity.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-gray-600 font-black uppercase text-[10px] tracking-widest">
                                            No recent activity detected
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Status */}
                <div className="space-y-6">
                    <div className="bg-gray-900/40 border border-gray-800/50 p-8 rounded-[2.5rem] shadow-2xl">
                        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Zap className="text-yellow-400" size={18} />
                            Neural Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-950 border border-gray-800 rounded-2xl">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Model Pool</span>
                                <span className="text-green-400 text-[10px] font-black bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase">OPTIMAL</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-950 border border-gray-800 rounded-2xl">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">API Latency</span>
                                <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">24ms</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-950 border border-gray-800 rounded-2xl">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Storage</span>
                                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">14.2 GB</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl group cursor-pointer overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-8 -mt-8 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Platform Growth</h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest leading-loose">
                                User registration is up 12% compared to last month. Consider increasing social incentives.
                            </p>
                            <button className="mt-4 px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                                View Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
