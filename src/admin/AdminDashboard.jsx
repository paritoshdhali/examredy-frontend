import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-950 font-sans">

            {/* ── Sidebar ── */}
            <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-30">
                {/* Brand */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-tight">EXAMREDY</p>
                            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    <button
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold"
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </button>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 px-2">
                        {user?.email || 'Admin'}
                    </p>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 ml-56 flex flex-col">
                {/* Top Header */}
                <header className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
                    <h1 className="text-white font-black text-lg tracking-tight uppercase">Admin Panel</h1>
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest animate-pulse">
                        ● System Online
                    </span>
                </header>

                {/* Body */}
                <div className="flex-1 flex items-center justify-center p-10">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={36} className="text-indigo-400" />
                        </div>
                        <h2 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">
                            Admin Core Stable
                        </h2>
                        <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6">
                            Ready for Feature Modules
                        </p>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-left space-y-2">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">System Status</p>
                            {[
                                { label: 'Auth', status: 'OK' },
                                { label: 'Token', status: 'Valid' },
                                { label: 'Session', status: 'Secure' },
                                { label: 'Backend', status: 'Connected' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center">
                                    <span className="text-gray-400 text-xs font-bold">{item.label}</span>
                                    <span className="text-green-400 text-[10px] font-black uppercase bg-green-500/10 px-2 py-0.5 rounded">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
