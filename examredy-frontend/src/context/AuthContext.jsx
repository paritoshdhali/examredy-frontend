import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            if (token) {
                try {
                    // This endpoint should verify the token and return user data regardless of role
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Failed to load user", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('adminToken');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const setAuthData = (data) => {
        if (data.token) {
            const storageKey = data.role === 'admin' ? 'adminToken' : 'token';
            localStorage.setItem(storageKey, data.token);
        }
        setUser(data.user || data);
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setAuthData(res.data);
        return res.data;
    };

    const register = async (username, email, password, referrerId = null) => {
        const res = await api.post('/auth/register', { username, email, password, referrer_id: referrerId });
        setAuthData(res.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setAuthData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
