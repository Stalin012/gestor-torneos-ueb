/**
 * auth.js — Capa de abstracción de sesión
 *
 * Usa sessionStorage para que cada pestaña del navegador tenga
 * su propia sesión independiente. Esto permite que el administrador
 * y un jugador puedan estar abiertos en pestañas distintas sin
 * interferirse mutuamente.
 *
 * sessionStorage:  aislado por pestaña, se borra al cerrar la pestaña
 * localStorage:    compartido entre todas las pestañas del mismo origen
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// ── Guardar sesión ────────────────────────────────────────────────────────────
export const saveSession = (token, user) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ── Leer token ────────────────────────────────────────────────────────────────
export const getToken = () => {
    return sessionStorage.getItem(TOKEN_KEY) || null;
};

// ── Leer usuario ──────────────────────────────────────────────────────────────
export const getUser = () => {
    try {
        const raw = sessionStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

// ── Actualizar datos del usuario (sin cambiar token) ─────────────────────────
export const updateUser = (updates) => {
    const current = getUser() || {};
    const updated = { ...current, ...updates };
    sessionStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
};

// ── Cerrar sesión ─────────────────────────────────────────────────────────────
export const clearSession = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
};

// ── ¿Hay sesión activa? ───────────────────────────────────────────────────────
export const isAuthenticated = () => {
    return !!getToken();
};
