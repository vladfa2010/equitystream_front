import { getAllClients, getClientById, createClientLocal } from '../localDb';
import type { ClientResponse, CreateClientRequest } from '../types';

export const clientsApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    let clients = getAllClients();
    if (params?.status) {
      clients = clients.filter(c => c.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      clients = clients.filter(
        c =>
          (c.fullName || c.name).toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      );
    }
    return clients;
  },

  getById: async (id: string): Promise<ClientResponse | null> => {
    return getClientById(id);
  },

  create: async (data: CreateClientRequest): Promise<ClientResponse> => {
    await new Promise(r => setTimeout(r, 500));
    return createClientLocal(data);
  },

  update: async (id: string, data: Partial<CreateClientRequest>) => {
    await new Promise(r => setTimeout(r, 300));
    const clients = getAllClients();
    const idx = clients.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Client not found');
    clients[idx] = { ...clients[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem('es_clients', JSON.stringify(clients));
    return clients[idx];
  },

  delete: async (id: string) => {
    await new Promise(r => setTimeout(r, 300));
    const clients = getAllClients().filter(c => c.id !== id);
    localStorage.setItem('es_clients', JSON.stringify(clients));
    return { success: true };
  },

  getPortfolio: async (id: string) => {
    const deals = JSON.parse(localStorage.getItem('es_deals') || '[]');
    const clientDeals = deals.filter((d: { investments: { clientId: string }[] }) =>
      d.investments.some((i: { clientId: string }) => i.clientId === id),
    );
    return clientDeals;
  },
};
