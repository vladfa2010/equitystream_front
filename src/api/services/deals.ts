import type { DealResponse, CreateDealRequest } from '../types';

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

export const dealsApi = {
  getAll: async (params?: { status?: string; clientId?: string }): Promise<DealResponse[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.clientId) query.set('clientId', params.clientId);
    return fetchWithAuth(`/deals?${query}`);
  },

  getById: async (id: string): Promise<DealResponse> => {
    return fetchWithAuth(`/deals/${id}`);
  },

  create: async (data: CreateDealRequest): Promise<{ id: string }> => {
    return fetchWithAuth('/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchWithAuth(`/deals/${id}`, {
      method: 'DELETE',
    });
  },

  getClientReservations: async (_clientId: string) => {
    // TODO: implement reservations
    return [];
  },
};
