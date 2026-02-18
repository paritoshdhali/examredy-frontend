import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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

            <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </div>
            </div >

    {/* Mobile Menu */ }
{
    isMenuOpen && (
        <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Home</Link>
                <Link to="/practice" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Practice</Link>
                <Link to="/group" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Group Mode</Link>
                <Link to="/prime" className="block px-3 py-2 rounded-md text-base font-medium text-amber-500 hover:text-amber-600 hover:bg-gray-50">Prime</Link>
                {user ? (
                    <>
                        <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700">Profile</Link>
                        {user.role === 'admin' && <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600">Admin Dashboard</Link>}
                        <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700">Login</Link>
                        <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary">Register</Link>
                    </>
                )}
            </div>
        </div>
    )
}
        </header >
    );
};

export default Header;
