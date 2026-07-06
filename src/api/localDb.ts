// ============================================================
// LOCAL STORAGE DB — Bulletproof demo-mode database
// NEVER loses user data. Backup + restore + defensive checks.
// ============================================================

import type {
  DealResponse,
  ClientResponse,
  MaterialResponse,
  PriceHistoryItem,
  CreateDealRequest,
  CreateClientRequest,
  CreateMaterialRequest,
} from './types';

const DB_KEYS = {
  deals: 'es_deals',
  clients: 'es_clients',
  materials: 'es_materials',
  priceHistory: 'es_price_history',
};

const BACKUP_KEYS = {
  deals: 'es_deals_backup',
  clients: 'es_clients_backup',
  priceHistory: 'es_price_history_backup',
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

const SEED_CLIENTS: ClientResponse[] = [
  // Default system accounts
  { id: 'c_user', fullName: 'Default User', name: 'Default User', nickname: 'user', dateOfBirth: null, role: 'user', email: 'user@equitystream.com', phone: null, telegram: null, notes: 'Default user account. Password: user', contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 0, totalPnl: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c_admin', fullName: 'Default Admin', name: 'Default Admin', nickname: 'admin', dateOfBirth: null, role: 'admin', email: 'admin@equitystream.com', phone: null, telegram: null, notes: 'Default admin account. Password: admin', contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 0, totalPnl: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c_superadmin', fullName: 'Default Superadmin', name: 'Default Superadmin', nickname: 'superadmin', dateOfBirth: null, role: 'superadmin', email: 'superadmin@equitystream.com', phone: null, telegram: null, notes: 'Default superadmin account. Password: superadmin', contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 0, totalPnl: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  // Demo clients
  { id: 'c1', fullName: 'Alexei Volkov', name: 'Alexei Volkov', nickname: 'alexei_v', dateOfBirth: '1985-03-15', role: 'user', email: 'alexei@example.com', phone: '+7-999-123-4567', telegram: '@alexei_v', notes: 'VIP client', contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 187500, totalPnl: 46500, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c2', fullName: 'Maria Petrova', name: 'Maria Petrova', nickname: 'maria_p', dateOfBirth: '1990-07-22', role: 'user', email: 'maria@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 142000, totalPnl: 31200, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c3', fullName: 'Dmitri Sokolov', name: 'Dmitri Sokolov', nickname: 'dmitri_s', dateOfBirth: '1988-11-08', role: 'user', email: 'dmitri@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 95000, totalPnl: 16150, createdAt: '2024-02-20T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c4', fullName: 'Elena Kuznetsova', name: 'Elena Kuznetsova', nickname: 'elena_k', dateOfBirth: '1982-05-30', role: 'user', email: 'elena@example.com', phone: null, telegram: '@elena_k', notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 210000, totalPnl: 33600, createdAt: '2023-11-10T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c5', fullName: 'Ivan Smirnov', name: 'Ivan Smirnov', nickname: 'ivan_s', dateOfBirth: '1992-01-12', role: 'user', email: 'ivan@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 78000, totalPnl: 8580, createdAt: '2024-03-05T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c6', fullName: 'Olga Novikova', name: 'Olga Novikova', nickname: 'olga_n', dateOfBirth: '1987-09-18', role: 'user', email: 'olga@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 125000, totalPnl: -3750, createdAt: '2024-01-28T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c7', fullName: 'Sergei Morozov', name: 'Sergei Morozov', nickname: 'sergei_m', dateOfBirth: '1979-04-25', role: 'user', email: 'sergei@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 56000, totalPnl: -2240, createdAt: '2024-03-12T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c8', fullName: 'Anna Lebedeva', name: 'Anna Lebedeva', nickname: 'anna_l', dateOfBirth: '1991-12-03', role: 'user', email: 'anna@example.com', phone: null, telegram: '@anna_l', notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 168000, totalPnl: 20160, createdAt: '2023-12-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c9', fullName: 'Pavel Kozlov', name: 'Pavel Kozlov', nickname: 'pavel_k', dateOfBirth: '1984-08-14', role: 'user', email: 'pavel@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 89000, totalPnl: 9780, createdAt: '2024-02-15T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c10', fullName: 'Yulia Fedorova', name: 'Yulia Fedorova', nickname: 'yulia_f', dateOfBirth: '1989-06-20', role: 'user', email: 'yulia@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 134000, totalPnl: 16080, createdAt: '2023-11-20T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
];

const SEED_MATERIALS = [
  { id: 'm1', dealId: 'd1', title: 'AAPL Investor Presentation Q2 2025', type: 'file' as const, url: 'https://example.com/aapl-investor-deck.pdf', fileSize: 4500000, mimeType: 'application/pdf', description: 'Quarterly investor presentation with financial highlights', uploadedBy: 'admin', createdAt: '2025-05-20T10:00:00Z' },
  { id: 'm2', dealId: 'd1', title: 'Apple Annual Report 2024', type: 'file' as const, url: 'https://example.com/aapl-annual-report.pdf', fileSize: 8200000, mimeType: 'application/pdf', description: 'Full annual report with audited financials', uploadedBy: 'admin', createdAt: '2025-05-22T14:00:00Z' },
  { id: 'm3', dealId: 'd1', title: 'AAPL Price Target Analysis', type: 'link' as const, url: 'https://finance.yahoo.com/quote/AAPL', fileSize: null, mimeType: null, description: 'Yahoo Finance AAPL page with latest price data', uploadedBy: 'admin', createdAt: '2025-05-25T09:00:00Z' },
  { id: 'm4', dealId: 'd2', title: 'Databricks Valuation Model', type: 'file' as const, url: 'https://example.com/databricks-valuation.xlsx', fileSize: 1200000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'DCF valuation model with sensitivity analysis', uploadedBy: 'admin', createdAt: '2025-05-18T11:00:00Z' },
  { id: 'm5', dealId: 'd2', title: 'Databricks IPO Prospectus', type: 'file' as const, url: 'https://example.com/databricks-s1.pdf', fileSize: 15000000, mimeType: 'application/pdf', description: 'S-1 filing with SEC disclosure', uploadedBy: 'admin', createdAt: '2025-05-28T16:00:00Z' },
  { id: 'm6', dealId: 'd2', title: 'Latest Databricks News', type: 'link' as const, url: 'https://www.reuters.com/technology/databricks', fileSize: null, mimeType: null, description: 'Reuters technology coverage', uploadedBy: 'admin', createdAt: '2025-06-01T08:00:00Z' },
];

const SEED_DEALS: DealResponse[] = [
  {
    id: 'd1', companyName: 'Apple Inc.', ticker: 'AAPL', exchange: 'NASDAQ', sector: 'Technology',
    description: 'Consumer electronics and software', totalPackageAmount: 500000, entryPrice: 175.20,
    currentPrice: 198.45, shareQuantity: 2853.88, marketCap: 3000000000000, website: 'https://apple.com',
    founder: 'Steve Jobs, Steve Wozniak', logoUrl: null, managementFeePercent: 2, targetPrice: 220,
    timeHorizon: '2025-12-31', status: 'Founding', createdBy: 'admin',
    createdAt: '2025-05-15T10:00:00Z', updatedAt: '2025-06-01T10:00:00Z',
    investments: [
      { id: 'i1', dealId: 'd1', clientId: 'c1', clientName: 'Alexei Volkov', clientAvatar: null, amount: 45000, entryPrice: 175.20, shareCount: 256.85, isLead: true, customEntryPrice: null, createdAt: '2025-05-15T10:00:00Z' },
      { id: 'i2', dealId: 'd1', clientId: 'c2', clientName: 'Maria Petrova', clientAvatar: null, amount: 38000, entryPrice: 175.20, shareCount: 216.89, isLead: false, customEntryPrice: null, createdAt: '2025-05-15T10:00:00Z' },
      { id: 'i3', dealId: 'd1', clientId: 'c3', clientName: 'Dmitri Sokolov', clientAvatar: null, amount: 25000, entryPrice: 175.20, shareCount: 142.69, isLead: false, customEntryPrice: null, createdAt: '2025-05-15T10:00:00Z' },
    ],
    priceHistory: [], materials: [],
  },
  {
    id: 'd2', companyName: 'NVIDIA Corporation', ticker: 'NVDA', exchange: 'NASDAQ', sector: 'Technology',
    description: 'GPUs and AI chips', totalPackageAmount: 750000, entryPrice: 720.50,
    currentPrice: 875.40, shareQuantity: 1040.94, marketCap: 2100000000000, website: 'https://nvidia.com',
    founder: 'Jensen Huang', logoUrl: null, managementFeePercent: 2.5, targetPrice: 950,
    timeHorizon: '2025-09-30', status: 'Wait IPO', createdBy: 'admin',
    createdAt: '2025-04-20T14:00:00Z', updatedAt: '2025-06-01T10:00:00Z',
    investments: [
      { id: 'i4', dealId: 'd2', clientId: 'c1', clientName: 'Alexei Volkov', clientAvatar: null, amount: 55000, entryPrice: 720.50, shareCount: 76.34, isLead: true, customEntryPrice: 700, createdAt: '2025-04-20T14:00:00Z' },
      { id: 'i5', dealId: 'd2', clientId: 'c4', clientName: 'Elena Kuznetsova', clientAvatar: null, amount: 72000, entryPrice: 720.50, shareCount: 99.93, isLead: false, customEntryPrice: null, createdAt: '2025-04-20T14:00:00Z' },
    ],
    priceHistory: [], materials: [],
  },
];

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
    managementFeePercent: data.managementFeePercent || 0,
    targetPrice: data.targetPrice || null,
    timeHorizon: data.timeHorizon || null,
    status: data.status || 'Pipeline',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    investments: (data.clients || []).map((c, idx) => {
      const client = clients.find(cl => cl.id === c.clientId);
      const entryPrice = c.customEntryPrice || data.sharePrice;
      return {
        id: `i_${Date.now()}_${idx}`,
        dealId: `d_${Date.now()}`,
        clientId: c.clientId,
        clientName: client?.fullName || client?.name || 'Unknown',
        clientAvatar: null,
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

function normalizeRole(role: string): 'user' | 'admin' | 'superadmin' {
  if (role === 'superadmin') return 'superadmin';
  if (role === 'admin') return 'admin';
  return 'user'; // 'client' or any other → 'user'
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
    fullName: data.fullName,
    name: data.fullName,
    nickname: data.nickname,
    dateOfBirth: data.dateOfBirth || null,
    role: data.role,
    email: data.email,
    phone: data.phone || null,
    telegram: data.telegram ? (data.telegram.startsWith('@') ? data.telegram : `@${data.telegram}`) : null,
    notes: data.notes || null,
    contractUrl: data.contractFile || null,
    avatarUrl: data.avatarFile || null,
    idDocumentUrl: data.idDocumentFile || null,
    status: 'active',
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
