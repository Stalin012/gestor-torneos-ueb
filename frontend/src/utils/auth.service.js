// c:\gestor\frontend\src\utils\auth.service.js

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getTokenOrThrow = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Sesión expirada.");
  return token;
};

const logoutAndRedirect = () => {
  localStorage.clear();
  window.location.href = "/login";
};

const parseErrorResponse = async (res) => {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json?.message || json?.error || "Error del servidor";
  } catch {
    return text || `Error HTTP ${res.status}`;
  }
};

const AuthService = {
  API_BASE,
  getTokenOrThrow,
  logoutAndRedirect,
  parseErrorResponse,
};

export default AuthService;
