import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, ArrowRight } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const logoText = "ExamRedy";

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* LEFT SIDE: Static Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-200/50 group-hover:-rotate-12 transition-transform duration-300">
                            <span className="text-white font-black text-2xl">E</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-black text-2xl text-gray-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{logoText}</span>
                            <div className="h-1 w-8 bg-indigo-600 rounded-full mt-1 group-hover:w-full transition-all duration-300"></div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Navigation & Auth (Desktop) + Mobile Menu Toggle */}
                    <div className="flex items-center gap-8">
                        {/* Mobile Menu Button (Visible on mobile) */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -mr-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex space-x-1 items-center">
                            <Link to="/" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all uppercase tracking-widest">Home</Link>
                            <Link to="/practice" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all uppercase tracking-widest">Practice</Link>
                            <Link to="/group" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all uppercase tracking-widest">Group Battle</Link>
                            <Link to="/prime" className="px-5 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest">
                                <span className="text-lg">👑</span> Prime
                            </Link>
                        </nav>

                        {/* Desktop Auth Buttons / Profile */}
                        <div className="hidden md:flex items-center pl-4 border-l border-gray-200">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link to={user.role === 'admin' ? '/admin/dashboard' : '/profile'} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-2xl border border-gray-200/50 transition-all cursor-pointer">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                        <span className="text-sm font-black text-gray-700">{user.username}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="Logout">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="px-6 py-2.5 text-sm font-black text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest">Login</Link>
                                    <Link to="/register" className="group flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 hover:shadow-indigo-200">
                                        Sign Up <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-2xl border-t border-gray-100 animate-in slide-in-from-top-2 absolute w-full shadow-2xl">
                    <div className="px-6 py-8 space-y-6">
                        <nav className="flex flex-col space-y-2">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-4 rounded-2xl text-sm font-black text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 uppercase tracking-widest transition-all">Home</Link>
                            <Link to="/practice" onClick={() => setIsMenuOpen(false)} className="px-4 py-4 rounded-2xl text-sm font-black text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 uppercase tracking-widest transition-all">Practice</Link>
                            <Link to="/group" onClick={() => setIsMenuOpen(false)} className="px-4 py-4 rounded-2xl text-sm font-black text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 uppercase tracking-widest transition-all">Group Battle</Link>
                            <Link to="/prime" onClick={() => setIsMenuOpen(false)} className="px-4 py-4 rounded-2xl text-sm font-black text-amber-600 hover:bg-amber-50 uppercase tracking-widest transition-all flex items-center gap-3">
                                <span className="text-xl">👑</span> Prime Access
                            </Link>
                        </nav>

                        <div className="h-px bg-gray-100 w-full my-6"></div>

                        {user ? (
                            <div className="space-y-4">
                                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/profile'} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Signed in as</p>
                                        <p className="text-sm font-black text-gray-900">{user.username}</p>
                                    </div>
                                </Link>
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-black text-red-500 bg-red-50 hover:bg-red-100 uppercase tracking-widest transition-all">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-4 rounded-2xl text-sm font-black text-gray-700 bg-gray-50 border border-gray-100 hover:bg-gray-100 uppercase tracking-widest transition-all">Login</Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-4 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 uppercase tracking-widest transition-all">Create Account</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
