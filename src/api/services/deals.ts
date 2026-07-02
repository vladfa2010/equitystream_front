import apiClient from '../client';
import type { CreateDealRequest, DealResponse, UpdatePriceRequest } from '../types';

export const dealsApi = {
  getAll: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get('/deals', { params }),
  getById: (id: string) => apiClient.get(`/deals/${id}`),
  create: (data: CreateDealRequest) => apiClient.post<DealResponse>('/deals', data),
  update: (id: string, data: Partial<CreateDealRequest>) =>
    apiClient.patch(`/deals/${id}`, data),
  updatePrice: (id: string, data: UpdatePriceRequest) =>
    apiClient.patch(`/deals/${id}/price`, data),
  delete: (id: string) => apiClient.delete(`/deals/${id}`),
  addInvestment: (dealId: string, data: { clientId: string; amount: number; isLead?: boolean }) =>
    apiClient.post(`/deals/${dealId}/investments`, data),
  removeInvestment: (dealId: string, investmentId: string) =>
    apiClient.delete(`/deals/${dealId}/investments/${investmentId}`),
};
