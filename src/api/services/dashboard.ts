import { getAllDeals, getAllClients } from '../localDb';
import type { AdminDashboardResponse, DealSummary, ActivityItem } from '../types';

// Statuses that count as "active" (deal is still in progress)
const ACTIVE_STATUSES = ['Pipeline', 'Reserve', 'Founding', 'Deal done', 'Wait IPO'];

export const dashboardApi = {
  getAdmin: async (): Promise<AdminDashboardResponse> => {
    await new Promise(r => setTimeout(r, 300));
    const deals = getAllDeals();
    const clients = getAllClients();

    const activeDeals = deals.filter(d => ACTIVE_STATUSES.includes(d.status));
    const totalAum = activeDeals.reduce((s, d) => s + d.totalPackageAmount, 0);
    const avgReturn = clients.length
      ? clients.reduce((s, c) => s + (c.totalPnl / Math.max(c.totalInvested, 1)) * 100, 0) / clients.length
      : 0;

    const recentDeals: DealSummary[] = deals
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        companyName: d.companyName,
        ticker: d.ticker,
        status: d.status,
        totalPackageAmount: d.totalPackageAmount,
        allocatedAmount: d.investments.reduce((s, i) => s + i.amount, 0),
        currentPrice: d.currentPrice,
        clientCount: d.investments.length,
        createdAt: d.createdAt,
      }));

    const activities: ActivityItem[] = deals.slice(0, 5).map((d, i) => ({
      id: `a_${i}`,
      type: 'deal_created' as const,
      title: `Deal "${d.companyName}" — ${d.status}`,
      detail: `${d.ticker} — $${(d.totalPackageAmount / 1000).toFixed(0)}K package`,
      timestamp: d.createdAt,
    }));

    return {
      totalAum,
      activeDealCount: activeDeals.length,
      totalClients: clients.length,
      avgReturn,
      recentDeals,
      recentActivity: activities,
    };
  },

  getClient: async () => {
    await new Promise(r => setTimeout(r, 300));
    const deals = getAllDeals().filter(d => ACTIVE_STATUSES.includes(d.status));
    const portfolioValue = deals.reduce((s, d) => {
      const ratio = d.currentPrice / d.entryPrice;
      return s + d.totalPackageAmount * ratio;
    }, 0);
    return { portfolioValue, deals };
  },
};
