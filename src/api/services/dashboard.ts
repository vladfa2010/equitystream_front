import apiClient from '../client';
import type { AdminDashboardResponse } from '../types';

export const dashboardApi = {
  getAdmin: () => apiClient.get<AdminDashboardResponse>('/dashboard/admin'),
  getClient: () => apiClient.get('/dashboard/client'),
};
