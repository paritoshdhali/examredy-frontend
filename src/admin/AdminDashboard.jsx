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
    Briefcase, FileText, CreditCard, PieChart, Activity, AlertCircle, RefreshCw, Save
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
    const [settings, setSettings] = useState({ system: {}, legal: [], payment: [], freeLimit: {} });
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
    const [degreeTypes, setDegreeTypes] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [selectedState, setSelectedState] = useState({ id: 1, name: 'Andhra Pradesh' });
    const [searchQuery, setSearchQuery] = useState('');
    const [aiLogs, setAiLogs] = useState([]);
    const [transactions, setTransactions] = useState([]);

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
                    const [br, cl, sm, st_s] = await Promise.all([
                        api.get('/admin/boards'),
                        api.get('/admin/classes'),
                        api.get('/admin/streams'),
                        api.get('/admin/states')
                    ]);
                    setBoards(br.data);
                    setClasses(cl.data);
                    setStreams(sm.data);
                    setStates(st_s.data);
                    break;
                case 'univ-mgmt':
                    const [un, dg, se, allSt] = await Promise.all([
                        api.get('/admin/universities'),
                        api.get('/admin/degree-types'),
                        api.get('/admin/semesters'),
                        api.get('/admin/states')
                    ]);
                    setUniversities(un.data);
                    setDegreeTypes(dg.data);
                    setSemesters(se.data);
                    setStates(allSt.data);
                    break;
                case 'comp-mgmt':
                    const [paRes, compCat] = await Promise.all([
                        api.get('/admin/papers-stages'),
                        api.get('/admin/categories')
                    ]);
                    setPapers(paRes.data);
                    setCategories(compCat.data);
                    break;
                case 'ai-mgmt':
                    const [aiP, aiL] = await Promise.all([
                        api.get('/admin/ai-providers'),
                        api.get('/ai-fetch/logs')
                    ]);
                    setAiProviders(Array.isArray(aiP.data) ? aiP.data : []);
                    setAiLogs(Array.isArray(aiL.data) ? aiL.data : []);
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
                    const [payRes, setP] = await Promise.all([
                        api.get('/admin/payments/transactions'),
                        api.get('/admin/settings')
                    ]);
                    setTransactions(payRes.data);
                    setSettings(setP.data);
                    break;
                case 'settings':
                case 'ads-mgmt':
                case 'seo-mgmt':
                case 'legal-mgmt':
                case 'sys-settings':
                case 'free-limit':
                    const setAllRes = await api.get('/admin/settings');
                    setSettings(setAllRes.data);
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
        try {
            setLoading(true);
            if (data.role) await api.put(`/admin/users/${id}/role`, { role: data.role });
            if (data.is_active !== undefined) await api.put(`/admin/users/${id}/status`, { is_active: data.is_active });
            if (data.action) await api.put(`/admin/users/${id}/subscription`, data);
            alert('User updated successfully');
            fetchDashboardData();
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
    };

    const handleUpdateSettings = async (type, data) => {
        try {
            setLoading(true);
            let endpoint = `/admin/settings/${type}`;
            if (type.startsWith('ai-providers/')) endpoint = `/admin/${type}`;
            if (type.startsWith('approve/')) endpoint = `/admin/${type}`;

            await api.put(endpoint, data);
            alert('Operation successful');
            fetchDashboardData();
        } catch (err) {
            alert(`Update Error: ${err.message}`);
        } finally { setLoading(false); }
    };

    const handleDeleteItem = async (table, id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            setLoading(true);
            await api.delete(`/admin/${table}/${id}`);
            alert('Deleted successfully');
            fetchDashboardData();
        } catch (err) { alert(err.message); }
        finally { setLoading(false); }
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
                        {Array.isArray(languages) && languages.map(l => (
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
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <div>
                    <h2 className="text-2xl font-black text-white">School Hierarchy</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1">Boards, Classes, Streams & AI Automation</p>
                </div>
                <div className="flex gap-4 items-center">
                    <select
                        className="bg-black border border-gray-800 text-xs text-gray-300 px-4 py-2 rounded-lg font-bold outline-none focus:border-indigo-500"
                        onChange={(e) => {
                            const st = states.find(s => s.id === parseInt(e.target.value));
                            if (st) setSelectedState(st);
                        }}
                        value={selectedState.id}
                    >
                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button
                        onClick={() => handleAIFetch('boards', { state_id: selectedState.id, state_name: selectedState.name })}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] uppercase font-black tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 flex items-center gap-2"
                    >
                        <Cpu size={14} /> AI Fetch Boards: {selectedState.name}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Boards (Requirement 2) */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/20 flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2"><School size={16} className="text-indigo-500" /> Boards / Councils</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/30 text-[10px] uppercase text-gray-500 font-bold">
                                <tr>
                                    <th className="px-6 py-3">Board Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {Array.isArray(boards) && boards.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300 font-bold">{b.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{b.state_name || 'National'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleUpdateSettings(`approve/boards/${b.id}`, { is_approved: !b.is_approved })}
                                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${b.is_approved ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                                            >
                                                {b.is_approved ? 'APPROVED' : 'PENDING'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                                            <button
                                                onClick={() => handleAIFetch('subjects', { board_id: b.id, category_id: 1, context_name: `${b.name} School Board` })}
                                                className="text-indigo-400 hover:text-white text-[10px] uppercase font-black flex items-center gap-1"
                                            >
                                                <Cpu size={12} /> AI Subjects
                                            </button>
                                            <button className="text-gray-500 hover:text-white"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteItem('boards', b.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Vertical Structure (Classes/Streams) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center justify-between">
                            Classes 1-10
                            <Plus size={14} className="text-gray-500 cursor-pointer hover:text-white" />
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {classes.filter(c => !c.name.includes('11') && !c.name.includes('12')).map(c => (
                                <div key={c.id} className="bg-gray-800/50 p-2 rounded text-center text-[10px] font-bold text-gray-400 border border-gray-700/50 hover:border-indigo-500 transition-all cursor-pointer">
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center justify-between">
                            Senior Sec (11-12)
                            <Plus size={14} className="text-gray-500 cursor-pointer hover:text-white" />
                        </h4>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded font-black">11</span>
                                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded font-black">12</span>
                            </div>
                            <div className="space-y-2">
                                {streams.map(s => (
                                    <div key={s.id} className="bg-indigo-500/5 p-2 rounded flex justify-between items-center text-[10px] font-bold text-indigo-400 border border-indigo-500/10 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer group">
                                        <span>{s.name.toUpperCase()}</span>
                                        <CheckCircle size={12} className="opacity-0 group-hover:opacity-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Languages (Requirement 10) */}
                <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Translation Engine</h4>
                    <div className="space-y-3">
                        {languages.map(l => (
                            <div key={l.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-gray-800/50 group">
                                <span className="text-sm text-gray-400 group-hover:text-white font-bold transition-colors">{l.name}</span>
                                <div className={`w-2 h-2 rounded-full ${l.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                            </div>
                        ))}
                        <button className="w-full mt-4 py-2 border border-dashed border-gray-700 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-500 hover:text-indigo-400 transition-all">Add Language Slot</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUnivMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                <div className="flex items-center gap-6">
                    <select
                        className="bg-black border border-gray-800 rounded-xl px-4 py-2 text-sm text-indigo-400 font-bold outline-none focus:border-indigo-500"
                        onChange={(e) => {
                            const s = states.find(st => st.id === parseInt(e.target.value));
                            if (s) setSelectedState(s);
                        }}
                        value={selectedState.id}
                    >
                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <div className="h-8 w-px bg-gray-800" />
                    <button
                        onClick={() => handleAIFetch('universities', { state_id: selectedState.id, state_name: selectedState.name })}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[10px] uppercase font-black tracking-widest hover:scale-105 transition-all shadow-xl shadow-purple-900/40 flex items-center gap-2"
                    >
                        <Cpu size={14} /> AI Build University Directory
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest hidden md:block">University Hierarchy Flow: State → Univ → Stream → Degree → Term</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-8">
                    <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                        <GraduationCap size={16} className="text-purple-500" /> University Roster ({selectedState.name})
                    </h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {(Array.isArray(universities) ? universities : []).filter(u => u.state_id === selectedState.id).map(u => (
                            <div key={u.id} className="p-4 bg-black/40 border border-gray-800 rounded-2xl flex justify-between items-center group hover:border-purple-500/50 transition-all cursor-pointer">
                                <div>
                                    <p className="text-white font-black text-sm">{u.name}</p>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase mt-0.5 tracking-tighter">Verified Institution</p>
                                </div>
                                <div className="flex gap-2 text-right">
                                    <button onClick={() => handleAIFetch('streams', { university_id: u.id, university_name: u.name })} className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all"><Cpu size={14} /></button>
                                    <button onClick={() => handleDeleteItem('universities', u.id)} className="p-2 text-gray-600 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex justify-between items-center">
                            Degree Specializations (Streams)
                            <Plus size={14} className="text-gray-500 cursor-pointer" />
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(streams) ? streams : []).map(s => (
                                <span key={s.id} className="px-4 py-2 bg-gray-800/40 border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-indigo-500 hover:text-white transition-all cursor-pointer">{s.name}</span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Degree Tiers</h4>
                            <div className="space-y-2">
                                {(Array.isArray(degreeTypes) ? degreeTypes : []).map(d => <div key={d.id} className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">{d.name.toUpperCase()}</div>)}
                            </div>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Academic Terms</h4>
                            <div className="space-y-2">
                                {(Array.isArray(semesters) ? semesters : []).map(s => <div key={s.id} className="text-[10px] font-black text-purple-400 bg-purple-500/5 p-2 rounded-lg border border-purple-500/10">{s.name}</div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <h2 className="text-2xl font-black text-white">Identity & Access</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="bg-black border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none w-80 font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchDashboardData()}
                    />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">User Identity</th>
                            <th className="px-6 py-4">Role / Access</th>
                            <th className="px-6 py-4">Subscription Status</th>
                            <th className="px-6 py-4">Account Integrity</th>
                            <th className="px-6 py-4 text-right">Administrative Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {Array.isArray(users) && users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-800/30 transition-colors text-gray-300">
                                <td className="px-6 py-4">
                                    <div className="font-black text-white">{u.username || 'Unnamed'}</div>
                                    <div className="text-[10px] text-gray-500 font-bold tracking-tight">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="bg-black border border-gray-800 text-[10px] text-gray-300 px-2 py-1 rounded font-bold uppercase outline-none focus:border-indigo-500"
                                        value={u.role}
                                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                                    >
                                        <option value="user">USER</option>
                                        <option value="admin">ADMIN</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    {u.is_premium ? (
                                        <div className="space-y-1">
                                            <span className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-widest"><UserCheck size={12} /> PRIME ACTIVE</span>
                                            <p className="text-[9px] text-gray-500 font-bold">Expires: {u.premium_expiry ? new Date(u.premium_expiry).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">FREE TIER</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${u.is_active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                    >
                                        {u.is_active ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleUpdateUser(u.id, { action: 'extend', hours: 24 })}
                                            className="p-2 bg-indigo-500/10 text-indigo-400 rounded hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                                            title="Add 24h Prime"
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateUser(u.id, { action: 'reduce', hours: 24 })}
                                            className="p-2 bg-orange-500/10 text-orange-400 rounded hover:bg-orange-500 hover:text-white transition-all shadow-lg"
                                            title="Reduce 24h Prime"
                                        >
                                            <Clock size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateUser(u.id, { action: 'cancel' })}
                                            className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                            title="Cancel Prime"
                                        >
                                            <X size={14} />
                                        </button>
                                        <button
                                            onClick={() => api.post(`/admin/users/${u.id}/reset-usage`).then(() => alert('Usage reset'))}
                                            className="p-2 bg-gray-800 text-gray-400 rounded hover:bg-white hover:text-black transition-all shadow-lg"
                                            title="Reset Daily Limit"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
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
                            {Array.isArray(referrals) && referrals.map(r => (
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
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Monetization Guard (Free Tier)</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">Enforcing 15m / 10 MCQ / 2 Session Boundaries (Point 9)</p>
                </div>
                <button
                    onClick={() => handleUpdateSettings('free-limit', { settings: settings.freeLimit })}
                    className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40"
                >
                    Authorize Policy Change
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { key: 'FREE_SESSIONS_COUNT', label: 'Max Daily Sessions', icon: Activity, color: 'text-indigo-500', default: '2' },
                    { key: 'FREE_SESSION_MINUTES', label: 'Mins per Session', icon: Clock, color: 'text-orange-500', default: '15' },
                    { key: 'FREE_SESSION_MCQS', label: 'MCQs per Session', icon: CheckSquare, color: 'text-green-500', default: '10' },
                    { key: 'RENEWAL_WINDOW_HOURS', label: 'Reset Interval (Hrs)', icon: RefreshCw, color: 'text-blue-500', default: '24' }
                ].map(item => (
                    <div key={item.key} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{item.label}</h4>
                            <item.icon size={16} className={item.color} />
                        </div>
                        <input
                            type="number"
                            className="w-full bg-black border border-gray-800 p-3 rounded-xl text-2xl font-black text-white outline-none focus:border-indigo-500 font-mono"
                            value={settings.freeLimit[item.key] || item.default}
                            onChange={(e) => setSettings({ ...settings, freeLimit: { ...settings.freeLimit, [item.key]: e.target.value } })}
                        />
                        <p className="text-[8px] text-gray-600 mt-2 font-bold uppercase">System Setting: {item.key}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
                    <h3 className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={16} /> Prime Exhaustion Popup (Marketing)
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Popup Headline</label>
                            <input
                                type="text"
                                className="w-full bg-black border border-gray-800 p-3 rounded-xl text-sm text-white font-bold outline-none focus:border-red-500"
                                value={settings.freeLimit['POPUP_HEADING'] || 'DAILY LIMIT REACHED!'}
                                onChange={(e) => setSettings({ ...settings, freeLimit: { ...settings.freeLimit, POPUP_HEADING: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Marketing Call-to-Action</label>
                            <textarea
                                className="w-full bg-black border border-gray-800 p-4 rounded-xl text-xs text-gray-400 font-medium outline-none h-32 focus:border-red-500 leading-relaxed"
                                value={settings.freeLimit['POPUP_TEXT'] || 'You have exhausted your free daily practice sessions. Upgrade to Prime for unlimited AI-powered learning, ad-free experience, and detailed analysis.'}
                                onChange={(e) => setSettings({ ...settings, freeLimit: { ...settings.freeLimit, POPUP_TEXT: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600/5 border border-indigo-600/10 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6">
                        <CreditCard size={32} className="text-indigo-400 opacity-40 shadow-xl" />
                    </div>
                    <h4 className="text-white font-black text-lg uppercase tracking-tighter mb-2">Monetization Sync</h4>
                    <p className="text-xs text-gray-500 font-bold max-w-sm mb-8 leading-relaxed">These limits are enforced by the server-side middleware. Any adjustment will take effect on the next user request globally.</p>
                    <div className="flex gap-4 w-full">
                        <button className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40">Test Popup View</button>
                        <button className="flex-1 py-3 bg-gray-800 text-gray-400 font-black rounded-xl text-[10px] uppercase tracking-widest">Verify Middleware</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPayMgmt = () => {
        const revs = [
            { label: 'Today', val: stats?.revenueToday, icon: Activity, color: 'text-green-400' },
            { label: 'This Month', val: stats?.revenueMonthly, icon: PieChart, color: 'text-blue-400' },
            { label: 'This Year', val: stats?.revenueYearly, icon: TrendingUp, color: 'text-indigo-400' },
            { label: 'Total Pay', val: stats?.revenueTotal, icon: DollarSign, color: 'text-purple-400' }
        ];
        return (
            <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {revs.map((r, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl hover:border-indigo-500/50 transition-all">
                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-widest">{r.label}</p>
                            <h3 className={`text-2xl font-black ${r.color}`}>₹{r.val || 0}</h3>
                        </div>
                    ))}
                </div>

                {/* Revenue Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h3 className="text-white font-black text-xl tracking-tight uppercase">Revenue Velocity</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">30-Day Financial Performance</p>
                        </div>
                    </div>
                    <div className="h-48 flex items-end gap-1.5 px-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-indigo-600 rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%` }} />
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20 flex justify-between items-center">
                        <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-indigo-500" /> Recent Inbound Flow
                        </h3>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/30 text-[10px] uppercase text-gray-500 font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Transaction ID</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Amount</th>
                                <th className="px-8 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {(transactions || []).map(t => (
                                <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-gray-300">{t.razorpay_payment_id || 'LOCAL-UP'}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${t.status === 'captured' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-right text-white font-black">₹{t.amount}</td>
                                    <td className="px-8 py-4 text-right text-[10px] text-gray-500 font-black">{new Date(t.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-indigo-900/10 border border-indigo-500/20 p-8 rounded-3xl">
                    <h3 className="text-xl font-black text-indigo-400 uppercase tracking-tighter mb-4">Financial Infrastructure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settings.payment.map(prov => (
                            <div key={prov.provider} className="bg-black/40 border border-gray-800 p-6 rounded-2xl relative">
                                <h4 className="text-white font-black uppercase text-xs mb-4">{prov.provider} Gateway</h4>
                                <div className="space-y-4">
                                    <input type="text" className="w-full bg-transparent border-b border-gray-800 p-1 text-xs outline-none text-indigo-400" value={prov.api_key || ''} onChange={(e) => {
                                        const n = settings.payment.map(x => x.id === prov.id ? { ...x, api_key: e.target.value } : x);
                                        setSettings({ ...settings, payment: n });
                                    }} />
                                    <button onClick={() => handleUpdateSettings(`payments/${prov.provider}`, { api_key: prov.api_key, is_active: prov.is_active })} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Save Config</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderAdsMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Monetization Control Center</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[
                    { key: 'HOME_HEADER_AD', label: 'Home Header Slot' },
                    { key: 'HOME_MIDDLE_AD', label: 'Feed Middle Slot' },
                    { key: 'HOME_FOOTER_AD', label: 'Footer Base Slot' }
                ].map(slot => (
                    <div key={slot.key} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex flex-col group hover:border-orange-500/50 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest">{slot.label}</h3>
                            <button
                                onClick={() => handleUpdateSettings('global', { settings: { [`${slot.key}_ENABLED`]: settings.system[`${slot.key}_ENABLED`] === 'true' ? 'false' : 'true' } })}
                                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${settings.system[`${slot.key}_ENABLED`] === 'true' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}
                            >
                                {settings.system[`${slot.key}_ENABLED`] === 'true' ? 'ACTIVE' : 'OFF'}
                            </button>
                        </div>
                        <textarea
                            className="w-full bg-black/50 border border-gray-800 p-4 rounded-2xl flex-1 text-[10px] font-mono text-orange-400 h-48 outline-none focus:border-orange-500 resize-none"
                            placeholder="<!-- Paste AdSense Code -->"
                            defaultValue={settings.system[slot.key]}
                            onBlur={(e) => handleUpdateSettings('global', { settings: { [slot.key]: e.target.value } })}
                        />
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6">Global Ads Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block tracking-widest text-indigo-400">Ads.txt Content</label>
                        <textarea
                            className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-[10px] font-mono text-gray-400 h-32 outline-none focus:border-indigo-500"
                            defaultValue={settings.system['ADS_TXT']}
                            onBlur={(e) => handleUpdateSettings('global', { settings: { 'ADS_TXT': e.target.value } })}
                        />
                    </div>
                    <div className="bg-indigo-600/5 border border-indigo-600/20 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                        <PieChart size={48} className="text-indigo-500 mb-4 opacity-20" />
                        <p className="text-xs text-gray-400 font-bold mb-4 uppercase">All changes to Ad Scripts reflect instantly on the frontend homepage slots.</p>
                        <button className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/40">Flush Ad Cache</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSEOMgmt = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <div>
                    <h2 className="text-2xl font-black text-white">Search Engine Optimization</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1">Meta Control & Google Visibility (Requirement 8)</p>
                </div>
                <button
                    onClick={() => handleUpdateSettings('system', { settings: settings.system })}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] uppercase font-black tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40"
                >
                    Deploy SEO Config
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
                    <h4 className="text-indigo-400 font-black uppercase text-xs tracking-widest flex items-center gap-2"><Globe size={16} /> Metadata Integrity</h4>
                    <div className="space-y-4">
                        {[
                            { key: 'SITE_TITLE', label: 'Primary Site Title' },
                            { key: 'META_DESCRIPTION', label: 'Global Meta Description' },
                            { key: 'META_KEYWORDS', label: 'Target SEO Keywords' }
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-[10px] text-gray-500 uppercase font-bold">{f.label}</label>
                                {f.key === 'META_DESCRIPTION' ? (
                                    <textarea
                                        className="w-full bg-black border border-gray-800 p-3 rounded-xl mt-1 text-sm text-white outline-none focus:border-indigo-500 h-24"
                                        value={settings.system[f.key] || ''}
                                        onChange={(e) => setSettings({ ...settings, system: { ...settings.system, [f.key]: e.target.value } })}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-gray-800 p-3 rounded-xl mt-1 text-sm text-white outline-none focus:border-indigo-500"
                                        value={settings.system[f.key] || ''}
                                        onChange={(e) => setSettings({ ...settings, system: { ...settings.system, [f.key]: e.target.value } })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
                    <h4 className="text-green-400 font-black uppercase text-xs tracking-widest flex items-center gap-2"><PieChart size={16} /> Analytics & Search Console</h4>
                    <div className="space-y-4">
                        {[
                            { key: 'GOOGLE_ANALYTICS_ID', label: 'GA4 Tag / Measurement ID' },
                            { key: 'GOOGLE_SEARCH_CONSOLE_CODE', label: 'Site Verification Code' },
                            { key: 'SUPPORT_EMAIL', label: 'Administrative Support Email' },
                            { key: 'WHATSAPP_NUMBER', label: 'WhatsApp Support Link' }
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-[10px] text-gray-500 uppercase font-bold">{f.label}</label>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-gray-800 p-3 rounded-xl mt-1 text-sm text-indigo-400 outline-none focus:border-indigo-500 font-mono"
                                    value={settings.system[f.key] || ''}
                                    onChange={(e) => setSettings({ ...settings, system: { ...settings.system, [f.key]: e.target.value } })}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLegalMgmt = () => {
        const [activePage, setActivePage] = useState(settings.legal[0] || null);

        return (
            <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <div>
                        <h2 className="text-2xl font-black text-white">Policy Framework</h2>
                        <p className="text-xs text-gray-500 font-bold mt-1">AdSense Compliance & Legal Documentation (Requirement 9)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 space-y-3">
                        {settings.legal.map(page => (
                            <button
                                key={page.id}
                                className={`w-full p-6 rounded-2xl text-left border transition-all shadow-lg ${activePage?.id === page.id ? 'bg-indigo-600 border-indigo-500 scale-[1.02] z-10' : 'bg-gray-900 border-gray-800 hover:border-indigo-500/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                                onClick={() => setActivePage(page)}
                            >
                                <p className="text-white font-black text-sm tracking-tight">{page.title}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[8px] text-indigo-200 font-bold uppercase tracking-widest">/{page.slug}</span>
                                    <span className="text-[8px] text-gray-500 font-bold">{new Date(page.updated_at).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))}
                        <button className="w-full p-4 border border-dashed border-gray-800 rounded-2xl text-[10px] font-black uppercase text-gray-600 hover:border-indigo-500 hover:text-white transition-all">+ Add Legal Doc</button>
                    </div>

                    <div className="lg:col-span-3 bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col min-h-[700px]">
                        {activePage ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-indigo-500" />
                                        <h3 className="text-white font-black text-xl tracking-tighter">Editing: {activePage.title}</h3>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateSettings(`legal/${activePage.id}`, { content: activePage.content })}
                                        className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/40 hover:bg-indigo-700 transition-all flex items-center gap-2"
                                    >
                                        <Save size={14} /> Commit Version
                                    </button>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-black border border-gray-800 p-8 rounded-2xl text-sm text-gray-400 font-serif leading-relaxed outline-none focus:border-indigo-500 shadow-inner"
                                    value={activePage.content}
                                    onChange={(e) => {
                                        const newLegal = settings.legal.map(l => l.id === activePage.id ? { ...l, content: e.target.value } : l);
                                        setSettings({ ...settings, legal: newLegal });
                                        setActivePage({ ...activePage, content: e.target.value });
                                    }}
                                />
                                <div className="mt-4 flex justify-between items-center">
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">HTML Supported - Use semantic tags for SEO optimization</p>
                                    <span className="text-[9px] text-gray-600 font-mono">CHARS: {activePage.content?.length || 0}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-700 group">
                                <FileText size={64} className="mb-4 group-hover:scale-110 transition-transform opacity-20" />
                                <p className="font-black uppercase tracking-widest text-lg opacity-20">Initialize Documentation Context</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderSysSettings = () => (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Global System Configurations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
                    <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                        <Settings size={16} /> Identity & Branding (Point 8)
                    </h3>
                    <div className="space-y-4">
                        {[
                            { key: 'SITE_NAME', label: 'Organization Name', type: 'text' },
                            { key: 'LOGO_URL', label: 'Primary Logo URL', type: 'text' },
                            { key: 'SITE_EMAIL', label: 'System Recovery Email', type: 'email' },
                            { key: 'FOOTER_TEXT', label: 'Global Footer Credit', type: 'text' },
                            { key: 'BANNER_TEXT', label: 'Homepage Alert Banner', type: 'text' }
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">{f.label}</label>
                                <input
                                    type={f.type}
                                    className="w-full bg-black border border-gray-800 p-3 rounded-xl text-sm text-white outline-none focus:border-indigo-500 transition-all font-bold"
                                    defaultValue={settings.system?.[f.key]}
                                    onBlur={(e) => handleUpdateSettings('global', { settings: { [f.key]: e.target.value } })}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl">
                        <h3 className="text-green-500 font-black text-xs uppercase tracking-widest mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
                            <Activity size={16} /> Dynamic Frontend Controls
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'MAINTENANCE_MODE', label: 'Maintenance' },
                                { key: 'USER_REGISTRATION', label: 'Registrations' },
                                { key: 'BANNER_ENABLED', label: 'Global Banner' },
                                { key: 'MOBILE_APP_REDIRECT', label: 'App Redirect' }
                            ].map(toggle => (
                                <div key={toggle.key} className="p-4 bg-black border border-gray-800 rounded-2xl flex justify-between items-center group">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{toggle.label}</span>
                                    <button
                                        onClick={() => handleUpdateSettings('global', { settings: { [toggle.key]: settings.system?.[toggle.key] === 'true' ? 'false' : 'true' } })}
                                        className={`w-10 h-5 rounded-full transition-all relative ${settings.system?.[toggle.key] === 'true' ? 'bg-indigo-600' : 'bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.system?.[toggle.key] === 'true' ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600/10 border border-indigo-600/20 p-8 rounded-3xl text-center">
                        <ShieldAlert size={48} className="mx-auto text-indigo-500 mb-4 opacity-30" />
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-2">Core System Sync</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-6 tracking-tighter italic">Broadcasting these changes will update all frontend clients instantly.</p>
                        <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-900/40 hover:bg-indigo-700 active:scale-95 transition-all">Flush System Buffer</button>
                    </div>
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
                {Array.isArray(categories) && categories.map(cat => (
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
                            {Array.isArray(papers) && papers.map(p => (
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
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Neural Network Control Hub</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">Active Provider Aggregation & LLM Orchestration</p>
                </div>
                <button
                    onClick={() => {
                        const name = prompt('New Provider ID (e.g., OPENAI, GEMINI):');
                        if (name) api.post('/admin/ai-providers', { name, base_url: '', api_key: '', model_name: '' }).then(() => fetchDashboardData());
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-[10px] uppercase font-black tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-900/40 flex items-center gap-2"
                >
                    <Plus size={14} /> Integrate Neural Node
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.isArray(aiProviders) && aiProviders.map(p => (
                    <div key={p.id} className="bg-gray-900 border border-gray-800 p-8 rounded-3xl relative overflow-hidden group shadow-2xl hover:border-indigo-500/30 transition-all">
                        <div className={`absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase tracking-widest ${p.is_active ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-800 text-gray-500'}`}>
                            {p.is_active ? 'ENGINE PRIMED' : 'STANDBY MODE'}
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <Cpu size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xl uppercase tracking-tighter">{p.name}</h4>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Provider ID: {p.id}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">API Base URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-gray-800 p-3 rounded-xl text-xs text-indigo-400 outline-none focus:border-indigo-500 font-mono font-bold"
                                    value={p.base_url || ''}
                                    onChange={(e) => {
                                        const newAI = aiProviders.map(api_p => api_p.id === p.id ? { ...api_p, base_url: e.target.value } : api_p);
                                        setAiProviders(newAI);
                                    }}
                                />
                                <p className="text-[8px] text-gray-600 mt-1 uppercase font-bold italic">Leave blank for provider default endpoint</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Model Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-gray-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-bold"
                                        value={p.model_name || ''}
                                        onChange={(e) => {
                                            const newAI = aiProviders.map(api_p => api_p.id === p.id ? { ...api_p, model_name: e.target.value } : api_p);
                                            setAiProviders(newAI);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Secret API Key</label>
                                    <input
                                        type="password"
                                        className="w-full bg-black border border-gray-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                                        placeholder="••••••••••••••••"
                                        value={p.api_key || ''}
                                        onChange={(e) => {
                                            const newAI = aiProviders.map(api_p => api_p.id === p.id ? { ...api_p, api_key: e.target.value } : api_p);
                                            setAiProviders(newAI);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    onClick={() => handleUpdateSettings(`ai-providers/${p.id}/status`, { is_active: !p.is_active })}
                                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${p.is_active ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white' : 'bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-900/40'}`}
                                >
                                    {p.is_active ? 'Deactivate Engine' : 'Activate Engine'}
                                </button>
                                <button
                                    onClick={() => handleUpdateSettings(`ai-providers/${p.id}`, { name: p.name, base_url: p.base_url, api_key: p.api_key, model_name: p.model_name })}
                                    className="w-12 h-12 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-2xl hover:bg-white hover:text-black transition-all shadow-lg"
                                >
                                    <Save size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteItem('ai-providers', p.id)}
                                    className="w-12 h-12 flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/20 flex justify-between items-center">
                    <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2"><Activity size={16} className="text-green-500" /> Neural Processing Telemetry</h3>
                    <button onClick={() => fetchDashboardData()} className="text-[10px] text-indigo-400 hover:text-white font-black uppercase tracking-widest bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">Flush Logs</button>
                </div>
                <div className="p-8 h-80 overflow-y-auto bg-black/40 font-mono text-[10px] space-y-3 custom-scrollbar">
                    {aiLogs.length > 0 ? aiLogs.map((log, i) => (
                        <div key={i} className={`flex gap-4 border-b border-gray-800/20 pb-2 ${log.status === 'error' ? 'text-red-400' : 'text-gray-500'}`}>
                            <span className="text-indigo-500 font-bold whitespace-nowrap">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                            <span className="uppercase font-black text-[9px] text-indigo-300 min-w-[60px]">{log.module || 'SYS'}:</span>
                            <span className="flex-1 tracking-tighter leading-relaxed">{log.message || log.error}</span>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-800 animate-pulse">
                            <Activity size={48} className="mb-4 opacity-10" />
                            <p className="font-black uppercase tracking-widest text-lg opacity-10">Waiting for Data Stream...</p>
                        </div>
                    )}
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
                        {Array.isArray(mcqs) && mcqs.map(m => (
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
            <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <div>
                    <h2 className="text-2xl font-black text-white">Prime Architecture</h2>
                    <p className="text-xs text-gray-500 font-bold mt-1">Tiered subscription plans & Monetization Logic (Requirement 5)</p>
                </div>
                <button
                    onClick={() => {
                        const name = prompt('Plan Name:');
                        if (name) api.post('/admin/plans', { name, price: 99, duration_hours: 24, features: [] }).then(() => fetchDashboardData());
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] uppercase font-black tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40 flex items-center gap-2"
                >
                    <Plus size={14} /> Design New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(plans) && plans.map(p => (
                    <div key={p.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl group relative overflow-hidden shadow-2xl hover:border-indigo-500/50 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-white font-black text-xl tracking-tight leading-none mb-1">{p.name.toUpperCase()}</h4>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-indigo-400 font-black text-2xl tracking-tighter">₹{p.price}</span>
                                    <span className="text-gray-500 text-[10px] font-bold">/ {p.duration_hours} HOURS</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUpdateSettings(`plans/${p.id}/status`, { is_active: !p.is_active })}
                                className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${p.is_active ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                            >
                                {p.is_active ? 'LIVE' : 'ARCHIVED'}
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex flex-wrap gap-2">
                                {(p.features || []).map((f, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[8px] font-black uppercase tracking-widest rounded border border-gray-700">{f}</span>
                                ))}
                                <button className="px-2 py-0.5 bg-indigo-500/5 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded border border-indigo-500/10 hover:bg-indigo-500 hover:text-white transition-all">+ Add Feature</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-800">
                            <button className="py-2 bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                                <Edit size={12} /> Edit Plan
                            </button>
                            <button
                                onClick={() => handleDeleteItem('plans', p.id)}
                                className="py-2 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={12} /> Purge
                            </button>
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
                    <SidebarGroup label="CORE MONITORING">
                        <SidebarItem id="overview" label="Logic Diagnostics" icon={LayoutDashboard} />
                        <SidebarItem id="users" label="Identity & Access" icon={Users} />
                    </SidebarGroup>

                    <SidebarGroup label="EDUCATION HIERARCHY">
                        <SidebarItem id="school-mgmt" label="School Central" icon={School} />
                        <SidebarItem id="univ-mgmt" label="University Hub" icon={GraduationCap} />
                        <SidebarItem id="comp-mgmt" label="Competitive Arena" icon={Briefcase} />
                        <SidebarItem id="mcq-mgmt" label="MCQ Moderation" icon={CheckSquare} />
                    </SidebarGroup>

                    <SidebarGroup label="AI & AUTOMATION">
                        <SidebarItem id="ai-mgmt" label="Neural Hub (AI)" icon={Cpu} />
                        <SidebarItem id="free-limit" label="Free Usage Guard" icon={Clock} />
                    </SidebarGroup>

                    <SidebarGroup label="ECONOMICS">
                        <SidebarItem id="sub-mgmt" label="Prime Architecture" icon={CreditCard} />
                        <SidebarItem id="pay-mgmt" label="Revenue Analytics" icon={DollarSign} />
                        <SidebarItem id="ref-mgmt" label="Referral Engine" icon={Share2} />
                    </SidebarGroup>

                    <SidebarGroup label="MARKETING & POLICY">
                        <SidebarItem id="ads-mgmt" label="AdSense Core" icon={PieChart} />
                        <SidebarItem id="seo-mgmt" label="Search Optimization" icon={TrendingUp} />
                        <SidebarItem id="legal-mgmt" label="Legal Compliance" icon={FileText} />
                    </SidebarGroup>

                    <SidebarGroup label="SYSTEM">
                        <SidebarItem id="languages" label="Language Translation" icon={Globe} />
                        <SidebarItem id="sys-settings" label="System Settings" icon={Settings} />
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
                        {activeTab === 'sys-settings' && renderSysSettings()}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
