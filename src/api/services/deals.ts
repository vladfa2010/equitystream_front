import {
  getAllDeals,
  getDealById,
  createDealLocal,
  updateDealPriceLocal,
} from '../localDb';
import type { CreateDealRequest, DealResponse, UpdatePriceRequest } from '../types';

// LocalStorage-based API (demo mode — no backend needed)
export const dealsApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    let deals = getAllDeals();
    if (params?.status) {
      deals = deals.filter(d => d.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      deals = deals.filter(
        d =>
          d.companyName.toLowerCase().includes(q) ||
          d.ticker.toLowerCase().includes(q),
      );
    }
    return deals;
  },

  getById: async (id: string): Promise<DealResponse | null> => {
    return getDealById(id);
  },

  create: async (data: CreateDealRequest): Promise<DealResponse> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    return createDealLocal(data);
  },

  update: async (id: string, data: Partial<CreateDealRequest>) => {
    await new Promise(r => setTimeout(r, 300));
    const deal = getDealById(id);
    if (!deal) throw new Error('Deal not found');
    return { ...deal, ...data, updatedAt: new Date().toISOString() };
  },

  updatePrice: async (id: string, data: UpdatePriceRequest) => {
    await new Promise(r => setTimeout(r, 300));
    const deal = updateDealPriceLocal(id, data.price);
    if (!deal) throw new Error('Deal not found');
    return deal;
  },

  delete: async (id: string) => {
    await new Promise(r => setTimeout(r, 300));
    const deals = getAllDeals().filter(d => d.id !== id);
    localStorage.setItem('es_deals', JSON.stringify(deals));
    return { success: true };
  },
};
