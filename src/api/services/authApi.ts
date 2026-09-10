import type { LoginRequest, LoginResponse, UserDto } from '../types';
import { apiFetch } from '../http';

function unwrap<T>(res: any): T {
  if (res && res.data !== undefined) return res.data as T;
  return res as T;
}

async function api(endpoint: string, options: RequestInit = {}) {
  const res = await apiFetch(endpoint, options);

  const data = await res.json().catch(() => ({ error: 'Network error' }));

  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }

  return data;
}

export interface AuthUser extends UserDto {
  isVerified: boolean;
}

function normalizeUser(user: UserDto): AuthUser {
  return { ...user, isVerified: user.status === 'active' };
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthUser> {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // ТЗ-4: the session is set as an httpOnly cookie by the backend;
    // the token in the body belongs to the Bearer transition period
    // and is intentionally NOT stored in JS-accessible storage.
    const { user } = unwrap<LoginResponse>(res);
    return normalizeUser(user);
  },

  async register(data: { email: string; name: string; password: string; role?: 'admin' | 'client' }): Promise<AuthUser> {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const { user } = unwrap<LoginResponse>(res);
    return normalizeUser(user);
  },

  async me(): Promise<AuthUser | null> {
    const res = await api('/auth/me');
    const user = unwrap<UserDto | null>(res);
    return user ? normalizeUser(user) : null;
  },

  /**
   * ТЗ-3: request a reset link. The backend answers identically for
   * existing and non-existing emails (anti-enumeration).
   */
  async forgotPassword(email: string): Promise<void> {
    await api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * ТЗ-3: reset password with the one-time token from the email link.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  /**
   * ТЗ-4 Задача 1.4: tell the backend to invalidate the session cookie,
   * then drop the local UI state.
   */
  async logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Best-effort: the local state is cleared even if the call fails.
    }
    localStorage.removeItem('es_user');
    localStorage.removeItem('es_view_mode');
  },
};

export type { LoginRequest, LoginResponse, UserDto };
