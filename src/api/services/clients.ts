import apiClient from '../client';
import type { ClientResponse, CreateClientRequest } from '../types';

export const clientsApi = {
  getAll: (params?: { status?: string; search?: string }) =>
    apiClient.get('/clients', { params }),
  getById: (id: string) => apiClient.get(`/clients/${id}`),
  create: (data: CreateClientRequest) => apiClient.post<ClientResponse>('/clients', data),
  update: (id: string, data: Partial<CreateClientRequest>) =>
    apiClient.patch(`/clients/${id}`, data),
  delete: (id: string) => apiClient.delete(`/clients/${id}`),
  getPortfolio: (id: string) => apiClient.get(`/clients/${id}/portfolio`),
};
