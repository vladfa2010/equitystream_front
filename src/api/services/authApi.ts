export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
    isBlocked: boolean;
    isVerified: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isBlocked: boolean;
  isVerified: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

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
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('es_auth_token', data.token);
    }
    return data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      localStorage.setItem('es_auth_token', res.token);
    }
    return res;
  },

  async me(): Promise<{ user: User }> {
    return api('/auth/me');
  },

  async forgotPassword(email: string): Promise<any> {
    return api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyCode(email: string, code: string): Promise<{ resetToken: string }> {
    return api('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<any> {
    return api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    });
  },

  logout() {
    localStorage.removeItem('es_auth_token');
    localStorage.removeItem('es_user');
    localStorage.removeItem('es_view_mode');
  },
};

export const adminApi = {
  async getUsers(filter?: string, page = 1, limit = 20): Promise<any> {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return api(`/admin/users?${params}`);
  },

  async getUser(id: string): Promise<any> {
    return api(`/admin/users/${id}`);
  },

  async toggleAdmin(id: string): Promise<any> {
    return api(`/admin/users/${id}/toggle-admin`, { method: 'POST' });
  },

  async toggleBlock(id: string): Promise<any> {
    return api(`/admin/users/${id}/toggle-block`, { method: 'POST' });
  },

  async approveUser(id: string): Promise<any> {
    return api(`/admin/users/${id}/approve`, { method: 'POST' });
  },

  async resetPassword(id: string, newPassword: string): Promise<any> {
    return api(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  async deleteUser(id: string): Promise<any> {
    return api(`/admin/users/${id}`, { method: 'DELETE' });
  },
};
