// ===== AUTH =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
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
  managementFeePercent: number;
  targetPrice: number | null;
  timeHorizon: string | null;
  status: 'draft' | 'Pipeline' | 'Skip' | 'Reserve' | 'Founding' | 'Deal done' | 'Wait IPO' | 'Lock-up' | 'Exit';
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
  clientId: string;
  clientName: string;
  clientAvatar: string | null;
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
  fullName: string;
  name: string;              // backward compatibility
  nickname: string;
  dateOfBirth: string | null;
  role: 'user' | 'admin' | 'superadmin';
  email: string;
  phone: string | null;
  telegram: string | null;
  notes: string | null;
  contractUrl: string | null;
  avatarUrl: string | null;
  idDocumentUrl: string | null;
  status: 'active' | 'pending' | 'inactive';
  totalInvested: number;
  totalPnl: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  fullName: string;
  dateOfBirth?: string;
  nickname: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin';
  email: string;
  phone?: string;
  telegram?: string;
  notes?: string;
  contractFile?: string;
  avatarFile?: string;
  idDocumentFile?: string;
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
