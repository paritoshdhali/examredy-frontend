import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://examredy-backend1-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('token');
        const token = adminToken || userToken; // Prioritize adminToken for admin routes if both exist, or handle as needed
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API-ERROR]', error.response?.status, error.response?.data || error.message);
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            const path = window.location.pathname;
            if (path.startsWith('/admin')) {
                console.warn('[AUTH] Admin 401 - staying on page');
                localStorage.removeItem('adminToken');
            } else if (path !== '/login' && path !== '/register') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
