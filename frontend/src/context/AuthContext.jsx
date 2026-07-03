import { createContext, useContext, useState } from 'react';
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gst_user');
    localStorage.removeItem('gst_token');
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
