import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Practice from './pages/Practice';
import Group from './pages/Group';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import Prime from './pages/Prime';
// import MCQSession from './components/MCQSession'; // To be implemented

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    if (adminOnly) {
        if (!user) {
            return <Navigate to="/admin" replace />;
        }
        if (user.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
        return children;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/practice" element={
                        <ProtectedRoute>
                            <Practice />
                        </ProtectedRoute>
                    } />

                    <Route path="/group" element={
                        <ProtectedRoute>
                            <Group />
                        </ProtectedRoute>
                    } />

                    <Route path="/prime" element={
                        <ProtectedRoute>
                            <Prime />
                        </ProtectedRoute>
                    } />

                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Add more routes as needed */}
                </Routes>
            </main>
            <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} ExamRedy. All rights reserved.
            </footer>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App
