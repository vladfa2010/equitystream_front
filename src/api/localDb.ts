// ============================================================
// LOCAL STORAGE DB — Bulletproof demo-mode database
// NEVER loses user data. Backup + restore + defensive checks.
// ============================================================

import type {
  DealResponse,
  ClientResponse,
  MaterialResponse,
  PriceHistoryItem,
  Reservation,
  CreateReservationRequest,
  Order,
  CreateOrderRequest,
  CreateDealRequest,
  CreateClientRequest,
  CreateMaterialRequest,
} from './types';

const DB_KEYS = {
  deals: 'es_deals_v2',
  clients: 'es_clients_v2',
  materials: 'es_materials_v2',
  priceHistory: 'es_price_history_v2',
  reservations: 'es_reservations_v2',
  orders: 'es_orders_v2',
};

const BACKUP_KEYS = {
  deals: 'es_deals_backup_v2',
  clients: 'es_clients_backup_v2',
  priceHistory: 'es_price_history_backup_v2',
  reservations: 'es_reservations_backup_v2',
  orders: 'es_orders_backup_v2',
};

/* ═══════════════════════════════════════════
   LOW-LEVEL STORAGE — never call directly
   ═══════════════════════════════════════════ */

function _get<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function _set<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* quota exceeded — ignore */ }
}

function _countItems(key: string): number {
  const val = _get<any[]>(key);
  return val ? val.length : 0;
}

/* ═══════════════════════════════════════════
   BACKUP / RESTORE
   ═══════════════════════════════════════════ */

function _backup(): void {
  for (const [k, v] of Object.entries(DB_KEYS)) {
    const data = localStorage.getItem(v);
    if (data && data !== '[]' && data !== 'null') {
      const backupKey = BACKUP_KEYS[k as keyof typeof BACKUP_KEYS];
      if (backupKey) localStorage.setItem(backupKey, data);
    }
  }
}

function _restore(): void {
  for (const [k, v] of Object.entries(DB_KEYS)) {
    const backupKey = BACKUP_KEYS[k as keyof typeof BACKUP_KEYS];
    if (!backupKey) continue;
    const current = localStorage.getItem(v);
    const backup = localStorage.getItem(backupKey);
    if ((!current || current === '[]') && backup && backup !== '[]') {
      localStorage.setItem(v, backup);
    }
  }
}

/* ═══════════════════════════════════════════
   SEED DATA (only for first visit)
   ═══════════════════════════════════════════ */

const SEED_CLIENTS: ClientResponse[] = [];
const SEED_MATERIALS: any[] = [];
const SEED_DEALS: DealResponse[] = [];

/* ═══════════════════════════════════════════
   INIT — called once on app start
   ═══════════════════════════════════════════ */

let _initialized = false;

export function initLocalDb(): void {
  if (_initialized) return;
  _initialized = true;

  // Try restore from backup first
  _restore();

  // Check if user data already exists
  const hasDeals = _countItems(DB_KEYS.deals) > 0;
  const hasClients = _countItems(DB_KEYS.clients) > 0;

  if (hasDeals || hasClients) {
    // User data exists — NEVER overwrite, just backup
    _backup();
    return;
  }

  // First visit — seed demo data
  _set(DB_KEYS.clients, SEED_CLIENTS);
  _set(DB_KEYS.deals, SEED_DEALS);
  _set(DB_KEYS.materials, SEED_MATERIALS);
  _set(DB_KEYS.priceHistory, []);
  _set(DB_KEYS.reservations, []);
  _set(DB_KEYS.orders, []);
  _backup();
}

/* ═══════════════════════════════════════════
   PUBLIC API — Deals
   ═══════════════════════════════════════════ */

export function getAllDeals(): DealResponse[] {
  initLocalDb();
  return _get<DealResponse[]>(DB_KEYS.deals) || [];
}

export function getDealById(id: string): DealResponse | null {
  const deals = getAllDeals();
  return deals.find(d => d.id === id) || null;
}

export function createDealLocal(data: CreateDealRequest): DealResponse {
  const deals = getAllDeals();
  const clients = getAllClients();

  const newDeal: DealResponse = {
    id: `d_${Date.now()}`,
    companyName: data.companyName,
    ticker: data.ticker.toUpperCase(),
    exchange: data.exchange,
    sector: data.sector || '',
    description: data.description || null,
    totalPackageAmount: data.totalVolume,
    entryPrice: data.sharePrice,
    currentPrice: data.sharePrice,
    shareQuantity: data.totalVolume / data.sharePrice,
    marketCap: data.marketCap || null,
    website: data.website || null,
    founder: data.founder || null,
    logoUrl: data.logoUrl || null,
    managementFeePercent: data.managementFeePercent || null,
    targetPrice: data.targetPrice || null,
    timeHorizon: data.timeHorizon || null,
    status: data.status === 'draft' ? 'pending' : data.status === 'Exit' ? 'closed' : 'active',
    pipelineStatus: data.status || 'Pipeline',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    investments: (data.clients || []).map((c, idx) => {
      const client = clients.find(cl => cl.id === c.clientId);
      const entryPrice = c.customEntryPrice || data.sharePrice;
      return {
        id: `i_${Date.now()}_${idx}`,
        dealId: `d_${Date.now()}`,
        userId: c.clientId,
        userName: client?.name || 'Unknown',
        userAvatar: null,
        amount: c.amount,
        entryPrice,
        shareCount: c.amount / entryPrice,
        isLead: c.isLead || false,
        customEntryPrice: c.customEntryPrice || null,
        createdAt: new Date().toISOString(),
      };
    }),
    priceHistory: [{
      id: `ph_${Date.now()}`,
      dealId: `d_${Date.now()}`,
      price: data.sharePrice,
      changedBy: 'admin',
      changedByAdmin: 'System',
      sourceUrl: null,
      createdAt: new Date().toISOString(),
    }],
    materials: [],
  };

  const updated = [...deals, newDeal];
  _set(DB_KEYS.deals, updated);

  // Save initial price history entry to separate collection
  const allPriceHistory = _get<PriceHistoryItem[]>(DB_KEYS.priceHistory) || [];
  _set(DB_KEYS.priceHistory, [...allPriceHistory, newDeal.priceHistory[0]]);

  _backup();
  return newDeal;
}

export function updateDealLocal(id: string, patch: Partial<DealResponse>): DealResponse | null {
  const deals = getAllDeals();
  const idx = deals.findIndex(d => d.id === id);
  if (idx === -1) return null;
  deals[idx] = { ...deals[idx], ...patch, updatedAt: new Date().toISOString() };
  _set(DB_KEYS.deals, deals);
  _backup();
  return deals[idx];
}

export function deleteDealLocal(id: string): boolean {
  const deals = getAllDeals().filter(d => d.id !== id);
  _set(DB_KEYS.deals, deals);
  _backup();
  return true;
}

/* ═══════════════════════════════════════════
   ROLE MAPPING — backward compatibility
   ═══════════════════════════════════════════ */

function normalizeRole(role: string): 'admin' | 'client' {
  if (role === 'admin') return 'admin';
  return 'client'; // 'user' or any other → 'client'
}

function normalizeClient(client: any): ClientResponse {
  return {
    ...client,
    role: normalizeRole(client.role),
  };
}

/* ═══════════════════════════════════════════
   PUBLIC API — Clients
   ═══════════════════════════════════════════ */

export function getAllClients(): ClientResponse[] {
  initLocalDb();
  const clients = _get<ClientResponse[]>(DB_KEYS.clients) || [];
  return clients.map(normalizeClient);
}

export function getClientById(id: string): ClientResponse | null {
  return getAllClients().find(c => c.id === id) || null;
}

export function createClientLocal(data: CreateClientRequest): ClientResponse {
  const clients = getAllClients();
  const newClient: ClientResponse = {
    id: `c_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: 'client',
    avatarUrl: data.avatarUrl || null,
    phone: data.phone || null,
    notes: data.notes || null,
    status: data.status || 'active',
    totalInvested: 0,
    totalPnl: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  _set(DB_KEYS.clients, [...clients, newClient]);
  _backup();
  return newClient;
}

export function updateClientLocal(id: string, patch: Partial<ClientResponse>): ClientResponse | null {
  const clients = getAllClients();
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  clients[idx] = { ...clients[idx], ...patch, updatedAt: new Date().toISOString() };
  _set(DB_KEYS.clients, clients);
  _backup();
  return clients[idx];
}

export function deleteClientLocal(id: string): boolean {
  const clients = getAllClients().filter(c => c.id !== id);
  _set(DB_KEYS.clients, clients);
  _backup();
  return true;
}

/* ═══════════════════════════════════════════
   PUBLIC API — Materials
   ═══════════════════════════════════════════ */

export function getAllMaterials(): MaterialResponse[] {
  initLocalDb();
  return _get<MaterialResponse[]>(DB_KEYS.materials) || [];
}

export function createMaterialLocal(data: CreateMaterialRequest): MaterialResponse {
  const materials = getAllMaterials();
  const newMaterial: MaterialResponse = {
    id: `m_${Date.now()}`,
    dealId: data.dealId || null,
    title: data.title,
    type: data.type,
    url: data.url,
    fileSize: null,
    mimeType: null,
    description: data.description || null,
    uploadedBy: 'admin',
    createdAt: new Date().toISOString(),
  };
  _set(DB_KEYS.materials, [...materials, newMaterial]);
  _backup();
  return newMaterial;
}

export function deleteMaterialLocal(id: string): boolean {
  const materials = getAllMaterials().filter(m => m.id !== id);
  _set(DB_KEYS.materials, materials);
  _backup();
  return true;
}

/* ═══════════════════════════════════════════
   PUBLIC API — Price History
   ═══════════════════════════════════════════ */

export function getPriceHistoryForDeal(dealId: string): PriceHistoryItem[] {
  initLocalDb();
  const all = _get<PriceHistoryItem[]>(DB_KEYS.priceHistory) || [];
  return all.filter(p => p.dealId === dealId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addPriceHistoryLocal(dealId: string, price: number, changedByAdmin: string, sourceUrl: string | null): PriceHistoryItem {
  const all = _get<PriceHistoryItem[]>(DB_KEYS.priceHistory) || [];
  const newItem: PriceHistoryItem = {
    id: `ph_${Date.now()}`,
    dealId,
    price,
    changedBy: 'admin',
    changedByAdmin,
    sourceUrl,
    createdAt: new Date().toISOString(),
  };
  _set(DB_KEYS.priceHistory, [...all, newItem]);

  // Also update the deal's currentPrice and priceHistory array
  const deal = getDealById(dealId);
  if (deal) {
    updateDealLocal(dealId, {
      currentPrice: price,
      priceHistory: [...(deal.priceHistory || []), newItem],
    });
  }

  _backup();
  return newItem;
}

export function updatePriceHistoryLocal(priceId: string, price: number, changedByAdmin: string, sourceUrl: string | null): PriceHistoryItem | null {
  const all = _get<PriceHistoryItem[]>(DB_KEYS.priceHistory) || [];
  const idx = all.findIndex(p => p.id === priceId);
  if (idx === -1) return null;

  all[idx] = {
    ...all[idx],
    price,
    changedByAdmin,
    sourceUrl,
    updatedAt: new Date().toISOString(),
  };
  _set(DB_KEYS.priceHistory, all);

  // Also update in deal's priceHistory array
  const dealId = all[idx].dealId;
  const deal = getDealById(dealId);
  if (deal) {
    const dealPriceHistory = (deal.priceHistory || []).map((p: any) =>
      p.id === priceId ? { ...p, price, changedByAdmin, sourceUrl, updatedAt: new Date().toISOString() } : p
    );
    // If this is the latest price, also update currentPrice
    const sorted = [...dealPriceHistory].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latestPrice = sorted.length > 0 ? sorted[0].price : deal.currentPrice;
    updateDealLocal(dealId, {
      currentPrice: latestPrice,
      priceHistory: dealPriceHistory,
    });
  }

  _backup();
  return all[idx];
}

export function deletePriceHistoryLocal(priceId: string): boolean {
  const all = _get<PriceHistoryItem[]>(DB_KEYS.priceHistory) || [];
  const item = all.find(p => p.id === priceId);
  if (!item) return false;

  const filtered = all.filter(p => p.id !== priceId);
  _set(DB_KEYS.priceHistory, filtered);

  // Also update deal's priceHistory array
  const deal = getDealById(item.dealId);
  if (deal) {
    const dealPriceHistory = (deal.priceHistory || []).filter((p: any) => p.id !== priceId);
    // Recalculate currentPrice from remaining history
    const sorted = [...dealPriceHistory].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latestPrice = sorted.length > 0 ? sorted[0].price : deal.entryPrice;
    updateDealLocal(item.dealId, {
      currentPrice: latestPrice,
      priceHistory: dealPriceHistory,
    });
  }

  _backup();
  return true;
}

/* ═══════════════════════════════════════════
   PUBLIC API — Reservations
   ═══════════════════════════════════════════ */

export function getAllReservations(): Reservation[] {
  initLocalDb();
  return _get<Reservation[]>(DB_KEYS.reservations) || [];
}

export function getReservationsForClient(clientId: string): Reservation[] {
  return getAllReservations().filter(r => r.clientId === clientId);
}

export function getPendingReservations(): Reservation[] {
  return getAllReservations().filter(r => r.status === 'pending');
}

export function createReservationLocal(data: CreateReservationRequest): Reservation {
  const all = getAllReservations();
  const newItem: Reservation = {
    id: `res_${Date.now()}`,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  _set(DB_KEYS.reservations, [...all, newItem]);
  _backup();
  return newItem;
}

export function updateReservationStatusLocal(reservationId: string, status: 'approved' | 'rejected'): Reservation | null {
  const all = getAllReservations();
  const idx = all.findIndex(r => r.id === reservationId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
  _set(DB_KEYS.reservations, all);
  _backup();
  return all[idx];
}

export function deleteReservationLocal(reservationId: string): boolean {
  const all = getAllReservations().filter(r => r.id !== reservationId);
  _set(DB_KEYS.reservations, all);
  _backup();
  return true;
}

/* ═══════════════════════════════════════════
   PUBLIC API — Orders (Marketplace)
   ═══════════════════════════════════════════ */

export function getAllOrders(): Order[] {
  initLocalDb();
  return _get<Order[]>(DB_KEYS.orders) || [];
}

export function getOrdersForDeal(dealId: string): Order[] {
  return getAllOrders().filter(o => o.dealId === dealId);
}

export function getOrdersForClient(clientId: string): Order[] {
  return getAllOrders().filter(o => o.clientId === clientId);
}

export function getActiveOrdersForDeal(dealId: string): Order[] {
  return getAllOrders().filter(o => o.dealId === dealId && o.status === 'pending');
}

export function createOrderLocal(data: CreateOrderRequest): Order {
  const all = getAllOrders();
  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  _set(DB_KEYS.orders, [...all, newOrder]);
  _backup();
  return newOrder;
}

export function updateOrderLocal(orderId: string, patch: Partial<Order>): Order | null {
  const all = getAllOrders();
  const idx = all.findIndex(o => o.id === orderId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  _set(DB_KEYS.orders, all);
  _backup();
  return all[idx];
}

export function cancelOrderLocal(orderId: string): Order | null {
  return updateOrderLocal(orderId, { status: 'cancelled' });
}

export function executeOrderLocal(orderId: string): Order | null {
  return updateOrderLocal(orderId, { status: 'executed' });
}

/* ═══════════════════════════════════════════
   RESET — manual only
   ═══════════════════════════════════════════ */

export function resetLocalDb(): void {
  _initialized = false;
  Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  Object.values(BACKUP_KEYS).forEach(k => localStorage.removeItem(k));
}

/* ═══════════════════════════════════════════
   DEBUG — show current state
   ═══════════════════════════════════════════ */

export function debugDbState(): { deals: number; clients: number; materials: number; priceHistory: number; backupDeals: number; backupClients: number; backupPriceHistory: number } {
  return {
    deals: _countItems(DB_KEYS.deals),
    clients: _countItems(DB_KEYS.clients),
    materials: _countItems(DB_KEYS.materials),
    priceHistory: _countItems(DB_KEYS.priceHistory),
    backupDeals: _countItems(BACKUP_KEYS.deals),
    backupClients: _countItems(BACKUP_KEYS.clients),
    backupPriceHistory: _countItems(BACKUP_KEYS.priceHistory),
  };
}
