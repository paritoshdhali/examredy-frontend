import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Layers, CheckSquare,
    Settings, ShieldAlert, Cpu, Share2,
    Eye, Edit, Trash2, Check, X, Search,
    Plus, DollarSign, UserCheck, TrendingUp, Clock, CheckCircle,
    LogOut, Globe, BookOpen, Book, GraduationCap, School, MapPin,
    Briefcase, FileText, CreditCard, PieChart, Activity, AlertCircle, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [diagInfo, setDiagInfo] = useState(null);

    // --- STATES ---
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mcqs, setMcqs] = useState([]);
    const [settings, setSettings] = useState({ system: {}, legal: [], payment: [] });
    const [plans, setPlans] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [aiProviders, setAiProviders] = useState([]);

    // Hierarchy States
    const [states, setStates] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [boards, setBoards] = useState([]);
    const [classes, setClasses] = useState([]);
    const [streams, setStreams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [papers, setPapers] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');

    // --- FETCHERS ---
    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            switch (activeTab) {
                case 'overview':
                    const sRes = await api.get('/admin/stats');
                    setStats(sRes.data);
                    break;
                case 'users':
                    const uRes = await api.get(`/admin/users?search=${searchQuery}`);
                    setUsers(uRes.data);
                    break;
                case 'categories':
                    const catRes = await api.get('/admin/categories');
                    setCategories(catRes.data);
                    break;
                case 'states':
                    const stRes = await api.get('/admin/states');
                    setStates(stRes.data);
                    break;
                case 'languages':
                    const lnRes = await api.get('/admin/languages');
                    setLanguages(lnRes.data);
                    break;
                case 'school-mgmt':
                    const [br, cl, sm] = await Promise.all([
                        api.get('/admin/boards'),
                        api.get('/admin/classes'),
                        api.get('/admin/streams')
                    ]);
                    setBoards(br.data);
                    setClasses(cl.data);
                    setStreams(sm.data);
                    break;
                case 'univ-mgmt':
                    const [un, dg, se] = await Promise.all([
                        api.get('/admin/universities'),
                        api.get('/admin/degree-types'),
                        api.get('/admin/semesters')
                    ]);
                    setUniversities(un.data);
                    // Assuming setDegreeTypes and setSemesters exist or will be added
                    // setDegreeTypes(dg.data); setSemesters(se.data);
                    break;
                case 'comp-mgmt':
                    const paRes = await api.get('/admin/papers-stages');
                    setPapers(paRes.data);
                    break;
                case 'ai-mgmt':
                    const [aiP, aiL] = await Promise.all([
                        api.get('/admin/ai-providers'),
                        api.get('/admin/ai-fetch/logs')
                    ]);
                    setAiProviders(aiP.data);
                    // setAiLogs(aiL.data);
                    break;
                case 'mcq-mgmt':
                    const mcqRes = await api.get('/admin/mcqs?status=pending');
                    setMcqs(mcqRes.data);
                    break;
                case 'sub-mgmt':
                    const plRes = await api.get('/admin/plans');
                    setPlans(plRes.data);
                    break;
                case 'ref-mgmt':
                    const refRes = await api.get('/admin/referrals');
                    setReferrals(refRes.data);
                    break;
                case 'pay-mgmt':
                    const payRes = await api.get('/admin/payments/transactions');
                    // setTransactions(payRes.data);
                    break;
                case 'settings':
                case 'ads-mgmt':
                case 'seo-mgmt':
                case 'legal-mgmt':
                case 'sys-settings':
                    const setRes = await api.get('/admin/settings');
                    setSettings(setRes.data);
                    break;
                default: break;
            }
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleLogout = () => { logout(); navigate('/admin'); };

    const handleAIFetch = async (type, payload) => {
        try {
            setLoading(true);
            const res = await api.post(`/ai-fetch/${type}`, payload);
            alert(res.data.message || 'AI Fetch triggered successfully!');
            fetchDashboardData();
        } catch (err) {
            alert(`AI Error: ${err.message}`);
        } finally { setLoading(false); }
    };

    const handleUpdateUser = async (id, data) => {
        await api.put(`/admin/users/${id}/status`, data);
        fetchDashboardData();
    };

    const handleUpdateSettings = async (type, data) => {
        try {
            setLoading(true);
            await api.put(`/admin/settings/${type}`, data);
            alert('Settings updated successfully');
            fetchDashboardData();
        } catch (err) {
            alert(`Settings Update Error: ${err.message}`);
        } finally { setLoading(false); }
    };

    const checkDiagnostic = async () => {
        try {
            const res = await api.get('/admin/debug-token');
            setDiagInfo(res.data);
        } catch (err) { setDiagInfo({ error: err.message }); }
    };

    // --- RENDER HELPERS ---
    const SidebarItem = ({ id, label, icon: Icon, group }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
        >
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );

    const SidebarGroup = ({ label, children }) => (
        <div className="mb-6">
            <p className="px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">{label}</p>
            <div className="space-y-1">{children}</div>
        </div>
    );

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-xs font-semibold uppercase">{label}</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-opacity-10 ${color}`}>
                <Icon size={22} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    // --- MODULE RENDERS ---

    const renderOverview = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Dashboard Analytics</h2>
                <button onClick={fetchDashboardData} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Active Users (Day)" value={stats?.activeUsers || 0} icon={Activity} color="bg-green-500 text-green-500" />
                <StatCard label="Revenue Today" value={`₹${stats?.revenueToday || 0}`} icon={DollarSign} color="bg-yellow-500 text-yellow-500" />
                <StatCard label="MCQs Generated" value={stats?.totalMCQs || 0} icon={Cpu} color="bg-indigo-500 text-indigo-500" />
                <StatCard label="Daily Growth" value={stats?.totalUsersToday || 0} icon={TrendingUp} color="bg-blue-500 text-blue-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-white flex items-center gap-2"><PieChart size={18} className="text-indigo-500" /> Revenue Breakdown</h4>
                    </div>
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Monthly Total</span>
                            <span className="text-white font-bold">₹{stats?.revenueMonthly || 0}</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: '65%' }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Yearly Total</span>
                            <span className="text-white font-bold">₹{stats?.revenueYearly || 0}</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2 group cursor-pointer" onClick={checkDiagnostic}>
                        <ShieldAlert size={18} className="text-red-500" /> System Diagnostics
                    </h4>
                    {diagInfo ? (
                        <div className="bg-black/50 p-4 rounded-xl border border-gray-800 font-mono text-[11px] space-y-2 text-green-400">
                            <p>TOKEN: {diagInfo.exists ? 'PRESENT' : 'MISSING'}</p>
                            <p>FORMAT: {diagInfo.format_valid ? 'VALID' : 'INVALID'}</p>
                            <p>STAMP: {diagInfo.received_at}</p>
                            <button onClick={() => setDiagInfo(null)} className="text-gray-500 hover:text-white underline">Clear</button>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Click header to run health check...</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStates = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Indian States & UT</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">Add State</button>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">State Name</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {states.map(s => (
                            <tr key={s.id} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4 text-sm text-gray-300 font-medium">{s.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {s.is_active ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-white p-1.5"><Edit size={14} /></button>
                                    <button className="text-gray-500 hover:text-red-500 p-1.5"><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLanguages = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Official Languages</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">Add Language</button>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Language</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {languages.map(l => (
                            <tr key={l.id} className="hover:bg-gray-800/50">
                                <td className="px-6 py-4 text-sm text-gray-300 font-medium">{l.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {l.is_active ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-500 hover:text-white p-1.5"><Edit size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSchoolMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">School Category Management</h2>
                <div className="flex gap-3">
                    <button onClick={() => handleAIFetch('boards', { state_id: 1, state_name: 'CBSE' })} className="px-4 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                        <Cpu size={14} /> AI Fetch Boards (CBSE)
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Manual Add Board</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Boards List */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/20">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2"><School size={16} className="text-indigo-500" /> Boards</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/30 text-[10px] uppercase text-gray-500 font-bold">
                                <tr>
                                    <th className="px-6 py-3">Board Name</th>
                                    <th className="px-6 py-3">State</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {boards.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-300 font-bold">{b.name}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{b.state_name}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button className="text-indigo-400 hover:text-white text-[10px] uppercase font-bold" onClick={() => handleAIFetch('subjects', { board_id: b.id, context_name: b.name })}>AI Subjects</button>
                                            <button className="text-gray-500 hover:text-white"><Edit size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Classes & Streams Stats */}
                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h4 className="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-2">Classes (1-12)</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {classes.map(c => (
                                <div key={c.id} className="bg-gray-800/50 p-2 rounded text-center text-[10px] font-bold text-gray-400 border border-gray-700/50">
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h4 className="text-white font-bold text-sm mb-4 border-b border-gray-800 pb-2">Streams (11-12)</h4>
                        <div className="space-y-2">
                            {streams.map(s => (
                                <div key={s.id} className="bg-indigo-500/10 p-2 rounded flex justify-between items-center text-xs text-indigo-400 border border-indigo-500/10">
                                    <span>{s.name}</span>
                                    <CheckCircle size={12} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUnivMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">University Category Management</h2>
                <button onClick={() => handleAIFetch('universities', { state_id: 1, state_name: 'India' })} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20">
                    <Cpu size={16} /> AI Fetch Universities
                </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/20 flex justify-between items-center">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2"><GraduationCap size={16} className="text-purple-500" /> Universities List</h3>
                    <span className="text-[10px] text-gray-500">Showing {universities.length} institutions</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/30 text-[10px] uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">University Name</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {universities.map(u => (
                                <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300 font-bold">{u.name}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{u.state_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {u.is_active ? 'PUBLISHED' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <button onClick={() => handleAIFetch('subjects', { university_id: u.id, context_name: u.name })} className="text-purple-400 hover:text-white text-[10px] uppercase font-bold">AI Subjects</button>
                                        <button className="text-gray-500 hover:text-white"><Edit size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search email..."
                        className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none w-72"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Subscription</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Credits Today</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{u.username}</div>
                                    <div className="text-[10px] text-gray-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {u.is_premium ? (
                                        <span className="flex items-center gap-1 text-green-500 text-xs font-bold"><CheckCircle size={14} /> Active</span>
                                    ) : (
                                        <span className="text-gray-600 text-xs font-bold">Free Plan</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })} className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {u.is_active ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono">0/10</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => api.post(`/admin/users/${u.id}/reset-usage`).then(() => alert('Usage reset'))} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Reset Usage"><RefreshCw size={14} /></button>
                                        <button className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Extend Subscription"><DollarSign size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderRefMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Referral System Activity</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/20">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2"><Share2 size={16} className="text-yellow-500" /> Referrals List</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/30 text-[10px] uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Referrer</th>
                                <th className="px-6 py-4">Target User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Reward</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {referrals.map(r => (
                                <tr key={r.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300">{r.referrer_email}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{r.referred_email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {r.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {r.reward_given ? <span className="text-green-500 flex items-center gap-1 font-bold"><Check size={12} /> Claimed</span> : <span className="text-gray-600">Pending</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => api.put(`/admin/referrals/${r.id}/reward`, { status: 'completed', reward_given: true }).then(() => fetchDashboardData())} className="text-indigo-500 hover:text-white text-[10px] uppercase font-bold">Manual Approve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderFreeLimit = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Free Usage Limits Control</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl">
                <div className="space-y-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-black text-lg">Daily MCQ Limit</h4>
                            <p className="text-gray-500 text-sm">How many free practice sessions per user every 24 hours.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                className="w-20 bg-black/50 border border-gray-800 p-3 rounded-xl text-center text-indigo-500 font-bold outline-none focus:border-indigo-500"
                                defaultValue={settings.system['FREE_DAILY_LIMIT'] || 2}
                                onBlur={(e) => handleUpdateSettings('free-limit', { limit: e.target.value, logic: settings.system['FREE_LIMIT_RESET_LOGIC'] })}
                            />
                            <span className="text-gray-500 font-bold uppercase text-xs">MCQs</span>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-gray-800">
                        <h4 className="text-white font-black text-lg mb-4">Reset Logic Persistence</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleUpdateSettings('free-limit', { limit: settings.system['FREE_DAILY_LIMIT'], logic: 'rolling' })}
                                className={`p-4 rounded-xl border transition-all text-left ${settings.system['FREE_LIMIT_RESET_LOGIC'] === 'rolling' ? 'bg-indigo-600/10 border-indigo-600 shadow-lg shadow-indigo-900/10' : 'bg-gray-800/20 border-gray-800 grayscale opacity-50'}`}
                            >
                                <p className="text-white font-bold text-sm">Rolling 24h Window</p>
                                <p className="text-[10px] text-gray-500 mt-1">Reset happens exactly 24h after the first use.</p>
                            </button>
                            <button
                                onClick={() => handleUpdateSettings('free-limit', { limit: settings.system['FREE_DAILY_LIMIT'], logic: 'midnight' })}
                                className={`p-4 rounded-xl border transition-all text-left ${settings.system['FREE_LIMIT_RESET_LOGIC'] === 'midnight' ? 'bg-indigo-600/10 border-indigo-600 shadow-lg shadow-indigo-900/10' : 'bg-gray-800/20 border-gray-800 grayscale opacity-50'}`}
                            >
                                <p className="text-white font-bold text-sm">Fixed Midnight Reset</p>
                                <p className="text-[10px] text-gray-500 mt-1">All usage counters reset at 00:00 server time.</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPayMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Payment Gateway Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['razorpay', 'stripe'].map(prov => (
                    <div key={prov} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-white font-black text-xl uppercase tracking-tighter">{prov} Integration</h4>
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                                <ShieldAlert size={20} className="text-gray-600" />
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Live Key Path</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl mt-1 text-xs text-indigo-400 outline-none" placeholder={`pk_live_...`} />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Secret Vault Key</label>
                                <input type="password" underline="true" className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl mt-1 text-xs text-white outline-none" value="********" />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all">Enable Mode</button>
                                <button className="w-12 h-12 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-xl hover:text-white transition-colors"><Edit size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAdsMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Global Ads & Analytics Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col">
                    <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2"><PieChart size={20} className="text-orange-500" /> AdSense Deployment</h3>
                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Header Script Injection</label>
                            <textarea
                                className="w-full bg-black/50 border border-gray-800 p-4 rounded-xl mt-1 text-[10px] font-mono text-gray-400 h-32 outline-none focus:border-indigo-500"
                                defaultValue={settings.system['ADS_HEADER_SCRIPT']}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Ads.txt Editor</label>
                            <textarea
                                className="w-full bg-black/50 border border-gray-800 p-4 rounded-xl mt-1 text-[10px] font-mono text-gray-400 h-32 outline-none focus:border-indigo-500"
                                defaultValue={settings.system['ADS_TXT']}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                            <span className="text-white font-bold text-sm">Global Ad Display</span>
                            <button
                                onClick={() => handleUpdateSettings('ads', { ADS_ENABLED: settings.system['ADS_ENABLED'] === 'true' ? 'false' : 'true' })}
                                className={`w-14 h-7 rounded-full transition-all relative ${settings.system['ADS_ENABLED'] === 'true' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.system['ADS_ENABLED'] === 'true' ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20">Sync Ad Config</button>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
                    <h3 className="text-white font-black text-lg mb-6 flex items-center gap-2 text-indigo-500">Ad Slots Availability</h3>
                    <div className="space-y-4">
                        {['Homepage Top', 'Sidebar Right', 'MCQ Detail Bottom', 'Result Page Middle'].map(slot => (
                            <div key={slot} className="p-4 bg-black/30 rounded-xl border border-gray-800/50 flex justify-between items-center group">
                                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{slot}</span>
                                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black tracking-widest uppercase">Responsive</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSEOMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">SEO & Google Integrations</h2>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <h4 className="text-indigo-400 font-black uppercase text-xs tracking-widest">Metadata Control</h4>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-black">Meta Title Template</label>
                            <input type="text" className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl mt-1 text-sm text-white outline-none" defaultValue={settings.system['META_TITLE']} />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-black">Global Keywords</label>
                            <textarea className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl mt-1 text-sm text-white h-24 outline-none" defaultValue={settings.system['META_KEYWORDS']} />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-green-400 font-black uppercase text-xs tracking-widest">Google Connectivity</h4>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-black">Analytics ID (GA4)</label>
                            <input type="text" className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl mt-1 text-sm text-indigo-500 outline-none" defaultValue={settings.system['GOOGLE_ANALYTICS_ID']} />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-black">Search Console Verification</label>
                            <input type="text" className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl mt-1 text-sm text-gray-400 outline-none" defaultValue={settings.system['GOOGLE_SEARCH_CONSOLE_CODE']} />
                        </div>
                        <button className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">Verify All Deployments</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLegalMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">Legal Document Editor</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    {settings.legal.map(page => (
                        <button
                            key={page.slug}
                            className={`w-full p-4 rounded-xl text-left border transition-all ${activeTab === `legal-${page.slug}` ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
                            onClick={() => setActiveTab(`legal-${page.slug}`)}
                        >
                            <p className="text-white font-bold text-sm">{page.title}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase font-black">Slug: {page.slug}</p>
                        </button>
                    ))}
                </div>
                <div className="lg:col-span-3 bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col min-h-[600px]">
                    <h3 className="text-white font-black text-xl mb-6 flex items-center justify-between">
                        <span>Document Workspace</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Preview</button>
                            <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20">Commit Changes</button>
                        </div>
                    </h3>
                    <textarea
                        className="flex-1 w-full bg-black/50 border border-gray-800 p-6 rounded-2xl text-sm text-gray-400 font-serif leading-relaxed outline-none focus:border-indigo-500"
                        placeholder="Select a document from the left to start editing..."
                    />
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">System Configuration</h2>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Global Settings */}
                <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4"><Globe size={18} className="text-blue-500" /> Global SEO & Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['SITE_NAME', 'SITE_TITLE', 'SITE_DESC', 'META_KEYWORDS', 'CONTACT_EMAIL', 'FREE_LIMIT'].map(key => (
                            <div key={key}>
                                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">{key.replace('_', ' ')}</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/50 border border-gray-800 rounded-lg p-2.5 text-sm text-gray-300 outline-none focus:border-indigo-500"
                                    defaultValue={settings.system[key] || ''}
                                    onBlur={(e) => handleUpdateSettings('global', { settings: { [key]: e.target.value } })}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ads Settings */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4"><Layers size={18} className="text-orange-500" /> AdSense Control</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Ads Active</span>
                            <button className={`w-12 h-6 rounded-full transition-colors relative ${settings.system['ADS_ENABLED'] === 'true' ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.system['ADS_ENABLED'] === 'true' ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Publisher Script</label>
                            <textarea
                                className="w-full bg-black/50 border border-gray-800 rounded-lg p-2.5 text-[10px] font-mono text-gray-500 h-24 outline-none focus:border-indigo-500"
                                defaultValue={settings.system['ADSENSE_SCRIPT']}
                            />
                        </div>
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20">Update Assets</button>
                    </div>
                </div>
            </div>

            {/* Legal Pages */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                    <h3 className="text-white font-bold flex items-center gap-2"><FileText size={18} className="text-indigo-500" /> Legal & Policy Pages</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-x divide-gray-800">
                    {settings.legal.map(p => (
                        <button key={p.id} className="p-4 hover:bg-gray-800 text-left transition-all">
                            <p className="text-white font-bold text-sm truncate">{p.title}</p>
                            <p className="text-[10px] text-gray-500 mt-1">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderAI = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">AI Engine Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {aiProviders.map(p => (
                    <div key={p.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-bold ${p.is_active ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                            {p.is_active ? 'PRIMARY MODEL' : 'STANDBY'}
                        </div>
                        <h4 className="text-white font-bold text-lg mb-4">{p.name}</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold">Base URL</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-800 p-2 rounded mt-1 text-xs text-indigo-400" value={p.base_url} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Model Name</label>
                                    <input type="text" className="w-full bg-black/50 border border-gray-800 p-2 rounded mt-1 text-xs text-white" value={p.model_name} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">API Key (Hidden)</label>
                                    <input type="password" underline="true" className="w-full bg-black/50 border border-gray-800 p-2 rounded mt-1 text-xs text-white" value="********" />
                                </div>
                            </div>
                            <button className="w-full py-2 bg-gray-800 text-white rounded text-xs font-bold hover:bg-indigo-600 transition-all">Save Changes</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCategories = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">MCQ Categories</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                    <Plus size={16} /> Add Category
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-xl overflow-hidden">
                                {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-cover" /> : <Layers className="w-full h-full p-3 text-gray-600" />}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded"><Edit size={14} /></button>
                                <button className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <h4 className="text-white font-bold mb-1">{cat.name}</h4>
                        <p className="text-gray-500 text-xs line-clamp-2 mb-4">{cat.description || 'No description provided'}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Sort Order: {cat.sort_order}</span>
                            <span className={`text-[10px] font-bold ${cat.is_active ? 'text-green-500' : 'text-red-500'}`}>{cat.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCompMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Competitive Exams Management</h2>
                <button onClick={() => handleAIFetch('papers', { category_id: 3, category_name: 'UPSC' })} className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-yellow-700 transition-all shadow-lg shadow-yellow-900/20">
                    <Cpu size={16} /> AI Fetch UPSC Structure
                </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/20">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2"><Briefcase size={16} className="text-yellow-500" /> Papers & Stages</h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/30 text-[10px] uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Paper/Stage Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {papers.map(p => (
                                <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-300 font-bold">{p.name}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{p.category_name}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <button onClick={() => handleAIFetch('subjects', { paper_stage_id: p.id, context_name: p.name })} className="text-yellow-500 hover:text-white text-[10px] uppercase font-bold">AI Subjects</button>
                                        <button className="text-gray-500 hover:text-white"><Edit size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAIMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white">AI Engine Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {aiProviders.map(p => (
                    <div key={p.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-bold ${p.is_active ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                            {p.is_active ? 'PRIMARY MODEL' : 'STANDBY'}
                        </div>
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Cpu size={20} className="text-indigo-500" /> {p.name}</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold">Base URL</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-800 p-2.5 rounded mt-1 text-xs text-indigo-400 outline-none focus:border-indigo-500" value={p.base_url} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">Model Name</label>
                                    <input type="text" className="w-full bg-black/50 border border-gray-800 p-2.5 rounded mt-1 text-xs text-white outline-none focus:border-indigo-500" value={p.model_name} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold">API Key (Encrypted)</label>
                                    <input type="password" underline="true" className="w-full bg-black/50 border border-gray-800 p-2.5 rounded mt-1 text-xs text-white outline-none focus:border-indigo-500" value="********" />
                                </div>
                            </div>
                            <button className="w-full py-2 bg-indigo-600/10 text-indigo-500 border border-indigo-600/20 rounded text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">Update Provider Configuration</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden p-6">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Activity size={16} className="text-green-500" /> Recent AI Fetch Logs</h3>
                <div className="bg-black/50 rounded-xl border border-gray-800 p-4 font-mono text-[10px] text-gray-500 max-h-40 overflow-y-auto">
                    <p className="text-indigo-400">[2026-02-19 18:41] INFO: Triggered fetch for "Education Boards" in "CBSE"</p>
                    <p className="text-green-400">[2026-02-19 18:41] SUCCESS: 10 boards saved successfully.</p>
                    <p className="text-gray-600">[2026-02-19 18:40] DEBUG: Initializing Google Gemini service...</p>
                </div>
            </div>
        </div>
    );

    const renderMCQMgmt = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">MCQ Moderation</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/20">{mcqs.length} Pending Approval</span>
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Question</th>
                            <th className="px-6 py-4">Context</th>
                            <th className="px-6 py-4 text-center">Moderation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {mcqs.map(m => (
                            <tr key={m.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                                <td className="px-6 py-4 max-w-lg">
                                    <div className="font-bold text-white line-clamp-2">{m.question}</div>
                                    <div className="text-[10px] text-gray-500 mt-1 italic">Hash: {m.question_hash?.substring(0, 16)}...</div>
                                </td>
                                <td className="px-6 py-4 text-[10px]">
                                    <p className="font-black text-indigo-500">{m.subject}</p>
                                    <p className="text-gray-600">{m.chapter}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => api.put(`/admin/mcqs/${m.id}/approve`).then(() => fetchDashboardData())} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Approve"><Check size={16} /></button>
                                        <button className="p-2 bg-gray-500/10 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all" title="Edit"><Edit size={16} /></button>
                                        <button onClick={() => api.delete(`/admin/mcqs/${m.id}`).then(() => fetchDashboardData())} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSubMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Subscription Plans</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20">
                    <Plus size={16} /> Add New Plan
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(p => (
                    <div key={p.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-white font-black text-xl">{p.name}</h4>
                                <p className="text-indigo-500 font-bold">₹{p.price} <span className="text-gray-500 text-xs text-normal">/ {p.duration_hours}h</span></p>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[8px] font-bold ${p.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {p.is_active ? 'ACTIVE' : 'DISABLED'}
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-gray-800">
                            <button className="flex-1 py-1.5 bg-gray-800 text-white text-[10px] font-bold rounded uppercase hover:bg-indigo-600 transition-all">Edit Plan</button>
                            <button className="px-3 py-1.5 bg-gray-800 text-red-500 text-[10px] font-bold rounded uppercase hover:bg-red-500 hover:text-white transition-all"><Trash2 size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-black font-sans text-gray-300">
            {/* Sidebar */}
            <div className="w-64 bg-gray-950 border-r border-gray-900 flex flex-col fixed h-full z-30">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <CheckSquare className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-black text-white tracking-tight">EXAMREDY <span className="text-[8px] text-indigo-500 block">ADMIN v2.0</span></h1>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-800">
                    <SidebarGroup label="Executive">
                        <SidebarItem id="overview" label="Dashboard Overview" icon={LayoutDashboard} />
                        <SidebarItem id="users" label="User Management" icon={Users} />
                    </SidebarGroup>

                    <SidebarGroup label="Content Control">
                        <SidebarItem id="states" label="Indian States" icon={MapPin} />
                        <SidebarItem id="languages" label="Official Languages" icon={Globe} />
                        <SidebarItem id="categories" label="Exam Categories" icon={Layers} />
                    </SidebarGroup>

                    <SidebarGroup label="Education Hierarchy">
                        <SidebarItem id="school-mgmt" label="School Category" icon={School} />
                        <SidebarItem id="univ-mgmt" label="University Category" icon={GraduationCap} />
                        <SidebarItem id="comp-mgmt" label="Competitive Exams" icon={Briefcase} />
                        <SidebarItem id="mcq-mgmt" label="MCQ Moderation" icon={CheckSquare} />
                    </SidebarGroup>

                    <SidebarGroup label="AI & System">
                        <SidebarItem id="ai-mgmt" label="AI Management" icon={Cpu} />
                        <SidebarItem id="free-limit" label="Free Limit Control" icon={Clock} />
                        <SidebarItem id="settings" label="Global Settings" icon={Settings} />
                    </SidebarGroup>

                    <SidebarGroup label="Revenue & Ads">
                        <SidebarItem id="sub-mgmt" label="Subscriptions" icon={CreditCard} />
                        <SidebarItem id="ref-mgmt" label="Referral System" icon={Share2} />
                        <SidebarItem id="pay-mgmt" label="Payment Gateway" icon={DollarSign} />
                        <SidebarItem id="ads-mgmt" label="Ads Management" icon={PieChart} />
                    </SidebarGroup>

                    <SidebarGroup label="Marketing & Legal">
                        <SidebarItem id="seo-mgmt" label="SEO & Analytics" icon={TrendingUp} />
                        <SidebarItem id="legal-mgmt" label="Legal Page Editor" icon={FileText} />
                    </SidebarGroup>
                </div>

                <div className="p-4 border-t border-gray-900">
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-bold text-sm">
                        <LogOut size={18} />
                        <span>Logout Admin</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">Authenticated as {user?.email || 'Admin'}</p>
                        <h2 className="text-3xl font-black text-white capitalize">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right mr-2">
                            <p className="text-xs text-indigo-500 font-bold">System Status</p>
                            <p className="text-[10px] text-green-500 animate-pulse">Live & Secure</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-white/10" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-sm text-gray-500 font-bold animate-pulse">Syncing Dashboard...</p>
                    </div>
                ) : (
                    <div className="max-w-7xl">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
                                <AlertCircle size={20} /> {error}
                            </div>
                        )}

                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'states' && renderStates()}
                        {activeTab === 'languages' && renderLanguages()}
                        {activeTab === 'categories' && renderCategories()}
                        {activeTab === 'school-mgmt' && renderSchoolMgmt()}
                        {activeTab === 'univ-mgmt' && renderUnivMgmt()}
                        {activeTab === 'comp-mgmt' && renderCompMgmt()}
                        {activeTab === 'ai-mgmt' && renderAIMgmt()}
                        {activeTab === 'mcq-mgmt' && renderMCQMgmt()}
                        {activeTab === 'sub-mgmt' && renderSubMgmt()}
                        {activeTab === 'ref-mgmt' && renderRefMgmt()}
                        {activeTab === 'free-limit' && renderFreeLimit()}
                        {activeTab === 'pay-mgmt' && renderPayMgmt()}
                        {activeTab === 'ads-mgmt' && renderAdsMgmt()}
                        {activeTab === 'seo-mgmt' && renderSEOMgmt()}
                        {activeTab === 'legal-mgmt' && renderLegalMgmt()}
                        {activeTab === 'settings' && renderSettings()}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
