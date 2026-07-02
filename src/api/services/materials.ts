import apiClient from '../client';
import type { MaterialResponse, CreateMaterialRequest } from '../types';

export const materialsApi = {
  getAll: (params?: { type?: string; dealId?: string; search?: string }) =>
    apiClient.get('/materials', { params }),
  create: (data: CreateMaterialRequest) => apiClient.post<MaterialResponse>('/materials', data),
  delete: (id: string) => apiClient.delete(`/materials/${id}`),
  attachToDeal: (materialId: string, dealId: string) =>
    apiClient.post(`/materials/${materialId}/attach`, { dealId }),
};
