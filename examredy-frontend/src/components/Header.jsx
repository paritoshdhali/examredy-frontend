import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';

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
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 tracking-tight">{logoText}</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 items-center">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
                        <Link to="/practice" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Practice</Link>
                        <Link to="/prime" className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center">
                            <span className="mr-1">👑</span> Prime
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Admin</Link>
                        )}
                    </nav>

                    {/* Auth Buttons / Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-bold text-gray-700">{user.username}</span>
                                </div>
                                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-primary font-medium">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Get Started</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-primary transition-colors">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t animate-fadeIn">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Home</Link>
                        <Link to="/practice" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Practice</Link>
                        <Link to="/prime" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-amber-500 hover:bg-amber-50">👑 Prime</Link>
                        <hr className="my-2 border-gray-100" />
                        {user ? (
                            <div className="space-y-2">
                                <div className="px-3 py-2 text-sm text-gray-400 font-bold uppercase tracking-widest">Account</div>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50">Profile</Link>
                                {user.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-medium text-indigo-600 hover:bg-indigo-50">Admin Dashboard</Link>}
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-xl text-base font-medium text-red-500 hover:bg-red-50">Logout</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-3 rounded-xl font-bold text-gray-700 bg-gray-100">Login</Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-center py-3 rounded-xl font-bold text-white bg-primary shadow-lg shadow-indigo-200">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
