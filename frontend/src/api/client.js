
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        // Upgrade all HTTP links to HTTPS in the response data
        const upgradeToHttps = (obj) => {
            if (typeof obj === 'string') {
                if (obj.startsWith('http://') && !obj.includes('localhost') && !obj.includes('127.0.0.1')) {
                    return obj.replace('http://', 'https://');
                }
                return obj;
            }
            if (Array.isArray(obj)) {
                return obj.map(upgradeToHttps);
            }
            if (obj && typeof obj === 'object') {
                Object.keys(obj).forEach(key => {
                    obj[key] = upgradeToHttps(obj[key]);
                });
                return obj;
            }
            return obj;
        };

        if (response.data) {
            response.data = upgradeToHttps(response.data);
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user_id');
            // Prevent redirect loop if already on login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
