import type {
  DealResponse,
  CreateDealPayload,
  ClientAllocationRequest,
  Reservation,
  Order,
  CreateReservationRequest,
  CreateOrderRequest,
} from '../types';
import { apiFetch } from '../http';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await apiFetch(endpoint, options);
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

export const dealsApi = {
  getAll: async (params?: { status?: string; clientId?: string }): Promise<DealResponse[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.clientId) query.set('clientId', params.clientId);
    const res = await fetchWithAuth(`/deals?${query}`);
    const unwrapped = unwrap<any>(res);
    return Array.isArray(unwrapped) ? unwrapped : unwrapped?.data || [];
  },

  getById: async (id: string): Promise<DealResponse> => {
    const res = await fetchWithAuth(`/deals/${id}`);
    return unwrap<DealResponse>(res);
  },

  create: async (data: CreateDealPayload): Promise<{ id: string }> => {
    const res = await fetchWithAuth('/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<{ id: string }>(res);
  },

  update: async (id: string, data: Partial<DealResponse>): Promise<DealResponse> => {
    const res = await fetchWithAuth(`/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return unwrap<DealResponse>(res);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetchWithAuth(`/deals/${id}`, {
      method: 'DELETE',
    });
    return unwrap<{ success: boolean }>(res);
  },

  // ─── Investments ───
  addInvestment: async (dealId: string, data: ClientAllocationRequest): Promise<DealResponse> => {
    const res = await fetchWithAuth(`/deals/${dealId}/investments`, {
      method: 'POST',
      body: JSON.stringify({
        userId: data.clientId,
        amount: data.amount,
        isLead: data.isLead,
        customEntryPrice: data.customEntryPrice,
      }),
    });
    return unwrap<DealResponse>(res);
  },

  removeInvestment: async (dealId: string, investmentId: string): Promise<DealResponse> => {
    const res = await fetchWithAuth(`/deals/${dealId}/investments/${investmentId}`, {
      method: 'DELETE',
    });
    return unwrap<DealResponse>(res);
  },

  updateInvestment: async (
    dealId: string,
    investmentId: string,
    data: { amount?: number; isLead?: boolean; customEntryPrice?: number },
  ): Promise<DealResponse> => {
    const res = await fetchWithAuth(`/deals/${dealId}/investments/${investmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return unwrap<DealResponse>(res);
  },

  // ─── Price update ───
  // Updates the deal's current price. The backend records a price history
  // entry, recalculates client P&L, and broadcasts the change via WebSocket.
  updatePrice: async (id: string, newPrice: number, note?: string): Promise<{
    dealId: string;
    newPrice: number;
    previousPrice: number;
    changePercent: number;
    affectedClients: number;
    timestamp: string;
  }> => {
    const res = await fetchWithAuth(`/deals/${id}/price`, {
      method: 'PATCH',
      body: JSON.stringify({ newPrice, note }),
    });
    return unwrap(res);
  },

  // Edits an existing price history record. `price` may be omitted when
  // editing only the note; `note` may be omitted when editing only the price.
  // If the record is the latest for the deal and its price changed, the
  // backend also updates the deal's current price and recalculates P&Ls.
  updatePriceHistory: async (
    priceHistoryId: string,
    data: { price?: number; note?: string },
  ): Promise<{
    id: string;
    dealId: string;
    price: number;
    isLatest: boolean;
  }> => {
    const res = await fetchWithAuth(`/deals/price-history/${priceHistoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  // Deletes a price history record. If the record is the latest for the
  // deal, the backend rolls the deal's current price back to the previous
  // record (or entry price) and recalculates client P&Ls.
  deletePriceHistory: async (priceHistoryId: string): Promise<{
    id: string;
    dealId: string;
    isLatest: boolean;
    newCurrentPrice: number;
  }> => {
    const res = await fetchWithAuth(`/deals/price-history/${priceHistoryId}`, {
      method: 'DELETE',
    });
    return unwrap(res);
  },

  // ─── Reservations ───
  getClientReservations: async (_clientId: string): Promise<Reservation[]> => {
    // TODO: implement reservations endpoint
    return [];
  },

  getPendingReservations: async (): Promise<Reservation[]> => {
    // TODO: implement reservations endpoint
    return [];
  },

  createReservation: async (data: CreateReservationRequest): Promise<Reservation> => {
    const res = await fetchWithAuth('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<Reservation>(res);
  },

  approveReservation: async (_id: string): Promise<Reservation> => {
    // TODO: implement reservations endpoint
    throw new Error('Not implemented');
  },

  rejectReservation: async (_id: string): Promise<Reservation> => {
    // TODO: implement reservations endpoint
    throw new Error('Not implemented');
  },

  // ─── Orders (marketplace) ───
  getDealOrders: async (_dealId: string): Promise<Order[]> => {
    // TODO: implement orders endpoint
    return [];
  },

  getClientOrders: async (_clientId: string): Promise<Order[]> => {
    // TODO: implement orders endpoint
    return [];
  },

  createOrder: async (_data: CreateOrderRequest): Promise<Order> => {
    // TODO: implement orders endpoint
    throw new Error('Not implemented');
  },

  updateOrder: async (_id: string, _data: Partial<Order>): Promise<Order> => {
    // TODO: implement orders endpoint
    throw new Error('Not implemented');
  },

  cancelOrder: async (_id: string): Promise<{ success: boolean }> => {
    // TODO: implement orders endpoint
    throw new Error('Not implemented');
  },
};
