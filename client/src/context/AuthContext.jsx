import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({ baseURL: '/api' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set auth header for all requests when token exists
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('trakcp_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('trakcp_token');
    }
  };

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('trakcp_token');
      const savedUser = localStorage.getItem('trakcp_user');

      if (token) {
        setAuthToken(token);
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setIsAuthenticated(true);
          localStorage.setItem('trakcp_user', JSON.stringify(res.data.user));
        } catch {
          // Token expired or invalid — fall back to localStorage
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
              setIsAuthenticated(true);
            } catch {
              localStorage.removeItem('trakcp_user');
            }
          }
          setAuthToken(null);
        }
      } else if (savedUser) {
        // Guest mode — use localStorage data
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('trakcp_user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token, user: userData } = res.data;
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('trakcp_user', JSON.stringify(userData));
    return userData;
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('trakcp_user', JSON.stringify(userData));
    return userData;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const res = await api.post('/auth/google', { credential });
    const { token, user: userData } = res.data;
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('trakcp_user', JSON.stringify(userData));
    return userData;
  }, []);

  // Guest login — no server required
  const loginAsGuest = useCallback((guestData) => {
    const userData = {
      id: 'guest',
      username: guestData?.username || 'Guest User',
      email: null,
      isGuest: true,
      ...guestData,
    };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('trakcp_user', JSON.stringify(userData));
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    localStorage.removeItem('trakcp_user');
    localStorage.removeItem('trakcp_token');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        loginWithEmail,
        loginWithGoogle,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
