// ===== AUTH =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  status: 'active' | 'inactive' | 'pending';
  avatarUrl: string | null;
}

// ===== DEALS =====
export interface ClientAllocationRequest {
  clientId: string;
  amount: number;
  isLead?: boolean;
  customEntryPrice?: number;
}

export interface CreateDealRequest {
  companyName: string;
  ticker: string;
  exchange: string;
  sector?: string;
  description?: string;
  totalVolume: number;
  sharePrice: number;
  marketCap?: number;
  website?: string;
  founder?: string;
  logoUrl?: string;
  managementFeePercent?: number;
  targetPrice?: number;
  timeHorizon?: string; // ISO date
  status?: 'draft' | 'Pipeline' | 'Reserve' | 'Founding' | 'Deal done' | 'Wait IPO' | 'Lock-up' | 'Exit';
  clients: ClientAllocationRequest[];
  sendNotifications?: boolean;
}

// Payload actually accepted by POST /api/v1/deals (matches backend CreateDealDto)
export interface CreateDealPayload {
  companyName: string;
  ticker: string;
  exchange: string;
  sector: string;
  totalPackageAmount: number;
  entryPrice: number;
  currentPrice: number;
  status?: 'active' | 'pending' | 'closed';
  pipelineStatus: 'draft' | 'Pipeline' | 'Skip' | 'Reserve' | 'Founding' | 'Deal done' | 'Wait IPO' | 'Lock-up' | 'Exit';
  description?: string;
  marketCap?: number;
  website?: string;
  founder?: string;
  logoUrl?: string;
  managementFeePercent?: number;
  targetPrice?: number;
  timeHorizon?: string;
}

export interface DealResponse {
  id: string;
  companyName: string;
  ticker: string;
  exchange: string;
  sector: string;
  description: string | null;
  totalPackageAmount: number;
  entryPrice: number;
  currentPrice: number;
  shareQuantity: number;
  marketCap: number | null;
  website: string | null;
  founder: string | null;
  logoUrl: string | null;
  managementFeePercent: number | null;
  targetPrice: number | null;
  timeHorizon: string | null;
  status: 'active' | 'pending' | 'closed';
  pipelineStatus: 'draft' | 'Pipeline' | 'Skip' | 'Reserve' | 'Founding' | 'Deal done' | 'Wait IPO' | 'Lock-up' | 'Exit';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  investments: ClientInvestmentResponse[];
  priceHistory: PriceHistoryItem[];
  materials: MaterialResponse[];
}

export interface ClientInvestmentResponse {
  id: string;
  dealId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  amount: number;
  entryPrice: number;
  shareCount: number;
  isLead: boolean;
  customEntryPrice: number | null;
  createdAt: string;
}

export interface PriceHistoryItem {
  id: string;
  dealId: string;
  price: number;
  changedBy: string;        // admin user ID
  changedByAdmin: string;   // admin user display name
  sourceUrl: string | null; // link to price source
  createdAt: string;
  updatedAt?: string;       // set when edited
}

// ===== PRICE HISTORY REQUESTS =====
export interface AddPriceHistoryRequest {
  price: number;
  changedByAdmin: string;
  sourceUrl?: string | null;
}

export interface UpdatePriceHistoryRequest {
  price: number;
  changedByAdmin: string;
  sourceUrl?: string | null;
}

// ===== CLIENTS =====
export interface ClientResponse {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  avatarUrl: string | null;
  phone: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'pending';
  totalInvested: number;
  totalPnl: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  password: string;
  role: 'client';
  phone?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'pending';
  avatarUrl?: string;
}

// ===== MATERIALS =====
export interface MaterialResponse {
  id: string;
  dealId: string | null;
  title: string;
  type: 'file' | 'link';
  url: string;
  fileSize: number | null;
  mimeType: string | null;
  description: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface CreateMaterialRequest {
  title: string;
  type: 'file' | 'link';
  url: string;
  description?: string;
  dealId?: string;
}

// ===== RESERVATIONS =====
export interface Reservation {
  id: string;
  dealId: string;
  dealName: string;
  dealTicker: string;
  clientId: string;
  clientName: string;
  amount: number;
  entryPrice: number;
  isLead: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReservationRequest {
  dealId: string;
  dealName: string;
  dealTicker: string;
  clientId: string;
  clientName: string;
  amount: number;
  entryPrice: number;
  isLead: boolean;
}

// ===== ORDERS (MARKETPLACE) =====
export interface Order {
  id: string;
  dealId: string;
  dealName: string;
  dealTicker: string;
  clientId: string;
  clientName: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number | null;
  quantity: number;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  dealId: string;
  dealName: string;
  dealTicker: string;
  clientId: string;
  clientName: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number | null;
  quantity: number;
}

// ===== DASHBOARD =====
export interface AdminDashboardResponse {
  totalAum: number;
  activeDealCount: number;
  totalClients: number;
  avgReturn: number;
  recentDeals: DealSummary[];
  recentActivity: ActivityItem[];
}

export interface DealSummary {
  id: string;
  companyName: string;
  ticker: string;
  status: string;
  totalPackageAmount: number;
  allocatedAmount: number;
  currentValue: number;
  currentPrice: number;
  clientCount: number;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  timestamp: string;
}

// ===== PRICES =====
export interface UpdatePriceRequest {
  price: number;
}
