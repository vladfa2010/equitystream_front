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
    // Total AUM = sum of all client positions at current price
    // For each investment: shares = amount / entryPrice, currentValue = shares * deal.currentPrice
    const totalAum = activeDeals.reduce((sum, deal) => {
      return sum + deal.investments.reduce((dealSum, inv) => {
        const shares = inv.amount / inv.entryPrice;
        return dealSum + shares * deal.currentPrice;
      }, 0);
    }, 0);
    // Avg return weighted by investment amount
    const totalInvestedAll = activeDeals.reduce((s, d) => s + d.investments.reduce((ds, i) => ds + i.amount, 0), 0);
    const totalCurrentAll = totalAum;
    const avgReturn = totalInvestedAll > 0
      ? ((totalCurrentAll - totalInvestedAll) / totalInvestedAll) * 100
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
