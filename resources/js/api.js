import axios from 'axios';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 
  (typeof window !== 'undefined' && window.location && window.location.origin ? `${window.location.origin}/api` : 'http://127.0.0.1:8000/api');

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para añadir el token si existe
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
