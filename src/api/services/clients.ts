import type { ClientResponse, CreateClientRequest } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('es_auth_token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function unwrap<T>(res: any): T {
  // Backend wraps responses in { success: true, data: T }
  if (res && res.data !== undefined) return res.data as T;
  return res as T;
}

export interface ClientListEnvelope {
  data: ClientResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const clientsApi = {
  getAll: async (params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<ClientListEnvelope> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const res = await fetchWithAuth(`/users/clients?${query}`);
    return unwrap<ClientListEnvelope>(res);
  },

  getById: async (id: string): Promise<ClientResponse> => {
    const res = await fetchWithAuth(`/users/clients/${id}`);
    return unwrap<ClientResponse>(res);
  },

  create: async (data: CreateClientRequest): Promise<ClientResponse> => {
    const res = await fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'client' }),
    });
    return unwrap<ClientResponse>(res);
  },

  update: async (id: string, data: Partial<ClientResponse>): Promise<ClientResponse> => {
    const res = await fetchWithAuth(`/users/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return unwrap<ClientResponse>(res);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    // Hard delete (removes the user record entirely). Requires admin role.
    const res = await fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
    return unwrap<{ message: string }>(res);
  },

  getPortfolio: async (id: string) => {
    const res = await fetchWithAuth(`/users/clients/${id}/portfolio`);
    return unwrap(res);
  },

  getSummary: async (): Promise<any> => {
    const res = await fetchWithAuth('/users/clients/summary');
    return unwrap(res);
  },

  resetPassword: async (id: string): Promise<{ userId: string; emailSent: boolean; emailError?: string }> => {
    const res = await fetchWithAuth(`/users/${id}/reset-password`, {
      method: 'POST',
    });
    return unwrap(res);
  },

  setPassword: async (id: string, newPassword: string): Promise<{ userId: string; newPassword: string }> => {
    const res = await fetchWithAuth(`/users/${id}/set-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
    return unwrap(res);
  },
};
