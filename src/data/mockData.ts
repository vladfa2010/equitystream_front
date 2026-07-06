// ===== TYPE DEFINITIONS =====

export interface ClientInvestment {
  clientId: string;
  amount: number;
  entryPrice: number;
}

export interface DealMaterial {
  id: string;
  dealId: string;
  type: 'file' | 'link' | 'image' | 'video' | 'document';
  title: string;
  url: string;
  size?: string;
  uploadedAt: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Deal {
  id: string;
  ticker: string;
  companyName: string;
  status: 'draft' | 'Pipeline' | 'Reserve' | 'Founding' | 'Deal done' | 'Wait IPO' | 'Lock-up' | 'Exit';
  totalAmount: number;
  allocatedAmount: number;
  currentPrice: number;
  entryPrice: number;
  clientInvestments: ClientInvestment[];
  materials: DealMaterial[];
  createdAt: string;
  priceHistory: PricePoint[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalInvested: number;
  totalPnl: number;
  pnlPercent: number;
  dealCount: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface ActivityItem {
  id: string;
  type: 'deal_created' | 'price_updated' | 'client_added' | 'material_uploaded' | 'deal_closed' | 'client_joined';
  title: string;
  detail: string;
  timestamp: string;
}

// ===== MOCK DATA =====

export const clients: Client[] = [
  { id: 'c1', name: 'Alexei Volkov', email: 'alexei@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexei', totalInvested: 187500, totalPnl: 46500, pnlPercent: 24.8, dealCount: 5, status: 'active', joinDate: '2024-01-15' },
  { id: 'c2', name: 'Maria Petrova', email: 'maria@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', totalInvested: 142000, totalPnl: 31200, pnlPercent: 22.0, dealCount: 4, status: 'active', joinDate: '2024-02-01' },
  { id: 'c3', name: 'Dmitri Sokolov', email: 'dmitri@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dmitri', totalInvested: 95000, totalPnl: 16150, pnlPercent: 17.0, dealCount: 3, status: 'active', joinDate: '2024-02-20' },
  { id: 'c4', name: 'Elena Kuznetsova', email: 'elena@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena', totalInvested: 210000, totalPnl: 33600, pnlPercent: 16.0, dealCount: 6, status: 'active', joinDate: '2023-11-10' },
  { id: 'c5', name: 'Ivan Smirnov', email: 'ivan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivan', totalInvested: 78000, totalPnl: 8580, pnlPercent: 11.0, dealCount: 2, status: 'active', joinDate: '2024-03-05' },
  { id: 'c6', name: 'Olga Novikova', email: 'olga@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olga', totalInvested: 125000, totalPnl: -3750, pnlPercent: -3.0, dealCount: 3, status: 'active', joinDate: '2024-01-28' },
  { id: 'c7', name: 'Sergei Morozov', email: 'sergei@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sergei', totalInvested: 56000, totalPnl: -2240, pnlPercent: -4.0, dealCount: 2, status: 'active', joinDate: '2024-03-12' },
  { id: 'c8', name: 'Anna Lebedeva', email: 'anna@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna', totalInvested: 168000, totalPnl: 20160, pnlPercent: 12.0, dealCount: 4, status: 'active', joinDate: '2023-12-01' },
  { id: 'c9', name: 'Pavel Kozlov', email: 'pavel@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pavel', totalInvested: 89000, totalPnl: 9780, pnlPercent: 11.0, dealCount: 3, status: 'active', joinDate: '2024-02-15' },
  { id: 'c10', name: 'Yulia Fedorova', email: 'yulia@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yulia', totalInvested: 134000, totalPnl: 16080, pnlPercent: 12.0, dealCount: 4, status: 'active', joinDate: '2023-11-20' },
  { id: 'c11', name: 'Nikolai Vasnetsov', email: 'nikolai@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nikolai', totalInvested: 45000, totalPnl: 5400, pnlPercent: 12.0, dealCount: 1, status: 'active', joinDate: '2024-03-18' },
  { id: 'c12', name: 'Tatiana Romanova', email: 'tatiana@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tatiana', totalInvested: 198000, totalPnl: 25740, pnlPercent: 13.0, dealCount: 5, status: 'active', joinDate: '2023-10-15' },
  { id: 'c13', name: 'Mikhail Borisov', email: 'mikhail@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mikhail', totalInvested: 67000, totalPnl: 7370, pnlPercent: 11.0, dealCount: 2, status: 'inactive', joinDate: '2024-01-05' },
  { id: 'c14', name: 'Sofia Makarova', email: 'sofia@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia', totalInvested: 112000, totalPnl: 14560, pnlPercent: 13.0, dealCount: 3, status: 'active', joinDate: '2023-12-20' },
  { id: 'c15', name: 'Andrei Popov', email: 'andrei@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrei', totalInvested: 156000, totalPnl: 18720, pnlPercent: 12.0, dealCount: 4, status: 'active', joinDate: '2023-09-25' },
  { id: 'c16', name: 'Victoria Semenova', email: 'victoria@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victoria', totalInvested: 83000, totalPnl: 9130, pnlPercent: 11.0, dealCount: 2, status: 'active', joinDate: '2024-02-28' },
  { id: 'c17', name: 'Roman Chernov', email: 'roman@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roman', totalInvested: 44000, totalPnl: -1320, pnlPercent: -3.0, dealCount: 1, status: 'active', joinDate: '2024-03-22' },
  { id: 'c18', name: 'Kristina Volkova', email: 'kristina@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kristina', totalInvested: 176000, totalPnl: 24640, pnlPercent: 14.0, dealCount: 5, status: 'active', joinDate: '2023-08-14' },
  { id: 'c19', name: 'Artem Kuzmin', email: 'artem@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artem', totalInvested: 62000, totalPnl: 8060, pnlPercent: 13.0, dealCount: 2, status: 'active', joinDate: '2024-01-30' },
  { id: 'c20', name: 'Daria Sokolova', email: 'daria@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daria', totalInvested: 145000, totalPnl: 17400, pnlPercent: 12.0, dealCount: 4, status: 'active', joinDate: '2023-11-01' },
  { id: 'c21', name: 'Maxim Antonov', email: 'maxim@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maxim', totalInvested: 38000, totalPnl: 3800, pnlPercent: 10.0, dealCount: 1, status: 'active', joinDate: '2024-03-25' },
  { id: 'c22', name: 'Irina Pavlova', email: 'irina@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irina', totalInvested: 98000, totalPnl: 12740, pnlPercent: 13.0, dealCount: 3, status: 'active', joinDate: '2024-02-10' },
  { id: 'c23', name: 'Vladimir Egorov', email: 'vladimir@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vladimir', totalInvested: 74000, totalPnl: 8140, pnlPercent: 11.0, dealCount: 2, status: 'inactive', joinDate: '2024-01-12' },
  { id: 'c24', name: 'Natalia Smirnova', email: 'natalia@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=natalia', totalInvested: 132000, totalPnl: 17160, pnlPercent: 13.0, dealCount: 4, status: 'active', joinDate: '2023-10-28' },
  { id: 'c25', name: 'Oleg Nikitin', email: 'oleg@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oleg', totalInvested: 55000, totalPnl: 4950, pnlPercent: 9.0, dealCount: 2, status: 'active', joinDate: '2024-03-01' },
  { id: 'c26', name: 'Julia Orlova', email: 'julia@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia', totalInvested: 164000, totalPnl: 21320, pnlPercent: 13.0, dealCount: 5, status: 'active', joinDate: '2023-09-10' },
  { id: 'c27', name: 'Stanislav Melnikov', email: 'stanislav@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stanislav', totalInvested: 71000, totalPnl: 9230, pnlPercent: 13.0, dealCount: 2, status: 'active', joinDate: '2024-02-22' },
  { id: 'c28', name: 'Veronika Belova', email: 'veronika@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=veronika', totalInvested: 118000, totalPnl: 15340, pnlPercent: 13.0, dealCount: 3, status: 'active', joinDate: '2023-12-05' },
  { id: 'c29', name: 'Alexander Gusev', email: 'alexander@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexander', totalInvested: 87000, totalPnl: 10440, pnlPercent: 12.0, dealCount: 3, status: 'active', joinDate: '2024-01-18' },
  { id: 'c30', name: 'Catherine Zaitseva', email: 'catherine@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=catherine', totalInvested: 139000, totalPnl: 18070, pnlPercent: 13.0, dealCount: 4, status: 'active', joinDate: '2023-11-14' },
  { id: 'c31', name: 'Yevgeny Polyakov', email: 'yevgeny@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yevgeny', totalInvested: 48000, totalPnl: 3360, pnlPercent: 7.0, dealCount: 1, status: 'active', joinDate: '2024-03-15' },
  { id: 'c32', name: 'Margarita Vasileva', email: 'margarita@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=margarita', totalInvested: 103000, totalPnl: 12875, pnlPercent: 12.5, dealCount: 3, status: 'active', joinDate: '2024-02-05' },
  { id: 'c33', name: 'Denis Kulikov', email: 'denis@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=denis', totalInvested: 58000, totalPnl: 5800, pnlPercent: 10.0, dealCount: 2, status: 'active', joinDate: '2024-03-10' },
  { id: 'c34', name: 'Ludmila Frolova', email: 'ludmila@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ludmila', totalInvested: 92000, totalPnl: 11040, pnlPercent: 12.0, dealCount: 3, status: 'active', joinDate: '2024-01-22' },
];

// Generate price history helper
function generatePriceHistory(basePrice: number, days: number, volatility: number = 0.02): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * 0.85;
  const now = new Date('2025-06-01');
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * volatility;
    price = price * (1 + change);
    // Trend toward basePrice
    price = price + (basePrice - price) * 0.01;
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    });
  }
  return history;
}

export const deals: Deal[] = [
  {
    id: 'd1',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    status: 'active',
    totalAmount: 500000,
    allocatedAmount: 310000,
    currentPrice: 198.45,
    entryPrice: 175.20,
    clientInvestments: [
      { clientId: 'c1', amount: 45000, entryPrice: 175.20 },
      { clientId: 'c2', amount: 38000, entryPrice: 175.20 },
      { clientId: 'c3', amount: 25000, entryPrice: 175.20 },
      { clientId: 'c4', amount: 52000, entryPrice: 175.20 },
      { clientId: 'c5', amount: 18000, entryPrice: 175.20 },
      { clientId: 'c6', amount: 30000, entryPrice: 175.20 },
      { clientId: 'c7', amount: 22000, entryPrice: 175.20 },
      { clientId: 'c8', amount: 41000, entryPrice: 175.20 },
      { clientId: 'c9', amount: 19000, entryPrice: 175.20 },
      { clientId: 'c10', amount: 20000, entryPrice: 175.20 },
    ],
    materials: [
      { id: 'm1', dealId: 'd1', type: 'document', title: 'Apple Q1 2025 Earnings.pdf', url: '#', size: '2.4 MB', uploadedAt: '2025-05-15T10:30:00Z' },
      { id: 'm2', dealId: 'd1', type: 'link', title: 'Apple Investor Relations', url: 'https://investor.apple.com', uploadedAt: '2025-05-15T10:32:00Z' },
    ],
    createdAt: '2025-05-15T10:00:00Z',
    priceHistory: generatePriceHistory(198.45, 180),
  },
  {
    id: 'd2',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    status: 'active',
    totalAmount: 750000,
    allocatedAmount: 620000,
    currentPrice: 875.40,
    entryPrice: 720.50,
    clientInvestments: [
      { clientId: 'c1', amount: 55000, entryPrice: 720.50 },
      { clientId: 'c2', amount: 48000, entryPrice: 720.50 },
      { clientId: 'c4', amount: 72000, entryPrice: 720.50 },
      { clientId: 'c8', amount: 61000, entryPrice: 720.50 },
      { clientId: 'c10', amount: 43000, entryPrice: 720.50 },
      { clientId: 'c12', amount: 58000, entryPrice: 720.50 },
      { clientId: 'c15', amount: 52000, entryPrice: 720.50 },
      { clientId: 'c18', amount: 67000, entryPrice: 720.50 },
      { clientId: 'c20', amount: 49000, entryPrice: 720.50 },
      { clientId: 'c22', amount: 35000, entryPrice: 720.50 },
      { clientId: 'c24', amount: 51000, entryPrice: 720.50 },
      { clientId: 'c30', amount: 38000, entryPrice: 720.50 },
    ],
    materials: [
      { id: 'm3', dealId: 'd2', type: 'document', title: 'NVIDIA GTC 2025 Summary.pdf', url: '#', size: '4.1 MB', uploadedAt: '2025-04-20T14:00:00Z' },
      { id: 'm4', dealId: 'd2', type: 'link', title: 'NVIDIA AI Revenue Forecast', url: 'https://nvidia.com', uploadedAt: '2025-04-20T14:05:00Z' },
      { id: 'm5', dealId: 'd2', type: 'image', title: 'NVDA Price Target Chart.png', url: '#', size: '1.8 MB', uploadedAt: '2025-04-22T09:15:00Z' },
    ],
    createdAt: '2025-04-20T14:00:00Z',
    priceHistory: generatePriceHistory(875.40, 180),
  },
  {
    id: 'd3',
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    status: 'active',
    totalAmount: 420000,
    allocatedAmount: 380000,
    currentPrice: 248.35,
    entryPrice: 265.80,
    clientInvestments: [
      { clientId: 'c3', amount: 28000, entryPrice: 265.80 },
      { clientId: 'c5', amount: 22000, entryPrice: 265.80 },
      { clientId: 'c7', amount: 18000, entryPrice: 265.80 },
      { clientId: 'c11', amount: 25000, entryPrice: 265.80 },
      { clientId: 'c13', amount: 15000, entryPrice: 265.80 },
      { clientId: 'c14', amount: 32000, entryPrice: 265.80 },
      { clientId: 'c17', amount: 22000, entryPrice: 265.80 },
      { clientId: 'c19', amount: 26000, entryPrice: 265.80 },
      { clientId: 'c23', amount: 17000, entryPrice: 265.80 },
      { clientId: 'c25', amount: 20000, entryPrice: 265.80 },
      { clientId: 'c26', amount: 35000, entryPrice: 265.80 },
      { clientId: 'c27', amount: 21000, entryPrice: 265.80 },
      { clientId: 'c29', amount: 28000, entryPrice: 265.80 },
      { clientId: 'c31', amount: 24000, entryPrice: 265.80 },
      { clientId: 'c33', amount: 16000, entryPrice: 265.80 },
    ],
    materials: [
      { id: 'm6', dealId: 'd3', type: 'document', title: 'Tesla FSD Analysis.pdf', url: '#', size: '3.2 MB', uploadedAt: '2025-05-01T11:00:00Z' },
    ],
    createdAt: '2025-05-01T11:00:00Z',
    priceHistory: generatePriceHistory(248.35, 120),
  },
  {
    id: 'd4',
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    status: 'active',
    totalAmount: 380000,
    allocatedAmount: 290000,
    currentPrice: 432.15,
    entryPrice: 395.60,
    clientInvestments: [
      { clientId: 'c1', amount: 35000, entryPrice: 395.60 },
      { clientId: 'c2', amount: 28000, entryPrice: 395.60 },
      { clientId: 'c4', amount: 45000, entryPrice: 395.60 },
      { clientId: 'c6', amount: 32000, entryPrice: 395.60 },
      { clientId: 'c9', amount: 26000, entryPrice: 395.60 },
      { clientId: 'c12', amount: 38000, entryPrice: 395.60 },
      { clientId: 'c15', amount: 42000, entryPrice: 395.60 },
      { clientId: 'c20', amount: 44000, entryPrice: 395.60 },
    ],
    materials: [],
    createdAt: '2025-05-10T09:00:00Z',
    priceHistory: generatePriceHistory(432.15, 90),
  },
  {
    id: 'd5',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    status: 'active',
    totalAmount: 320000,
    allocatedAmount: 195000,
    currentPrice: 168.90,
    entryPrice: 155.30,
    clientInvestments: [
      { clientId: 'c3', amount: 22000, entryPrice: 155.30 },
      { clientId: 'c8', amount: 38000, entryPrice: 155.30 },
      { clientId: 'c10', amount: 29000, entryPrice: 155.30 },
      { clientId: 'c14', amount: 26000, entryPrice: 155.30 },
      { clientId: 'c18', amount: 35000, entryPrice: 155.30 },
      { clientId: 'c22', amount: 22000, entryPrice: 155.30 },
      { clientId: 'c28', amount: 23000, entryPrice: 155.30 },
    ],
    materials: [
      { id: 'm7', dealId: 'd5', type: 'link', title: 'Google Cloud Revenue Report', url: 'https://abc.xyz', uploadedAt: '2025-05-20T16:00:00Z' },
    ],
    createdAt: '2025-05-20T16:00:00Z',
    priceHistory: generatePriceHistory(168.90, 60),
  },
  {
    id: 'd6',
    ticker: 'AMZN',
    companyName: 'Amazon.com Inc.',
    status: 'pending',
    totalAmount: 280000,
    allocatedAmount: 120000,
    currentPrice: 198.75,
    entryPrice: 185.40,
    clientInvestments: [
      { clientId: 'c5', amount: 18000, entryPrice: 185.40 },
      { clientId: 'c11', amount: 20000, entryPrice: 185.40 },
      { clientId: 'c16', amount: 25000, entryPrice: 185.40 },
      { clientId: 'c19', amount: 22000, entryPrice: 185.40 },
      { clientId: 'c25', amount: 16000, entryPrice: 185.40 },
      { clientId: 'c29', amount: 19000, entryPrice: 185.40 },
    ],
    materials: [],
    createdAt: '2025-05-28T08:00:00Z',
    priceHistory: generatePriceHistory(198.75, 30),
  },
  {
    id: 'd7',
    ticker: 'META',
    companyName: 'Meta Platforms, Inc.',
    status: 'active',
    totalAmount: 260000,
    allocatedAmount: 235000,
    currentPrice: 498.25,
    entryPrice: 425.80,
    clientInvestments: [
      { clientId: 'c2', amount: 28000, entryPrice: 425.80 },
      { clientId: 'c6', amount: 31000, entryPrice: 425.80 },
      { clientId: 'c9', amount: 25000, entryPrice: 425.80 },
      { clientId: 'c13', amount: 22000, entryPrice: 425.80 },
      { clientId: 'c17', amount: 20000, entryPrice: 425.80 },
      { clientId: 'c21', amount: 38000, entryPrice: 425.80 },
      { clientId: 'c23', amount: 18000, entryPrice: 425.80 },
      { clientId: 'c27', amount: 23000, entryPrice: 425.80 },
      { clientId: 'c32', amount: 30000, entryPrice: 425.80 },
    ],
    materials: [
      { id: 'm8', dealId: 'd7', type: 'document', title: 'Meta VR Market Outlook.pdf', url: '#', size: '5.6 MB', uploadedAt: '2025-04-15T13:00:00Z' },
    ],
    createdAt: '2025-04-15T13:00:00Z',
    priceHistory: generatePriceHistory(498.25, 120),
  },
  {
    id: 'd8',
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices, Inc.',
    status: 'active',
    totalAmount: 180000,
    allocatedAmount: 145000,
    currentPrice: 156.80,
    entryPrice: 142.60,
    clientInvestments: [
      { clientId: 'c7', amount: 16000, entryPrice: 142.60 },
      { clientId: 'c16', amount: 22000, entryPrice: 142.60 },
      { clientId: 'c24', amount: 28000, entryPrice: 142.60 },
      { clientId: 'c26', amount: 25000, entryPrice: 142.60 },
      { clientId: 'c30', amount: 27000, entryPrice: 142.60 },
      { clientId: 'c34', amount: 27000, entryPrice: 142.60 },
    ],
    materials: [],
    createdAt: '2025-05-05T10:00:00Z',
    priceHistory: generatePriceHistory(156.80, 90),
  },
  {
    id: 'd9',
    ticker: 'CRM',
    companyName: 'Salesforce, Inc.',
    status: 'closed',
    totalAmount: 150000,
    allocatedAmount: 150000,
    currentPrice: 278.45,
    entryPrice: 265.20,
    clientInvestments: [
      { clientId: 'c1', amount: 25000, entryPrice: 265.20 },
      { clientId: 'c3', amount: 20000, entryPrice: 265.20 },
      { clientId: 'c8', amount: 32000, entryPrice: 265.20 },
      { clientId: 'c12', amount: 28000, entryPrice: 265.20 },
      { clientId: 'c18', amount: 45000, entryPrice: 265.20 },
    ],
    materials: [],
    createdAt: '2025-01-15T09:00:00Z',
    priceHistory: generatePriceHistory(278.45, 180),
  },
  {
    id: 'd10',
    ticker: 'COIN',
    companyName: 'Coinbase Global, Inc.',
    status: 'pending',
    totalAmount: 120000,
    allocatedAmount: 45000,
    currentPrice: 245.60,
    entryPrice: 210.30,
    clientInvestments: [
      { clientId: 'c4', amount: 15000, entryPrice: 210.30 },
      { clientId: 'c11', amount: 15000, entryPrice: 210.30 },
      { clientId: 'c20', amount: 15000, entryPrice: 210.30 },
    ],
    materials: [],
    createdAt: '2025-05-25T11:00:00Z',
    priceHistory: generatePriceHistory(245.60, 14),
  },
  {
    id: 'd11',
    ticker: 'NFLX',
    companyName: 'Netflix, Inc.',
    status: 'active',
    totalAmount: 200000,
    allocatedAmount: 165000,
    currentPrice: 685.40,
    entryPrice: 590.25,
    clientInvestments: [
      { clientId: 'c5', amount: 20000, entryPrice: 590.25 },
      { clientId: 'c10', amount: 28000, entryPrice: 590.25 },
      { clientId: 'c15', amount: 32000, entryPrice: 590.25 },
      { clientId: 'c22', amount: 25000, entryPrice: 590.25 },
      { clientId: 'c28', amount: 30000, entryPrice: 590.25 },
      { clientId: 'c34', amount: 30000, entryPrice: 590.25 },
    ],
    materials: [],
    createdAt: '2025-04-01T09:00:00Z',
    priceHistory: generatePriceHistory(685.40, 120),
  },
  {
    id: 'd12',
    ticker: 'DIS',
    companyName: 'Walt Disney Co.',
    status: 'active',
    totalAmount: 165000,
    allocatedAmount: 88000,
    currentPrice: 112.35,
    entryPrice: 105.80,
    clientInvestments: [
      { clientId: 'c9', amount: 18000, entryPrice: 105.80 },
      { clientId: 'c17', amount: 16000, entryPrice: 105.80 },
      { clientId: 'c21', amount: 12000, entryPrice: 105.80 },
      { clientId: 'c25', amount: 14000, entryPrice: 105.80 },
      { clientId: 'c29', amount: 14000, entryPrice: 105.80 },
      { clientId: 'c33', amount: 14000, entryPrice: 105.80 },
    ],
    materials: [],
    createdAt: '2025-05-12T14:00:00Z',
    priceHistory: generatePriceHistory(112.35, 75),
  },
];

export const activities: ActivityItem[] = [
  { id: 'a1', type: 'deal_created', title: 'Deal "Apple Inc." created', detail: '$500,000 package by Admin', timestamp: '2025-06-01T09:58:00Z' },
  { id: 'a2', type: 'price_updated', title: 'Price updated for NVDA', detail: 'New price: $875.40 (+2.3%)', timestamp: '2025-06-01T09:45:00Z' },
  { id: 'a3', type: 'client_added', title: 'Client added to TSLA deal', detail: 'Maria Petrova — $25,000 allocation', timestamp: '2025-06-01T08:30:00Z' },
  { id: 'a4', type: 'material_uploaded', title: 'Material uploaded to AAPL', detail: 'Apple Q1 2025 Earnings.pdf', timestamp: '2025-06-01T07:15:00Z' },
  { id: 'a5', type: 'price_updated', title: 'Price updated for MSFT', detail: 'New price: $432.15 (+1.1%)', timestamp: '2025-06-01T06:00:00Z' },
  { id: 'a6', type: 'client_joined', title: 'New client joined', detail: 'Denis Kulikov — $58,000 initial investment', timestamp: '2025-05-31T16:30:00Z' },
  { id: 'a7', type: 'deal_created', title: 'Deal "Alphabet Inc." created', detail: '$320,000 package by Admin', timestamp: '2025-05-31T14:00:00Z' },
  { id: 'a8', type: 'price_updated', title: 'Price updated for META', detail: 'New price: $498.25 (+0.8%)', timestamp: '2025-05-31T12:00:00Z' },
  { id: 'a9', type: 'material_uploaded', title: 'Material uploaded to NVDA', detail: 'NVIDIA GTC 2025 Summary.pdf', timestamp: '2025-05-31T10:30:00Z' },
  { id: 'a10', type: 'deal_closed', title: 'Deal "Salesforce, Inc." closed', detail: 'Final return: +5.0% for all clients', timestamp: '2025-05-31T09:00:00Z' },
];

// Aggregated metrics
export const totalAUM = deals.reduce((sum, d) => sum + d.allocatedAmount, 0);
export const activeDealCount = deals.filter(d => d.status === 'active').length;
export const totalClients = clients.length;
export const avgReturn = clients.reduce((sum, c) => sum + c.pnlPercent, 0) / clients.length;

// Portfolio value over time (aggregate)
export function getPortfolioHistory(days: number = 180): PricePoint[] {
  const activeDeals = deals.filter(d => d.status === 'active');
  const history: PricePoint[] = [];
  const now = new Date('2025-06-01');

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    let totalValue = 0;
    for (const deal of activeDeals) {
      const ph = deal.priceHistory.find(p => p.date === dateStr);
      if (ph) {
        const ratio = ph.price / deal.entryPrice;
        totalValue += deal.allocatedAmount * ratio;
      } else {
        // interpolate from nearest points
        const nearest = deal.priceHistory.reduce((closest, p) => {
          const pd = new Date(p.date).getTime();
          const cd = new Date(closest.date).getTime();
          const td = date.getTime();
          return Math.abs(pd - td) < Math.abs(cd - td) ? p : closest;
        }, deal.priceHistory[0]);
        if (nearest) {
          const ratio = nearest.price / deal.entryPrice;
          totalValue += deal.allocatedAmount * ratio;
        }
      }
    }

    history.push({ date: dateStr, price: Math.round(totalValue) });
  }

  return history;
}

export function getClientForId(id: string): Client | undefined {
  return clients.find(c => c.id === id);
}

export function getClientsForDeal(deal: Deal): Client[] {
  return deal.clientInvestments
    .map(ci => getClientForId(ci.clientId))
    .filter((c): c is Client => c !== undefined);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${Math.round(value).toLocaleString()}`;
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function timeAgo(timestamp: string): string {
  const now = new Date('2025-06-01T10:00:00Z');
  const then = new Date(timestamp);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${diff < 7200 ? '' : 's'} ago`;
  return `${Math.floor(diff / 86400)} day${diff < 172800 ? '' : 's'} ago`;
}
