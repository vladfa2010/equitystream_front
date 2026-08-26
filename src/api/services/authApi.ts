import type { LoginRequest, LoginResponse, UserDto } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

function unwrap<T>(res: any): T {
  if (res && res.data !== undefined) return res.data as T;
  return res as T;
}

async function api(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('es_auth_token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

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
    const { accessToken, user } = unwrap<LoginResponse>(res);
    if (accessToken) {
      localStorage.setItem('es_auth_token', accessToken);
    }
    return normalizeUser(user);
  },

  async register(data: { email: string; name: string; password: string; role?: 'admin' | 'client' }): Promise<AuthUser> {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const { accessToken, user } = unwrap<LoginResponse>(res);
    if (accessToken) {
      localStorage.setItem('es_auth_token', accessToken);
    }
    return normalizeUser(user);
  },

  async me(): Promise<AuthUser | null> {
    const res = await api('/auth/me');
    const user = unwrap<UserDto | null>(res);
    return user ? normalizeUser(user) : null;
  },

  async forgotPassword(_email: string): Promise<void> {
    throw new Error('Password reset is not available. Please contact support.');
  },

  async verifyCode(_email: string, _code: string): Promise<{ resetToken: string }> {
    throw new Error('Password reset is not available. Please contact support.');
  },

  async resetPassword(_resetToken: string, _newPassword: string): Promise<void> {
    throw new Error('Password reset is not available. Please contact support.');
  },

  logout() {
    localStorage.removeItem('es_auth_token');
    localStorage.removeItem('es_user');
    localStorage.removeItem('es_view_mode');
  },
};

export type { LoginRequest, LoginResponse, UserDto };
