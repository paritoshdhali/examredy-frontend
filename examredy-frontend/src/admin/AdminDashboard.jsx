import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    LayoutDashboard, Users, Layers, CheckSquare,
    Settings, ShieldAlert, Cpu, Share2,
    Eye, Edit, Trash2, Check, X, Search,
    Plus, DollarSign, UserCheck, TrendingUp, Clock
} from 'lucide-react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Module States
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [mcqs, setMcqs] = useState([]);
    const [settings, setSettings] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/stats');
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load dashboard statistics');
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get(`/admin/users?search=${searchQuery}`);
            setUsers(res.data.users);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchCategories = async () => {
        const res = await api.get('/admin/categories');
        setCategories(res.data);
    };

    const fetchMcqs = async () => {
        const res = await api.get('/admin/mcqs?status=pending');
        setMcqs(res.data);
    };

    const fetchSettings = async () => {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
    };

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'categories') fetchCategories();
        if (activeTab === 'mcqs') fetchMcqs();
        if (activeTab === 'settings') fetchSettings();
    }, [activeTab, searchQuery]);

    const handleUserStatus = async (id, status) => {
        await api.put(`/admin/users/${id}/status`, { is_active: !status });
        fetchUsers();
    };

    const handleUserSub = async (id, action) => {
        await api.put(`/admin/users/${id}/subscription`, { action });
        fetchUsers();
    };

    const handleMcqApprove = async (id) => {
        await api.put(`/admin/mcqs/${id}/approve`);
        fetchMcqs();
    };

    const handleMcqDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this MCQ?')) {
            await api.delete(`/admin/mcqs/${id}`);
            fetchMcqs();
        }
    };

    // --- RENDER COMPONENTS ---

    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-600'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
                <Icon size={24} />
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Active Users Now" value={stats?.activeUsers || 0} icon={UserCheck} color="bg-green-500" />
                <StatCard label="Total Users Today" value={stats?.totalUsersToday || 0} icon={Users} color="bg-blue-500" />
                <StatCard label="MCQs Generated" value={stats?.totalMcqsGenerated || 0} icon={Cpu} color="bg-purple-500" />
                <StatCard label="Today Revenue" value={`₹${stats?.revenueToday || 0}`} icon={DollarSign} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-indigo-600" /> Revenue Growth</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Monthly Revenue</span>
                            <span className="font-bold text-indigo-600">₹{stats?.revenueMonthly || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Yearly Revenue</span>
                            <span className="font-bold text-indigo-600">₹{stats?.revenueYearly || 0}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="font-bold flex items-center gap-2 mb-4"><Users size={18} className="text-indigo-600" /> User Traffic</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Total Users</span>
                            <span className="font-bold">{stats?.totalUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Yesterday Traffic</span>
                            <span className="font-bold">{stats?.totalUsersYesterday || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Username</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Subscription</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-800">{user.username}</td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.is_premium ? (
                                        <span className="bg-gold bg-opacity-20 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-100">PREMIUM</span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-medium">FREE</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.is_active ? 'ACTIVE' : 'DISABLED'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex items-center space-x-3 text-gray-400">
                                    <button onClick={() => handleUserStatus(user.id, user.is_active)} title={user.is_active ? 'Disable' : 'Enable'}>
                                        {user.is_active ? <X className="text-red-500 hover:scale-120 transition-transform" /> : <Check className="text-green-500 hover:scale-120 transition-transform" />}
                                    </button>
                                    <button onClick={() => handleUserSub(user.id, 'extend')} className="hover:text-indigo-600" title="Extend Subscription">
                                        <Plus size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMcqs = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold">MCQ Moderation</h2>
            <div className="grid gap-4">
                {mcqs.length === 0 && <p className="text-gray-500 italic">No pending MCQs to approve.</p>}
                {mcqs.map(m => (
                    <div key={m.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg text-gray-800">{m.question}</h4>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {Object.entries(m.options).map(([key, opt], idx) => (
                                        <div key={idx} className={`p-2 rounded text-sm ${idx === m.correct_option ? 'bg-green-100 border border-green-200 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-4 leading-relaxed"><span className="font-bold">Explanation:</span> {m.explanation}</p>
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                                <button onClick={() => handleMcqApprove(m.id)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors" title="Approve">
                                    <Check size={20} />
                                </button>
                                <button onClick={() => handleMcqDelete(m.id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors" title="Delete">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading && activeTab === 'overview') return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-outfit">
            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col p-6 overflow-y-auto">
                <div className="flex items-center space-x-2 text-indigo-600 mb-10 px-4">
                    <ShieldAlert size={32} />
                    <h1 className="text-xl font-black uppercase tracking-tighter">ExamRedy <span className="text-gray-400 text-xs block -mt-1 font-bold">Admin Panel</span></h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem id="overview" label="Dashboard" icon={LayoutDashboard} />
                    <SidebarItem id="users" label="User Management" icon={Users} />
                    <SidebarItem id="categories" label="Categories" icon={Layers} />
                    <SidebarItem id="mcqs" label="Approve MCQs" icon={CheckSquare} />
                    <SidebarItem id="structure" label="Education Setup" icon={Share2} />
                    <SidebarItem id="ai" label="AI Providers" icon={Cpu} />
                    <SidebarItem id="settings" label="Site Settings" icon={Settings} />
                </nav>

                <div className="mt-auto border-t pt-6 px-4">
                    <div className="flex items-center space-x-3 text-gray-600">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">A</div>
                        <div>
                            <p className="text-sm font-bold">System Admin</p>
                            <p className="text-xs text-gray-400">admin@examredy.in</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-10 overflow-x-hidden">
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center text-sm text-gray-400 space-x-2">
                        <LayoutDashboard size={14} />
                        <span>/ Admin / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                            <Clock size={14} /> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2 font-medium border border-red-100 animate-slideIn"><ShieldAlert size={18} /> {error}</div>}

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'mcqs' && renderMcqs()}

                {activeTab === 'categories' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Category Management</h2>
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                                <Plus size={18} /> Add Category
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-xs text-indigo-900">Name</th>
                                        <th className="px-6 py-4 font-semibold text-xs">Description</th>
                                        <th className="px-6 py-4 font-semibold text-xs">Order</th>
                                        <th className="px-6 py-4 font-semibold text-xs">Status</th>
                                        <th className="px-6 py-4 font-semibold text-xs">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold">{cat.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{cat.description || 'No description'}</td>
                                            <td className="px-6 py-4 font-mono">{cat.sort_order}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center space-x-2 text-gray-400">
                                                <button className="hover:text-indigo-600 transition-colors"><Edit size={18} /></button>
                                                <button className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'structure' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Education Structure</h2>
                            <div className="flex gap-2">
                                <button className="bg-white border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-600 focus:ring-2 focus:ring-indigo-100 outline-none">
                                    <Plus size={16} /> Add State
                                </button>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                                    <Share2 size={16} /> AI Fetch Sub/Chapters
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[500px] flex flex-col">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Indian States</h3>
                                <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                                    {['West Bengal', 'Bihar', 'Delhi', 'Maharashtra', 'Karnataka'].map((s, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-indigo-50 transition-colors group cursor-pointer border border-transparent hover:border-indigo-100">
                                            <span className="font-bold text-gray-700 group-hover:text-indigo-700">{s}</span>
                                            <Edit size={14} className="text-gray-300 group-hover:text-indigo-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[500px] flex flex-col">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Boards per State</h3>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                    {['WBBSE', 'CBSE', 'ICSE'].map((b, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-800">{b}</span>
                                                <div className="flex gap-1">
                                                    <button className="p-1 hover:bg-white rounded transition-colors"><Edit size={14} /></button>
                                                    <button className="p-1 hover:bg-white text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Global Board</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[500px] flex flex-col">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Classes & Streams</h3>
                                <div className="flex-1 overflow-y-auto space-y-1">
                                    {[1, 2, 3, 4, 10, 11, 12].map(c => (
                                        <div key={c} className="p-3 bg-indigo-50/30 rounded-lg flex justify-between items-center border border-indigo-100/50">
                                            <span className="font-black text-indigo-900">Class {c}</span>
                                            {c >= 11 && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-black">STREAMS ENABLED</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold">AI Provider Control</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {['Google Gemini', 'OpenRouter (Claude)', 'OpenAI (GPT-4)'].map((ai, i) => (
                                <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border ${i === 0 ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-gray-100'} relative overflow-hidden`}>
                                    {i === 0 && <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Active Provider</div>}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-3 rounded-xl ${i === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'}`}><Cpu size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-gray-800 uppercase tracking-widest leading-none mb-1">{ai}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Model: {i === 0 ? 'gemini-1.5-flash' : 'Disconnected'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base URL</label>
                                            <input type="text" className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded text-xs outline-none" placeholder="https://api..." readOnly={i !== 0} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">API Key</label>
                                            <input type="password" value="********" className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded text-xs outline-none" readOnly={i !== 0} />
                                        </div>
                                        <button className={`w-full py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${i === 0 ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50' : 'bg-gray-100 text-gray-400'}`}>
                                            {i === 0 ? 'Update Config' : 'Activate Provider'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && settings && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-2xl font-bold">Site & System Settings</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* System Config */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Settings size={18} className="text-indigo-600" /> System Configuration</h3>
                                <div className="space-y-4">
                                    {Object.entries(settings.system).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                defaultValue={value}
                                            />
                                        </div>
                                    ))}
                                    <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mt-4">Save Changes</button>
                                </div>
                            </div>

                            {/* Legal Pages */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><ShieldAlert size={18} className="text-indigo-600" /> Legal & Compliance</h3>
                                <div className="space-y-3">
                                    {settings.legalPages.map(page => (
                                        <div key={page.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors group">
                                            <div>
                                                <p className="font-bold text-gray-700">{page.title}</p>
                                                <p className="text-xs text-gray-400">Slug: /{page.slug}</p>
                                            </div>
                                            <button className="p-2 bg-white rounded-lg shadow-sm border group-hover:text-indigo-600 transition-colors"><Edit size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {['analytics', 'other'].includes(activeTab) && !stats && (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 text-gray-400 space-y-4">
                        <div className="p-6 bg-gray-50 rounded-full"><Settings size={48} className="animate-spin-slow" /></div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-600 uppercase tracking-widest leading-none mb-1">Module Coming Soon</h3>
                            <p className="text-sm">We are expanding the <strong>{activeTab}</strong> capabilities.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Admin;
