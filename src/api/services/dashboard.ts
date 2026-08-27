import type { AdminDashboardResponse, ActivityItem, DealSummary } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

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
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function unwrap<T>(res: any): T {
  if (res && res.data !== undefined) return res.data as T;
  return res as T;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

interface BackendAdminDashboard {
  metrics: {
    totalAum: number;
    totalDeals: number;
    activeDeals: number;
    totalClients: number;
    activeClients: number;
    totalPnl: number;
    avgReturn: number;
    materialsCount: number;
  };
  recentActivity: {
    recentDeals: Array<{
      id: string;
      companyName: string;
      ticker: string;
      status: string;
      currentPrice: number;
      createdAt: string;
    }>;
    recentPriceChanges: Array<{
      id: string;
      dealId: string;
      dealName: string;
      ticker: string;
      price: number;
      createdAt: string;
    }>;
    recentClients: Array<{
      id: string;
      name: string;
      email: string;
      status: string;
      totalInvested: number;
      totalPnl: number;
      createdAt: string;
    }>;
    recentMaterials: Array<{
      id: string;
      title: string;
      type: string;
      dealId: string | null;
      dealName: string | null;
      createdAt: string;
    }>;
  };
  chartData: {
    aumBySector: Array<{ sector: string; amount: number }>;
    clientGrowth: Array<{ month: string; count: number }>;
    pnlByDeal: Array<{
      dealId: string;
      companyName: string;
      ticker: string;
      pnl: number;
      pnlPercent: number;
    }>;
    sectorDistribution: Array<{ sector: string; count: number }>;
  };
}

function toActivityItem(raw: any, type: string, index: number): ActivityItem {
  let title = raw.title || '';
  let detail = raw.detail || '';

  if (type === 'deal_created') {
    title = `Deal "${raw.companyName}" — ${raw.status}`;
    detail = `${raw.ticker} — ${formatCurrency(raw.currentPrice || 0)}`;
  } else if (type === 'price_change') {
    title = `${raw.dealName || 'Deal'} price updated`;
    detail = `${raw.ticker || 'N/A'} — ${formatCurrency(raw.price || 0)}`;
  } else if (type === 'client_joined') {
    title = `Client ${raw.name} joined`;
    detail = `${raw.email} — ${raw.status}`;
  } else if (type === 'material_uploaded') {
    title = `Material "${raw.title}"`;
    detail = raw.dealName || 'General';
  }

  return {
    id: raw.id ? `${type}_${raw.id}` : `${type}_${index}`,
    type,
    title,
    detail,
    timestamp: raw.createdAt || new Date().toISOString(),
  };
}

export const dashboardApi = {
  getAdmin: async (): Promise<AdminDashboardResponse> => {
    const res = await fetchWithAuth('/dashboard/admin');
    const data = unwrap<BackendAdminDashboard>(res);

    const { metrics, recentActivity } = data;

    const activities: ActivityItem[] = [
      ...(recentActivity?.recentDeals || []).map((d, i) => toActivityItem(d, 'deal_created', i)),
      ...(recentActivity?.recentPriceChanges || []).map((p, i) => toActivityItem(p, 'price_change', i)),
      ...(recentActivity?.recentClients || []).map((c, i) => toActivityItem(c, 'client_joined', i)),
      ...(recentActivity?.recentMaterials || []).map((m, i) => toActivityItem(m, 'material_uploaded', i)),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    const recentDeals: DealSummary[] = (recentActivity?.recentDeals || []).map((d) => ({
      id: d.id,
      companyName: d.companyName,
      ticker: d.ticker,
      status: d.status,
      totalPackageAmount: 0,
      allocatedAmount: 0,
      currentValue: 0,
      currentPrice: d.currentPrice,
      clientCount: 0,
      createdAt: d.createdAt,
    }));

    return {
      totalAum: metrics?.totalAum || 0,
      activeDealCount: metrics?.activeDeals || 0,
      totalClients: metrics?.totalClients || 0,
      avgReturn: metrics?.avgReturn || 0,
      recentDeals,
      recentActivity: activities,
    };
  },

  getClient: async () => {
    const res = await fetchWithAuth('/dashboard/client');
    return unwrap(res);
  },
};
