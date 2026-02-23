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
            // Check if it's the custom LIMIT_REACHED error (which is also a 403 but shouldn't log the user out)
            if (error.response.data?.code === 'LIMIT_REACHED') {
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
