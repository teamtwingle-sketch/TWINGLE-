
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

// Helper to fix photo URLs
export const getPhotoUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) {
        // Fix Mixed Content
        if (path.startsWith('http://') && !path.includes('localhost') && !path.includes('127.0.0.1')) {
            return path.replace('http://', 'https://');
        }
        return path;
    }
    // Handle relative path: Ensure we don't double slash
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    // If base url ends with /api, remove it? No, images are usually at root /media
    // Assuming VITE_API_BASE_URL is like https://backend.com/api
    // We want https://backend.com/media/...

    // Easier usage: The API usually returns relative path "/media/..."
    // If we use the API URL, we might get https://backend.com/api/media... which is wrong.
    // Railway URL usually serves media at root.

    // Let's assume the BASE_URL is the domain origin in production logic.
    // But safely:
    let domain = baseUrl.replace('/api', '');
    if (domain.endsWith('/')) domain = domain.slice(0, -1);

    if (!path.startsWith('/')) path = '/' + path;

    return `${domain}${path}`;
};

export default api;
