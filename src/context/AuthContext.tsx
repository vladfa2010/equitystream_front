import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/api/services/authApi';
import type { AuthUser } from '@/api/services/authApi';

export type { AuthUser };

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isVerified: boolean;
  viewMode: 'admin' | 'user';
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, role?: 'admin' | 'client') => Promise<void>;
  logout: () => void;
  setViewMode: (mode: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    authApi.me()
      .then((u) => {
        if (u) {
          setUser(u);
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
    const u = await authApi.login({ email, password });
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, name: string, password: string, role?: 'admin' | 'client') => {
    const u = await authApi.register({ email, name, password, role });
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setViewModeState('user');
    authApi.logout();
  }, []);

  const setViewMode = useCallback((mode: 'admin' | 'user') => {
    setViewModeState(mode);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  const isVerified = user?.isVerified ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isClient,
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
