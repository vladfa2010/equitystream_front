import {
  getAllDeals,
  getDealById,
  createDealLocal,
  updateDealLocal,
  deleteDealLocal,
  getAllMaterials,
  getPriceHistoryForDeal,
  addPriceHistoryLocal,
  updatePriceHistoryLocal,
  deletePriceHistoryLocal,
} from '../localDb';
import type { CreateDealRequest, DealResponse, UpdatePriceRequest, PriceHistoryItem } from '../types';

/** Attach materials to a deal by matching dealId */
function attachMaterials(deal: DealResponse | null): DealResponse | null {
  if (!deal) return null;
  const allMaterials = getAllMaterials();
  deal.materials = allMaterials.filter(m => m.dealId === deal.id);
  return deal;
}

export const dealsApi = {
  getAll: async (params?: { status?: string; search?: string }) => {
    let deals = getAllDeals();
    if (params?.status) deals = deals.filter(d => d.status === params.status);
    if (params?.search) {
      const q = params.search.toLowerCase();
      deals = deals.filter(d => d.companyName.toLowerCase().includes(q) || d.ticker.toLowerCase().includes(q));
    }
    // Attach materials to each deal
    const allMaterials = getAllMaterials();
    deals.forEach(d => { d.materials = allMaterials.filter(m => m.dealId === d.id); });
    return deals;
  },

  getById: async (id: string): Promise<DealResponse | null> => {
    const deal = getDealById(id);
    return attachMaterials(deal);
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

  /* ─── Price History ─── */
  getPriceHistory: async (dealId: string): Promise<PriceHistoryItem[]> => {
    await new Promise(r => setTimeout(r, 200));
    return getPriceHistoryForDeal(dealId);
  },

  addPriceHistory: async (dealId: string, data: { price: number; changedByAdmin: string; sourceUrl?: string | null }): Promise<PriceHistoryItem> => {
    await new Promise(r => setTimeout(r, 400));
    return addPriceHistoryLocal(dealId, data.price, data.changedByAdmin, data.sourceUrl ?? null);
  },

  updatePriceHistory: async (priceId: string, data: { price: number; changedByAdmin: string; sourceUrl?: string | null }): Promise<PriceHistoryItem | null> => {
    await new Promise(r => setTimeout(r, 300));
    return updatePriceHistoryLocal(priceId, data.price, data.changedByAdmin, data.sourceUrl ?? null);
  },

  deletePriceHistory: async (priceId: string): Promise<{ success: boolean }> => {
    await new Promise(r => setTimeout(r, 200));
    deletePriceHistoryLocal(priceId);
    return { success: true };
  },
};
