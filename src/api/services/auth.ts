import apiClient from '../client';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', data),
  register: (data: { email: string; password: string; name: string; role: string }) =>
    apiClient.post('/auth/register', data),
  me: () => apiClient.get('/auth/me'),
};
