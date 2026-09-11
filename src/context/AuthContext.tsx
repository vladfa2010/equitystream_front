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
  /** ТЗ-6: промежуточный токен ожидания — не null, когда пароль верен и ждём 2FA-код */
  twoFactorToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  completeTwoFactor: (code: string) => Promise<void>;
  cancelTwoFactor: () => void;
  /** ТЗ-6: отметить 2FA включённой после успешного enable (без повторного логина) */
  markTotpEnabled: () => void;
  register: (email: string, name: string, password: string, role?: 'admin' | 'client') => Promise<void>;
  logout: () => void;
  setViewMode: (mode: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<'admin' | 'user'>(() => {
    try { return (localStorage.getItem('es_view_mode') as 'admin' | 'user') || 'user'; } catch { return 'user'; }
  });

  // Check session on mount (ТЗ-4: the session cookie decides —
  // no token check in JS anymore)
  useEffect(() => {
    authApi.me()
      .then((u) => {
        if (u) {
          setUser(u);
        }
      })
      .catch(() => {
        // 401 — unauthenticated; apiFetch already redirects to login
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('es_view_mode', viewMode);
  }, [viewMode]);

  /** ТЗ-6: вернёт true, если пароль верен, но нужен второй шаг с 2FA-кодом. */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const result = await authApi.login({ email, password });
    // ТЗ-6: включённая 2FA — сессии нет, ждём код на втором шаге
    if (result.twoFactorToken) {
      setTwoFactorToken(result.twoFactorToken);
      return true;
    }
    setTwoFactorToken(null);
    setUser(result.user ?? null);
    return false;
  }, []);

  const completeTwoFactor = useCallback(async (code: string) => {
    const u = await authApi.verifyTwoFactor(twoFactorToken as string, code);
    setTwoFactorToken(null);
    setUser(u);
  }, [twoFactorToken]);

  const cancelTwoFactor = useCallback(() => {
    setTwoFactorToken(null);
  }, []);

  const markTotpEnabled = useCallback(() => {
    setUser((u) => (u ? { ...u, totpEnabled: true } : u));
  }, []);

  const register = useCallback(async (email: string, name: string, password: string, role?: 'admin' | 'client') => {
    const u = await authApi.register({ email, name, password, role });
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setViewModeState('user');
    void authApi.logout();
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
        twoFactorToken,
        login,
        completeTwoFactor,
        cancelTwoFactor,
        markTotpEnabled,
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
