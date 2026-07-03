// ============================================================
// LOCAL STORAGE DB — Demo-mode database in the browser
// Stores deals, clients, materials in localStorage
// Works without backend. Switch to API by changing DB_MODE.
// ============================================================

import type {
  DealResponse,
  ClientResponse,
  MaterialResponse,
  CreateDealRequest,
  CreateClientRequest,
  CreateMaterialRequest,
  ClientAllocationRequest,
} from './types';

const DB_KEYS = {
  deals: 'es_deals',
  clients: 'es_clients',
  materials: 'es_materials',
  priceHistory: 'es_price_history',
  initialized: 'es_db_initialized',
};

// ---- Storage helpers ----
function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Seed data ----
const SEED_CLIENTS: ClientResponse[] = [
  { id: 'c1', fullName: 'Alexei Volkov', name: 'Alexei Volkov', nickname: 'alexei_v', dateOfBirth: '1985-03-15', role: 'client', email: 'alexei@example.com', phone: '+7-999-123-4567', telegram: '@alexei_v', notes: 'VIP client', contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 187500, totalPnl: 46500, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c2', fullName: 'Maria Petrova', name: 'Maria Petrova', nickname: 'maria_p', dateOfBirth: '1990-07-22', role: 'client', email: 'maria@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 142000, totalPnl: 31200, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c3', fullName: 'Dmitri Sokolov', name: 'Dmitri Sokolov', nickname: 'dmitri_s', dateOfBirth: '1988-11-08', role: 'client', email: 'dmitri@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 95000, totalPnl: 16150, createdAt: '2024-02-20T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c4', fullName: 'Elena Kuznetsova', name: 'Elena Kuznetsova', nickname: 'elena_k', dateOfBirth: '1982-05-30', role: 'client', email: 'elena@example.com', phone: null, telegram: '@elena_k', notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 210000, totalPnl: 33600, createdAt: '2023-11-10T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c5', fullName: 'Ivan Smirnov', name: 'Ivan Smirnov', nickname: 'ivan_s', dateOfBirth: '1992-01-12', role: 'client', email: 'ivan@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 78000, totalPnl: 8580, createdAt: '2024-03-05T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c6', fullName: 'Olga Novikova', name: 'Olga Novikova', nickname: 'olga_n', dateOfBirth: '1987-09-18', role: 'client', email: 'olga@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 125000, totalPnl: -3750, createdAt: '2024-01-28T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c7', fullName: 'Sergei Morozov', name: 'Sergei Morozov', nickname: 'sergei_m', dateOfBirth: '1979-04-25', role: 'client', email: 'sergei@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 56000, totalPnl: -2240, createdAt: '2024-03-12T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c8', fullName: 'Anna Lebedeva', name: 'Anna Lebedeva', nickname: 'anna_l', dateOfBirth: '1991-12-03', role: 'client', email: 'anna@example.com', phone: null, telegram: '@anna_l', notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 168000, totalPnl: 20160, createdAt: '2023-12-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c9', fullName: 'Pavel Kozlov', name: 'Pavel Kozlov', nickname: 'pavel_k', dateOfBirth: '1984-08-14', role: 'client', email: 'pavel@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 89000, totalPnl: 9780, createdAt: '2024-02-15T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
  { id: 'c10', fullName: 'Yulia Fedorova', name: 'Yulia Fedorova', nickname: 'yulia_f', dateOfBirth: '1989-06-20', role: 'client', email: 'yulia@example.com', phone: null, telegram: null, notes: null, contractUrl: null, avatarUrl: null, idDocumentUrl: null, status: 'active', totalInvested: 134000, totalPnl: 16080, createdAt: '2023-11-20T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z' },
];

const SEED_DEALS: DealResponse[] = [
  {
    id: 'd1',
    companyName: 'Apple Inc.',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    sector: 'Technology',
    description: 'Consumer electronics and software',
    totalPackageAmount: 500000,
    entryPrice: 175.20,
    currentPrice: 198.45,
    shareQuantity: 2853.88,
    marketCap: 3000000000000,
    website: 'https://apple.com',
    founder: 'Steve Jobs, Steve Wozniak',
    logoUrl: null,
    managementFeePercent: 2,
    targetPrice: 220,
    timeHorizon: '2025-12-31',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
    investments: [
      { id: 'i1', dealId: 'd1', clientId: 'c1', clientName: 'Alexei Volkov', clientAvatar: null, amount: 45000, entryPrice: 175.20, shareCount: 256.85, isLead: true, customEntryPrice: null, createdAt: '2025-05-15T10:00:00Z' },
      { id: 'i2', dealId: 'd1', clientId: 'c2', clientName: 'Maria Petrova', clientAvatar: null, amount: 38000, entryPrice: 175.20, shareCount: 216.89, isLead: false, customEntryPrice: null, createdAt: '2025-05-15T10:00:00Z' },
      { id: 'i3', dealId: 'd1', clientId: 'c3', clientName: 'Dmitri Sokolov', clientAvatar: null, amount: 25000, entryPrice: 175.20, shareCount: 142.69, isLead: false, customEntryPrice: null, createdAt: '2025-05-15T10:00:00Z' },
    ],
    priceHistory: [],
    materials: [],
  },
  {
    id: 'd2',
    companyName: 'NVIDIA Corporation',
    ticker: 'NVDA',
    exchange: 'NASDAQ',
    sector: 'Technology',
    description: 'GPUs and AI chips',
    totalPackageAmount: 750000,
    entryPrice: 720.50,
    currentPrice: 875.40,
    shareQuantity: 1040.94,
    marketCap: 2100000000000,
    website: 'https://nvidia.com',
    founder: 'Jensen Huang',
    logoUrl: null,
    managementFeePercent: 2.5,
    targetPrice: 950,
    timeHorizon: '2025-09-30',
    status: 'active',
    createdBy: 'admin',
    createdAt: '2025-04-20T14:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
    investments: [
      { id: 'i4', dealId: 'd2', clientId: 'c1', clientName: 'Alexei Volkov', clientAvatar: null, amount: 55000, entryPrice: 720.50, shareCount: 76.34, isLead: true, customEntryPrice: 700, createdAt: '2025-04-20T14:00:00Z' },
      { id: 'i5', dealId: 'd2', clientId: 'c4', clientName: 'Elena Kuznetsova', clientAvatar: null, amount: 72000, entryPrice: 720.50, shareCount: 99.93, isLead: false, customEntryPrice: null, createdAt: '2025-04-20T14:00:00Z' },
    ],
    priceHistory: [],
    materials: [],
  },
];

// ---- Initialize ----
export function initLocalDb(): void {
  if (get<boolean>(DB_KEYS.initialized)) return;

  set(DB_KEYS.clients, SEED_CLIENTS);
  set(DB_KEYS.deals, SEED_DEALS);
  set(DB_KEYS.materials, []);
  set(DB_KEYS.priceHistory, []);
  set(DB_KEYS.initialized, true);
}

// ---- Deals ----
export function getAllDeals(): DealResponse[] {
  initLocalDb();
  return get<DealResponse[]>(DB_KEYS.deals) || [];
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
    status: data.status || 'active',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    investments: (data.clients || []).map((c: ClientAllocationRequest, idx: number) => {
      const client = clients.find(cl => cl.id === c.clientId);
      const entryPrice = c.customEntryPrice || data.sharePrice;
      return {
        id: `i_${Date.now()}_${idx}`,
        dealId: `d_${Date.now()}`,
        clientId: c.clientId,
        clientName: client?.name || 'Unknown',
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
      createdAt: new Date().toISOString(),
    }],
    materials: [],
  };

  // Save
  set(DB_KEYS.deals, [...deals, newDeal]);

  // Update client totalInvested
  for (const alloc of data.clients || []) {
    const clientIndex = clients.findIndex(c => c.id === alloc.clientId);
    if (clientIndex >= 0) {
      clients[clientIndex].totalInvested += alloc.amount;
    }
  }
  set(DB_KEYS.clients, clients);

  return newDeal;
}

export function updateDealPriceLocal(dealId: string, newPrice: number): DealResponse | null {
  const deals = getAllDeals();
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return null;

  deal.currentPrice = newPrice;
  deal.updatedAt = new Date().toISOString();
  deal.priceHistory.push({
    id: `ph_${Date.now()}`,
    dealId,
    price: newPrice,
    changedBy: 'admin',
    createdAt: new Date().toISOString(),
  });

  set(DB_KEYS.deals, deals);
  return deal;
}

// ---- Clients ----
export function getAllClients(): ClientResponse[] {
  initLocalDb();
  return get<ClientResponse[]>(DB_KEYS.clients) || [];
}

export function getClientById(id: string): ClientResponse | null {
  const clients = getAllClients();
  return clients.find(c => c.id === id) || null;
}

export function createClientLocal(data: CreateClientRequest): ClientResponse {
  const clients = getAllClients();
  const telegram = data.telegram
    ? data.telegram.startsWith('@')
      ? data.telegram
      : `@${data.telegram}`
    : null;
  const newClient: ClientResponse = {
    id: `c_${Date.now()}`,
    fullName: data.fullName,
    name: data.fullName,
    nickname: data.nickname,
    dateOfBirth: data.dateOfBirth || null,
    role: data.role,
    email: data.email,
    phone: data.phone || null,
    telegram,
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
  set(DB_KEYS.clients, [...clients, newClient]);
  return newClient;
}

// ---- Materials ----
export function getAllMaterials(): MaterialResponse[] {
  initLocalDb();
  return get<MaterialResponse[]>(DB_KEYS.materials) || [];
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
  set(DB_KEYS.materials, [...materials, newMaterial]);
  return newMaterial;
}

// ---- Reset ----
export function resetLocalDb(): void {
  Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
  initLocalDb();
}
