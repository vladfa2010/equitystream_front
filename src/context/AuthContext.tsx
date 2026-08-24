import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  isVerified: boolean;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  viewMode: 'admin' | 'user';
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  setViewMode: (mode: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'https://159-194-206-229.sslip.io/api';

function api(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('es_auth_token');
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<'admin' | 'user'>(() => {
    try { return (localStorage.getItem('es_view_mode') as 'admin' | 'user') || 'user'; } catch { return 'user'; }
  });

  // Check session on mount
  useEffect(() => {
    const token = localStorage.getItem('es_auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api('/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const u = data.user;
          setUser({
            id: u.id,
            name: u.username,
            email: u.email,
            role: u.isAdmin ? 'admin' : 'user',
            isVerified: u.isVerified,
            avatarUrl: null,
          });
        } else {
          localStorage.removeItem('es_auth_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('es_auth_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('es_view_mode', viewMode);
  }, [viewMode]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('es_auth_token', data.token);
    const u = data.user;
    setUser({
      id: u.id,
      name: u.username,
      email: u.email,
      role: u.isAdmin ? 'admin' : 'user',
      isVerified: u.isVerified,
      avatarUrl: null,
    });
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('es_auth_token', data.token);
    const u = data.user;
    setUser({
      id: u.id,
      name: u.username,
      email: u.email,
      role: u.isAdmin ? 'admin' : 'user',
      isVerified: u.isVerified,
      avatarUrl: null,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setViewModeState('user');
    localStorage.removeItem('es_auth_token');
    localStorage.removeItem('es_view_mode');
    localStorage.removeItem('es_logged_in_user');
  }, []);

  const setViewMode = useCallback((mode: 'admin' | 'user') => {
    setViewModeState(mode);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isVerified = user?.isVerified ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isVerified,
        viewMode,
        isLoading,
        login,
        register,
        logout,
        setViewMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
