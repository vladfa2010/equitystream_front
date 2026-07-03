import {
  getAllDeals,
  getDealById,
  createDealLocal,
  updateDealLocal,
  deleteDealLocal,
} from '../localDb';
import type { CreateDealRequest, DealResponse, UpdatePriceRequest } from '../types';

export const dealsApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    let deals = getAllDeals();
    if (params?.status) deals = deals.filter(d => d.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      deals = deals.filter(d => d.companyName.toLowerCase().includes(q) || d.ticker.toLowerCase().includes(q));
    }
    return deals;
  },

  getById: async (id: string): Promise<DealResponse | null> => {
    return getDealById(id);
  },

  create: async (data: CreateDealRequest): Promise<DealResponse> => {
    await new Promise(r => setTimeout(r, 800));
    return createDealLocal(data);
  },

  update: async (id: string, data: Record<string, any>) => {
    await new Promise(r => setTimeout(r, 300));
    const deal = updateDealLocal(id, data);
    if (!deal) throw new Error('Deal not found');
    return deal;
  },

  updatePrice: async (id: string, data: UpdatePriceRequest) => {
    await new Promise(r => setTimeout(r, 300));
    const deal = updateDealLocal(id, { currentPrice: data.price });
    if (!deal) throw new Error('Deal not found');
    return deal;
  },

  delete: async (id: string) => {
    await new Promise(r => setTimeout(r, 300));
    deleteDealLocal(id);
    return { success: true };
  },

  addInvestment: async (dealId: string, data: { clientId: string; amount: number; isLead?: boolean }) => {
    await new Promise(r => setTimeout(r, 300));
    const deal = getDealById(dealId);
    if (!deal) throw new Error('Deal not found');
    const entryPrice = deal.entryPrice;
    const newInv = {
      id: `i_${Date.now()}`,
      dealId,
      clientId: data.clientId,
      clientName: '',
      clientAvatar: null,
      amount: data.amount,
      entryPrice,
      shareCount: data.amount / entryPrice,
      isLead: data.isLead || false,
      customEntryPrice: null,
      createdAt: new Date().toISOString(),
    };
    updateDealLocal(dealId, {
      investments: [...(deal.investments || []), newInv],
    });
    return { success: true };
  },

  removeInvestment: async (dealId: string, investmentId: string) => {
    await new Promise(r => setTimeout(r, 200));
    const deal = getDealById(dealId);
    if (!deal) throw new Error('Deal not found');
    updateDealLocal(dealId, {
      investments: (deal.investments || []).filter((i: any) => i.id !== investmentId),
    });
    return { success: true };
  },
};
