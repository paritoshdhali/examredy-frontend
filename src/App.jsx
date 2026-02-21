import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdProvider } from './context/AdContext';
import Header from './components/Header';
import AdSlot from './components/AdSlot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Practice from './pages/Practice';
import Group from './pages/Group';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import Prime from './pages/Prime';

// ── Admin-only protected route ──────────────────────────────────────
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const token = localStorage.getItem('adminToken');
    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

// ── Regular protected route ──────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

// ── Layout wrapper for main site (Header + Footer) ───────────────────
const MainLayout = () => (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="container mx-auto">
            <AdSlot type="top" />
        </div>
        <main className="flex-grow">
            <Outlet />
        </main>
        <div className="container mx-auto">
            <AdSlot type="bottom" />
        </div>
        <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ExamRedy. All rights reserved.
        </footer>
    </div>
);

// ── All routes ────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>
            {/* Admin zone — fullscreen, no Header/Footer */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/dashboard"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />

            {/* Main site zone — uses MainLayout (Header + Footer) */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
                <Route path="/group" element={<ProtectedRoute><Group /></ProtectedRoute>} />
                <Route path="/prime" element={<ProtectedRoute><Prime /></ProtectedRoute>} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <AdProvider>
                <AppRoutes />
            </AdProvider>
        </AuthProvider>
    );
}

export default App;
