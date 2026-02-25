import axios from 'axios';

// Force production URL if import.meta.env.PROD is true, overriding any faulty Vercel VITE_API_URL settings.
const isProd = import.meta.env.PROD;
const API_URL = isProd
    ? 'https://examredy-backend1-production.up.railway.app/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            if (typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
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
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Check if it's a known business-logic error that shouldn't log the user out
            const code = error.response.data?.code;
            if (code === 'LIMIT_REACHED' || code === 'SESSIONS_EXHAUSTED') {
                return Promise.reject(error);
            }

            // Token expired, invalid, or lacking privileges
            const path = window.location.pathname;
            if (path.startsWith('/admin')) {
                console.warn('[AUTH] Admin auth failed - redirecting to login');
                localStorage.removeItem('adminToken');
                if (path !== '/admin/login') {
                    window.location.href = '/admin/login';
                }
            } else if (path !== '/login' && path !== '/register') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
