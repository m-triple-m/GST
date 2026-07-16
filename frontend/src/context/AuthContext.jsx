import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api';

/**
 * AuthContext — global authentication state
 *
 * Roles: 'guest' | 'member' | 'admin'
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on page reload
    const stored = localStorage.getItem('gst_user');
    return stored ? JSON.parse(stored) : null;
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gst_user');
    localStorage.removeItem('gst_token');
  };

  // ── Inactivity Timeout (15 minutes) ──
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    // Only apply inactivity timeout if user is logged in
    if (!user) return;

    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 mins

    const handleIdle = () => {
      logout();
      window.location.href = '/login';
    };

    const resetTimer = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(handleIdle, INACTIVITY_LIMIT_MS);
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [user]);

  /**
   * Call this from LoginPage with credentials.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { accessToken, user: userData } = data.data;
      setUser(userData);
      localStorage.setItem('gst_user', JSON.stringify(userData));
      localStorage.setItem('gst_token', accessToken);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — hook to access auth state and actions.
 * 
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
