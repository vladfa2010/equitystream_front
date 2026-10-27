import type { ClientResponse, CreateClientRequest } from '../types';
import { apiFetch, extractErrorMessage } from '../http';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await apiFetch(endpoint, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(extractErrorMessage(err, res.status));
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

// ТЗ-13 Задача 3: агрегатный дашборд текущего пользователя
export interface MyDashboardInvestment {
  amount: number;
  entryPrice: number;
  shareCount: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  isLead: boolean;
}

export interface MyDashboardDeal {
  dealId: string;
  companyName: string;
  ticker: string;
  status: string;
  pipelineStatus: string;
  currentPrice: number;
  dealDate: string | null;
  // ТЗ-15: поля локапа для карточек кабинета (вычисляемые сервером)
  ipoDate: string | null;
  lockupMonths: number | null;
  lockupEndDate: string | null;
  lockupDaysRemaining: number | null;
  lockupExpired: boolean;
  myInvestment: MyDashboardInvestment;
}

export interface MyDashboardDocument {
  id: string;
  dealId: string;
  companyName: string;
  title: string;
  type: string;
  url: string;
  description: string | null;
  createdAt: string;
}

export interface MyDashboard {
  profile: { id: string; name: string; email: string; status: string };
  totals: {
    totalInvested: number;
    portfolioValue: number;
    totalPnl: number;
    totalPnlPercent: number;
    // ТЗ-16: свободные средства (выходы из сделок)
    availableBalance: number;
  };
  deals: MyDashboardDeal[];
  documents: MyDashboardDocument[];
  // ТЗ-17: последние операции со свободными средствами (5)
  recentBalanceOperations?: BalanceOperationItem[];
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

  // ТЗ-13 Задача 3/4: агрегатный дашборд текущего пользователя
  // (идентичность — из session-cookie, id не передаётся)
  getMyDashboard: async (): Promise<MyDashboard> => {
    const res = await fetchWithAuth('/users/me/dashboard');
    return unwrap<MyDashboard>(res);
  },

  // ТЗ-17: ручные операции со свободными средствами (только admin)
  createBalanceOperation: async (
    clientId: string,
    payload: CreateBalanceOperationPayload,
  ): Promise<BalanceOperationItem> => {
    const res = await fetchWithAuth(`/users/clients/${clientId}/balance-operations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return unwrap<BalanceOperationItem>(res);
  },

  getBalanceSummary: async (clientId: string): Promise<BalanceSummary> => {
    const res = await fetchWithAuth(`/users/clients/${clientId}/balance-summary`);
    return unwrap<BalanceSummary>(res);
  },

  getBalanceOperations: async (
    clientId: string,
    params?: { page?: number; limit?: number },
  ): Promise<BalanceOperationList> => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await fetchWithAuth(`/users/clients/${clientId}/balance-operations?${q}`);
    return unwrap<BalanceOperationList>(res);
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

// ТЗ-17: операции со свободными средствами (ledger)
export type BalanceOperationType =
  | 'deposit'
  | 'withdrawal'
  | 'investment'
  | 'investment_refund'
  | 'exit_credit';

export interface BalanceOperationItem {
  id: string;
  type: BalanceOperationType;
  amount: number;
  balanceAfter: number;
  note: string;
  dealId: string | null;
  investmentId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface BalanceOperationList {
  data: BalanceOperationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BalanceSummary {
  totals: {
    deposited: number;
    withdrawn: number;
    invested: number;
    refunded: number;
    exits: number;
    availableBalance: number;
  };
  byDeal: Array<{
    dealId: string;
    ticker: string;
    companyName: string;
    invested: number;
    refunded: number;
    exits: number;
  }>;
}

export interface CreateBalanceOperationPayload {
  type: 'deposit' | 'withdrawal';
  amount: number;
  note: string;
  requestId: string;
}
