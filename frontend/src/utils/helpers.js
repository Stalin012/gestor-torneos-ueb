import { API_BASE } from '../api';

export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const formatDateTime = (date, time) => {
    if (!date) return 'N/A';
    const dateStr = formatDate(date);
    return time ? `${dateStr} ${time.substring(0, 5)}` : dateStr;
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount);
};

export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getInitials = (name) => {
    if (!name) return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export const validateCedula = (cedula) => {
    if (!cedula || cedula.length !== 10) return false;
    const digits = cedula.split('').map(Number);
    const province = parseInt(cedula.substring(0, 2));
    if (province < 1 || province > 24) return false;
    const verifier = digits[9];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = digits[i];
        if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    const calculatedVerifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    return verifier === calculatedVerifier;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

export const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    const baseUrl = API_BASE.replace(/\/api\/?$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
