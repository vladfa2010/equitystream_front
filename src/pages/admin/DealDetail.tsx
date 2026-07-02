import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil,
  Lock,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  UserPlus,
  Paperclip,
  Link as LinkIcon,
  Download,
  ExternalLink,
  FileText,
  Image,
  Play,
  Clock,
  ChevronDown,
  X,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import Layout from '@/components/Layout';
import AddClientModal from '@/components/deals/AddClientModal';
import {
  deals,
  activities,
  formatCurrency,
  formatPercent,
  timeAgo,
  getClientForId,
} from '@/data/mockData';

const tabVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
  enter: { transition: { staggerChildren: 0.05 } },
};

const staggerItem = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function DealDetailAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const deal = deals.find(d => d.id === id);

  // Local state for price editing
  const [currentPrice, setCurrentPrice] = useState(deal?.currentPrice ?? 0);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(String(deal?.currentPrice ?? 0));
  const [activeTab, setActiveTab] = useState<'positions' | 'materials' | 'activity'>('positions');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'investment' | 'pnl'>('name');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');

  if (!deal) {
    return (
      <Layout role="admin">
        <div className="text-center py-20">
          <h1 className="text-h1 mb-4" style={{ color: '#F5F5F0' }}>Deal Not Found</h1>
          <button className="btn-primary" onClick={() => navigate('/admin')}>
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const entryPrice = deal.entryPrice;
  const priceChange = ((currentPrice - entryPrice) / entryPrice) * 100;
  const totalAllocated = deal.clientInvestments.reduce((sum, ci) => sum + ci.amount, 0);
  const allocationPercent = deal.totalAmount > 0 ? (totalAllocated / deal.totalAmount) * 100 : 0;
  const totalPnl = totalAllocated * (priceChange / 100);
  const clientCount = deal.clientInvestments.length;

  const statusBadgeClass = deal.status === 'active'
    ? 'badge-active'
    : deal.status === 'pending'
      ? 'badge-pending'
      : 'badge-closed';

  const handlePriceUpdate = () => {
    const newPrice = parseFloat(priceInput);
    if (!isNaN(newPrice) && newPrice > 0) {
      setCurrentPrice(newPrice);
      setIsEditingPrice(false);
    }
  };

  const handleCancelPriceEdit = () => {
    setPriceInput(String(currentPrice));
    setIsEditingPrice(false);
  };

  const handleAddClient = (_clientId: string, _amount: string) => {
    // In a real app, this would add to the deal. Here we just close the modal.
    setShowAddClientModal(false);
  };

  // Filtered and sorted client positions
  const filteredPositions = useMemo(() => {
    let positions = deal.clientInvestments.map(ci => {
      const client = getClientForId(ci.clientId);
      const shares = ci.amount / ci.entryPrice;
      const currentValue = shares * currentPrice;
      const pnl = currentValue - ci.amount;
      const pnlPercent = (pnl / ci.amount) * 100;
      return { ...ci, client, shares, currentValue, pnl, pnlPercent };
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      positions = positions.filter(p => p.client?.name.toLowerCase().includes(q));
    }

    positions.sort((a, b) => {
      if (sortBy === 'name') return (a.client?.name ?? '').localeCompare(b.client?.name ?? '');
      if (sortBy === 'investment') return b.amount - a.amount;
      if (sortBy === 'pnl') return b.pnlPercent - a.pnlPercent;
      return 0;
    });

    return positions;
  }, [deal.clientInvestments, currentPrice, searchQuery, sortBy]);

  // Deal-specific activities
  const dealActivities = useMemo(() => {
    let acts = activities.filter(a => {
      const detail = a.detail.toLowerCase();
      const title = a.title.toLowerCase();
      const ticker = deal.ticker.toLowerCase();
      const company = deal.companyName.toLowerCase();
      return detail.includes(ticker) || detail.includes(company) ||
        title.includes(ticker) || title.includes(company) ||
        a.detail.includes('client joined');
    });

    // Also create synthetic activities from the deal data
    const synthetic: typeof activities = [
      {
        id: `synth-${deal.id}-created`,
        type: 'deal_created',
        title: `Deal "${deal.companyName}" created`,
        detail: `${formatCurrency(deal.totalAmount)} package by Admin`,
        timestamp: deal.createdAt,
      },
      {
        id: `synth-${deal.id}-price`,
        type: 'price_updated',
        title: `Price updated for ${deal.ticker}`,
        detail: `New price: $${currentPrice.toFixed(2)} (${formatPercent(priceChange)})`,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    acts = [...acts, ...synthetic].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (activityFilter !== 'all') {
      const filterMap: Record<string, string[]> = {
        price: ['price_updated'],
        clients: ['client_added', 'client_joined'],
        materials: ['material_uploaded'],
      };
      const types = filterMap[activityFilter];
      if (types) {
        acts = acts.filter(a => types.includes(a.type));
      }
    }

    return acts;
  }, [deal, currentPrice, priceChange, activityFilter]);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText size={20} style={{ color: '#EF4444' }} />;
      case 'image': return <Image size={20} style={{ color: '#4F6EF7' }} />;
      case 'video': return <Play size={20} style={{ color: '#8B5CF6' }} />;
      case 'link': return <ExternalLink size={20} style={{ color: '#4F6EF7' }} />;
      default: return <FileText size={20} style={{ color: '#8A8A93' }} />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'price_updated': return <TrendingUp size={16} style={{ color: '#B8A14E' }} />;
      case 'client_added':
      case 'client_joined': return <UserPlus size={16} style={{ color: '#10B981' }} />;
      case 'material_uploaded': return <Paperclip size={16} style={{ color: '#4F6EF7' }} />;
      case 'deal_closed': return <Lock size={16} style={{ color: '#EF4444' }} />;
      default: return <Clock size={16} style={{ color: '#8A8A93' }} />;
    }
  };

  const tabs = [
    { key: 'positions' as const, label: 'Client Positions', count: clientCount },
    { key: 'materials' as const, label: 'Materials', count: deal.materials.length },
    { key: 'activity' as const, label: 'Activity Log', count: null },
  ];

  return (
    <Layout role="admin">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-[13px]" style={{ color: '#55555E' }}>
            <Link to="/admin" className="transition-colors hover:underline" style={{ color: '#8A8A93' }}>Admin</Link>
            <span>/</span>
            <Link to="/admin" className="transition-colors hover:underline" style={{ color: '#8A8A93' }}>Deals</Link>
            <span>/</span>
            <span style={{ color: '#F5F5F0' }}>{deal.companyName} ({deal.ticker})</span>
          </div>
        </motion.nav>

        {/* Deal Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className="text-mono-m"
                style={{
                  color: '#B8A14E',
                  background: 'rgba(184,161,78,0.1)',
                  borderRadius: 8,
                  padding: '4px 14px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {deal.ticker}
              </span>
              <span className={statusBadgeClass} style={{ textTransform: 'uppercase' }}>
                {deal.status}
              </span>
            </div>
            <h1 className="text-h1" style={{ color: '#F5F5F0' }}>{deal.companyName}</h1>
            <p className="text-body mt-1" style={{ color: '#8A8A93' }}>
              {deal.ticker} &bull; Created {new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-secondary flex items-center gap-2 text-[13px]">
              <Pencil size={14} />
              Edit
            </button>
            <button className="btn-secondary flex items-center gap-2 text-[13px]">
              <Lock size={14} />
              Close Deal
            </button>
            <button
              className="flex items-center gap-2 text-[13px]"
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#EF4444',
                borderRadius: 10,
                padding: '8px 16px',
                fontWeight: 600,
                transition: 'all 0.25s',
              }}
              onClick={() => setShowDeleteConfirm(true)}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </motion.div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Total Package */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-panel"
              style={{ padding: 24 }}
            >
              <span className="text-caption uppercase tracking-wider" style={{ color: '#55555E' }}>Total Package</span>
              <p className="text-mono-l mt-2" style={{ color: '#F5F5F0' }}>
                {formatCurrency(deal.totalAmount)}
              </p>
            </motion.div>

            {/* Allocated */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-panel"
              style={{ padding: 24 }}
            >
              <span className="text-caption uppercase tracking-wider" style={{ color: '#55555E' }}>Allocated</span>
              <p className="text-mono-m mt-2" style={{ color: '#B8A14E' }}>
                {formatCurrency(totalAllocated)} ({allocationPercent.toFixed(0)}%)
              </p>
              <div className="mt-2" style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(allocationPercent, 100)}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  style={{ background: '#B8A14E' }}
                />
              </div>
            </motion.div>

            {/* Clients */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-panel"
              style={{ padding: 24 }}
            >
              <span className="text-caption uppercase tracking-wider" style={{ color: '#55555E' }}>Clients</span>
              <p className="text-mono-m mt-2" style={{ color: '#F5F5F0' }}>
                {clientCount}
              </p>
            </motion.div>

            {/* Total Return */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="glass-panel"
              style={{ padding: 24 }}
            >
              <span className="text-caption uppercase tracking-wider" style={{ color: '#55555E' }}>Total Return</span>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-mono-m" style={{ color: priceChange >= 0 ? '#10B981' : '#EF4444' }}>
                  {formatPercent(priceChange)}
                </p>
                {priceChange >= 0 ? <TrendingUp size={18} style={{ color: '#10B981' }} /> : <TrendingDown size={18} style={{ color: '#EF4444' }} />}
              </div>
              <p className="text-[12px] mt-1" style={{ color: '#55555E' }}>
                P&L: {formatCurrency(totalPnl)}
              </p>
            </motion.div>
          </div>

          {/* Price Management Panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="glass-panel"
            style={{ padding: 24 }}
          >
            <h3 className="text-h4 mb-4" style={{ color: '#F5F5F0' }}>Stock Price</h3>

            <AnimatePresence mode="wait">
              {!isEditingPrice ? (
                <motion.div
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-mono-l" style={{ color: '#F5F5F0' }}>
                    ${currentPrice.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] font-medium" style={{ color: priceChange >= 0 ? '#10B981' : '#EF4444' }}>
                      {formatPercent(priceChange)}
                    </span>
                    {priceChange >= 0 ? <TrendingUp size={14} style={{ color: '#10B981' }} /> : <TrendingDown size={14} style={{ color: '#EF4444' }} />}
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: '#55555E' }}>
                    Entry: ${entryPrice.toFixed(2)}
                  </p>
                  <button
                    className="btn-primary flex items-center gap-2 mt-4 text-[13px]"
                    onClick={() => { setIsEditingPrice(true); setPriceInput(String(currentPrice)); }}
                  >
                    <Pencil size={14} />
                    Update Price
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <label className="block text-[12px] font-medium mb-2" style={{ color: '#8A8A93' }}>
                    New Price
                  </label>
                  <div className="relative mb-4">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]"
                      style={{ color: '#55555E', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={priceInput}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d.]/g, '');
                        const parts = raw.split('.');
                        const cleaned = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
                        setPriceInput(cleaned);
                      }}
                      autoFocus
                      className="w-full text-[14px] outline-none"
                      style={{
                        background: '#14141C',
                        border: '1px solid #B8A14E',
                        borderRadius: 10,
                        padding: '10px 12px 10px 28px',
                        color: '#F5F5F0',
                        fontFamily: 'JetBrains Mono, monospace',
                        boxShadow: '0 0 0 3px rgba(184, 161, 78, 0.15)',
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-[13px] py-2 px-4" onClick={handlePriceUpdate}>
                      Save
                    </button>
                    <button className="btn-secondary text-[13px] py-2 px-4" onClick={handleCancelPriceEdit}>
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mini Price Chart */}
            <div className="mt-4" style={{ height: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deal.priceHistory.slice(-30)}>
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#B8A14E"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: '#1A1A24',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#F5F5F0',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    labelFormatter={(label: string) => label}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div
            className="flex gap-0 overflow-x-auto"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex items-center gap-2 whitespace-nowrap"
                style={{
                  padding: '14px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: activeTab === tab.key ? '#F5F5F0' : '#55555E',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'color 0.3s',
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: activeTab === tab.key ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                      color: activeTab === tab.key ? '#F5F5F0' : '#55555E',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="deal-tab-indicator"
                    className="absolute bottom-0 left-4 right-4 h-[2px]"
                    style={{ background: '#B8A14E' }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Tab 1: Client Positions */}
          {activeTab === 'positions' && (
            <motion.div
              key="positions"
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h4 className="text-h4" style={{ color: '#F5F5F0' }}>{clientCount} Clients</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clients..."
                      className="text-[13px] outline-none"
                      style={{
                        background: '#14141C',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        padding: '8px 12px 8px 32px',
                        color: '#F5F5F0',
                        width: 200,
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#B8A14E'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'investment' | 'pnl')}
                      className="text-[13px] outline-none appearance-none cursor-pointer"
                      style={{
                        background: '#14141C',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        padding: '8px 32px 8px 12px',
                        color: '#F5F5F0',
                      }}
                    >
                      <option value="name">Sort by Name</option>
                      <option value="investment">Sort by Investment</option>
                      <option value="pnl">Sort by P&L</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#55555E' }} />
                  </div>
                  <button
                    className="btn-secondary flex items-center gap-2 text-[13px]"
                    onClick={() => setShowAddClientModal(true)}
                  >
                    <UserPlus size={14} />
                    Add Client
                  </button>
                </div>
              </div>

              {/* Table */}
              <div
                className="overflow-x-auto"
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                }}
              >
                {/* Header */}
                <div
                  className="grid gap-4 items-center"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {['Client', 'Investment', 'Entry Price', 'Current Price', 'Position Value', 'P&L'].map((h) => (
                    <span
                      key={h}
                      className="text-caption uppercase tracking-wider"
                      style={{ color: '#55555E' }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                <motion.div variants={staggerContainer} initial="enter" animate="center">
                  {filteredPositions.map((pos) => {
                    const isProfit = pos.pnlPercent >= 0;
                    const isExpanded = expandedRow === pos.clientId;
                    return (
                      <motion.div
                        key={pos.clientId}
                        variants={staggerItem}
                        className="cursor-pointer"
                        style={{
                          background: isProfit ? 'rgba(16,185,129,0.02)' : 'rgba(239,68,68,0.02)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                        onClick={() => setExpandedRow(isExpanded ? null : pos.clientId)}
                        onMouseEnter={(e) => { e.currentTarget.style.background = isProfit ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = isProfit ? 'rgba(16,185,129,0.02)' : 'rgba(239,68,68,0.02)'; }}
                      >
                        <div
                          className="grid gap-4 items-center"
                          style={{
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                            padding: '14px 16px',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={pos.client?.avatar}
                              alt={pos.client?.name}
                              className="w-7 h-7 rounded-full flex-shrink-0"
                              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                            />
                            <span className="text-[14px] font-medium truncate" style={{ color: '#F5F5F0' }}>
                              {pos.client?.name}
                            </span>
                          </div>
                          <span className="text-[14px]" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace' }}>
                            {formatCurrency(pos.amount)}
                          </span>
                          <span className="text-[13px]" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}>
                            ${pos.entryPrice.toFixed(2)}
                          </span>
                          <span className="text-[13px]" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace' }}>
                            ${currentPrice.toFixed(2)}
                          </span>
                          <span className="text-[14px] font-medium" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace' }}>
                            {formatCurrency(pos.currentValue)}
                          </span>
                          <span className="text-[14px] font-semibold" style={{ color: isProfit ? '#10B981' : '#EF4444' }}>
                            {formatPercent(pos.pnlPercent)}
                          </span>
                        </div>

                        {/* Expanded Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                              className="overflow-hidden"
                            >
                              <div
                                className="flex flex-wrap gap-4"
                                style={{
                                  padding: '12px 16px 16px 48px',
                                  borderTop: '1px solid rgba(255,255,255,0.04)',
                                }}
                              >
                                <div>
                                  <span className="text-[11px] uppercase" style={{ color: '#55555E' }}>Shares</span>
                                  <p className="text-[13px]" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {pos.shares.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[11px] uppercase" style={{ color: '#55555E' }}>P&L Amount</span>
                                  <p className="text-[13px] font-medium" style={{ color: isProfit ? '#10B981' : '#EF4444', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {formatCurrency(pos.pnl)}
                                  </p>
                                </div>
                                <div className="flex gap-2 ml-auto">
                                  <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors" style={{ color: '#B8A14E', background: 'rgba(184,161,78,0.1)', border: '1px solid rgba(184,161,78,0.2)' }}>
                                    Edit Allocation
                                  </button>
                                  <Link
                                    to={`/admin/clients/${pos.clientId}`}
                                    className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                                    style={{ color: '#8A8A93', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                  >
                                    View Profile
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Materials */}
          {activeTab === 'materials' && (
            <motion.div
              key="materials"
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h4 className="text-h4" style={{ color: '#F5F5F0' }}>Deal Materials</h4>
                  {deal.materials.length > 0 && (
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A93' }}>
                      {deal.materials.length}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary flex items-center gap-2 text-[13px]">
                    <Paperclip size={14} />
                    Attach File
                  </button>
                  <button className="btn-secondary flex items-center gap-2 text-[13px]">
                    <LinkIcon size={14} />
                    Add Link
                  </button>
                </div>
              </div>

              {deal.materials.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16">
                  <img src="/empty-materials.svg" alt="No materials" className="w-32 h-32 mx-auto mb-4 opacity-40" />
                  <p className="text-body mb-2" style={{ color: '#8A8A93' }}>No materials attached</p>
                  <p className="text-[13px] mb-6" style={{ color: '#55555E' }}>Attach your first file or link</p>
                  <button className="btn-secondary flex items-center gap-2 mx-auto">
                    <Paperclip size={16} />
                    Attach File
                  </button>
                </div>
              ) : (
                /* Materials Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deal.materials.map((material, index) => (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="glass-panel-hover"
                      style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(24px) saturate(140%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 16,
                        padding: 16,
                        boxShadow: 'var(--glass-shadow)',
                        transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.04)',
                          }}
                        >
                          {getMaterialIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium truncate" style={{ color: '#F5F5F0' }}>
                            {material.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] uppercase" style={{ color: '#55555E' }}>
                              {material.type}
                            </span>
                            {material.size && (
                              <>
                                <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                                <span className="text-[12px]" style={{ color: '#55555E' }}>{material.size}</span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] mt-1" style={{ color: '#55555E' }}>
                            {timeAgo(material.uploadedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {material.type === 'link' ? (
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#8A8A93' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              <ExternalLink size={16} />
                            </a>
                          ) : (
                            <button
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#8A8A93' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#8A8A93' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 3: Activity Log */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-h4" style={{ color: '#F5F5F0' }}>Activity Log</h4>
                <div className="relative">
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="text-[13px] outline-none appearance-none cursor-pointer"
                    style={{
                      background: '#14141C',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '8px 32px 8px 12px',
                      color: '#F5F5F0',
                    }}
                  >
                    <option value="all">All Activities</option>
                    <option value="price">Price Updates</option>
                    <option value="clients">Client Changes</option>
                    <option value="materials">Materials</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#55555E' }} />
                </div>
              </div>

              <motion.div variants={staggerContainer} initial="enter" animate="center">
                {dealActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    variants={staggerItem}
                    className="flex items-start gap-4"
                    style={{
                      padding: '16px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium" style={{ color: '#F5F5F0' }}>
                        {activity.title}
                      </p>
                      <p className="text-[13px] mt-0.5" style={{ color: '#8A8A93' }}>
                        {activity.detail}
                      </p>
                    </div>
                    <span className="text-[12px] flex-shrink-0" style={{ color: '#55555E' }}>
                      {timeAgo(activity.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {dealActivities.length === 0 && (
                <div className="text-center py-16">
                  <Clock size={32} className="mx-auto mb-3" style={{ color: '#55555E' }} />
                  <p className="text-body" style={{ color: '#8A8A93' }}>No activities recorded</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onAdd={handleAddClient}
        existingClientIds={deal.clientInvestments.map(ci => ci.clientId)}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md"
            >
              <div className="glass-panel" style={{ padding: 32 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-h3" style={{ color: '#F5F5F0' }}>Delete Deal</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#8A8A93' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-body mb-6" style={{ color: '#8A8A93' }}>
                  Are you sure you want to delete <span style={{ color: '#F5F5F0' }}>{deal.companyName}</span>? This action cannot be undone and all client allocations will be removed.
                </p>
                <div className="flex justify-end gap-3">
                  <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </button>
                  <button
                    className="flex items-center gap-2 text-[14px] font-semibold"
                    style={{
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#EF4444',
                      borderRadius: 10,
                      padding: '10px 20px',
                      transition: 'all 0.25s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                  >
                    <Trash2 size={14} />
                    Delete Deal
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
