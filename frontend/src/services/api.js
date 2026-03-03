export const API_BASE = import.meta.env.VITE_API_URL;
export const API_ORIGIN = API_BASE?.replace(/\/api\/?$/, '');

console.log('API Base URL:', API_BASE);

export async function apiFetch(endpoint, options = {}) {
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {}),
  };
  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf && !headers['X-XSRF-TOKEN']) {
    headers['X-XSRF-TOKEN'] = xsrf;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Important for Laravel Sanctum and CORS
  };

  const useOrigin = endpoint.startsWith('/sanctum/') || endpoint === '/login' || endpoint === '/logout';

  // Normalizar base para evitar dobles barras
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const urlBase = useOrigin ? API_ORIGIN : API_BASE;
  const url = endpoint.startsWith('http') ? endpoint : `${urlBase.replace(/\/$/, '')}/${cleanEndpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }

    const errorData = await response.json().catch(() => ({ message: response.statusText, status: response.status }));

    const err = new Error(errorData.message || 'Something went wrong');
    err.response = { status: response.status, data: errorData };
    throw err;
  }

  return response.json();
}
export function getCsrfCookie() {
  return apiFetch('/sanctum/csrf-cookie', { method: 'GET' });
}
