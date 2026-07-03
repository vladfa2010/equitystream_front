import {
  getAllClients,
  getClientById,
  createClientLocal,
  updateClientLocal,
  deleteClientLocal,
} from '../localDb';
import type { ClientResponse, CreateClientRequest } from '../types';

export const clientsApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    let clients = getAllClients();
    if (params?.status) clients = clients.filter(c => c.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      clients = clients.filter(c => (c.fullName || c.name || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
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

  update: async (id: string, data: Record<string, any>) => {
    await new Promise(r => setTimeout(r, 300));
    const client = updateClientLocal(id, data);
    if (!client) throw new Error('Client not found');
    return client;
  },

  delete: async (id: string) => {
    await new Promise(r => setTimeout(r, 300));
    deleteClientLocal(id);
    return { success: true };
  },

  getPortfolio: async (id: string) => {
    const { getAllDeals } = await import('../localDb');
    const deals = getAllDeals().filter((d: any) =>
      d.investments?.some((i: any) => i.clientId === id)
    );
    return deals;
  },
};
