import axios from 'axios';

const API_BASE_RAW = (import.meta.env && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://api.deportesueb.com/api");

// Asegurar que la URL termine en /api y no tenga barra de cierre extra
const normalizeBase = (url) => {
    let base = url.replace(/\/$/, '');
    if (!base.endsWith('/api')) base += '/api';
    return base;
};

// Asegurar que la URL base para sanctum no tenga /api y no tenga barra de cierre extra
const normalizeSanctumBase = (url) => {
    let base = url.replace(/\/$/, '');
    if (base.endsWith('/api')) base = base.slice(0, -4); // Remove /api if present
    return base;
};

export const API_BASE = normalizeBase(API_BASE_RAW);
export const API_ORIGIN = normalizeSanctumBase(API_BASE_RAW); // Base URL without /api for Sanctum

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const apiPublic = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const apiSanctum = axios.create({
    baseURL: API_ORIGIN, // URL root para Sanctum
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Función para obtener el token CSRF
export const getCsrfCookie = async () => {
    await apiSanctum.get('/sanctum/csrf-cookie');
};

// Interceptor para añadir el token si existe
api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
