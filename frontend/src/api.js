import axios from 'axios';

/**
 * Shared Axios instance for all API calls.
 *
 * Base URL is read from the Vite env variable VITE_API_BASE_URL
 * (set in .env / .env.production).
 *
 * Interceptors automatically attach the stored JWT access token
 * to every outgoing request — components don't need to read
 * localStorage themselves.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach token if present ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gst_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 unauthorized (token expired) ──────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 Unauthorized, the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Avoid redirect loops if we are already on the login page or checking for auth
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('gst_user');
        localStorage.removeItem('gst_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
