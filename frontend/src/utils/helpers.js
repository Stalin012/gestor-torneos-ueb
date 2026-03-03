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

/**
 * Función definitiva para obtener la URL de un recurso.
 * Resuelve problemas de:
 * 1. Rutas locales (localhost) en la BD.
 * 2. Problemas de symlink en hostings compartidos.
 */
export const getAssetUrl = (path) => {
    if (!path) return '';

    // Si ya es una URL externa (Unsplash, etc), devolverla tal cual
    if (path.startsWith('http') && !path.includes('localhost') && !path.includes('127.0.0.1') && !path.includes('/storage/')) {
        return path;
    }

    // Base del API limpia: "https://api.deportesueb.com/api"
    const apiBase = "https://api.deportesueb.com/api";

    // Extraer la ruta limpia (sin localhost y sin /storage/)
    let cleanPath = path;

    // Si viene con localhost, quitar la base del dominio
    if (cleanPath.includes('localhost') || cleanPath.includes('127.0.0.1')) {
        cleanPath = cleanPath.split('/storage/').pop() || cleanPath.split('/api/files/').pop() || cleanPath;
        // Si el cleanPath todavía tiene el dominio, quitarlo a la fuerza
        if (cleanPath.startsWith('http')) {
            cleanPath = cleanPath.substring(cleanPath.indexOf('/', 10) + 1);
        }
    }

    // Limpiar prefijos comunes para quedarnos solo con la sub-ruta del archivo
    let subPath = cleanPath.replace(/^.*\/storage\//, '')
        .replace(/^.*\/api\/files\//, '')
        .replace(/^\/?storage\//, '')
        .replace(/^\//, '');

    // IMPORTANTE: Si es una imagen estática del frontend
    if (subPath.startsWith('img/') || subPath.startsWith('logos/')) {
        return `/${subPath}`;
    }

    // TODO lo que sea de base de datos se sirve por el proxy de la API
    return `${apiBase}/files/${subPath}`;
};
