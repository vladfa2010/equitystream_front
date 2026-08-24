import type { ClientResponse, CreateClientRequest } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://159-194-206-229.sslip.io/api';

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
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const clientsApi = {
  getAll: async (params?: { status?: string; search?: string }): Promise<ClientResponse[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return fetchWithAuth(`/clients?${query}`);
  },

  getById: async (id: string): Promise<ClientResponse | null> => {
    return fetchWithAuth(`/clients/${id}`);
  },

  create: async (data: CreateClientRequest): Promise<ClientResponse> => {
    return fetchWithAuth('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Record<string, any>): Promise<ClientResponse> => {
    return fetchWithAuth(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchWithAuth(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  getPortfolio: async (id: string) => {
    const { getAllDeals } = await import('../localDb');
    const deals = getAllDeals().filter((d: any) =>
      d.investments?.some((i: any) => i.clientId === id)
    );
    return deals;
  },
};
