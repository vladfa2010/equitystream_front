import { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Briefcase,
  UserPlus,
  Upload,
  Search,
  MoreHorizontal,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react';
import { formatCurrency, formatPercent, timeAgo } from '@/data/mockData';
import { dealsApi, clientsApi, dashboardApi } from '@/api';
import type { DealResponse, ClientResponse, ActivityItem } from '@/api';
import Layout from '@/components/Layout';

const Globe = lazy(() => import('@/components/Globe'));

// ===== HELPERS =====
function getClientName(c: ClientResponse): string {
  return c.fullName || c.name || 'Unknown';
}

function getClientPnlPercent(c: ClientResponse): number {
  return c.totalInvested > 0 ? (c.totalPnl / c.totalInvested) * 100 : 0;
}

function getDealAllocatedPercent(deal: DealResponse): number {
  const invested = deal.investments.reduce((s, i) => s + i.amount, 0);
  return deal.totalPackageAmount > 0 ? Math.round((invested / deal.totalPackageAmount) * 100) : 0;
}

// ===== ANIMATION VARIANTS =====
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 },
  },
};

// ===== NUMBER COUNTER HOOK =====
function useCounter(end: number, duration: number = 1200, start: boolean = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased * 100) / 100);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return value;
}

// ===== STAT CARD COMPONENT =====
function StatCard({ label, value, prefix, suffix, color, delay, icon: Icon }: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  delay: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  const count = useCounter(value, 1200);
  const displayValue = value >= 1000
    ? Math.round(count).toLocaleString()
    : count.toFixed(1);

  return (
    <motion.div
      variants={fadeLeft}
      transition={{ delay }}
      className="glass-panel p-5 glass-panel-hover cursor-default"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-caption uppercase" style={{ color: '#55555E' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Icon size={16} color={color || '#8A8A93'} />
        </div>
      </div>
      <div className="text-mono-l tabular-nums" style={{ color: color || '#F5F5F0' }}>
        {prefix}{displayValue}{suffix}
      </div>
    </motion.div>
  );
}

// ===== DEAL CARD COMPONENT =====
function DealCard({ deal, index, allClients, onDeleted }: { deal: DealResponse; index: number; allClients: ClientResponse[]; onDeleted?: () => void }) {
  const navigate = useNavigate();
  const allocatedPercent = getDealAllocatedPercent(deal);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusColors = {
    active: 'badge-active',
    pending: 'badge-pending',
    closed: 'badge-closed',
    draft: 'badge-pending',
  };

  const statusLabels = { active: 'ACTIVE', pending: 'PENDING', closed: 'CLOSED', draft: 'DRAFT' };

  const cardClients = deal.investments.slice(0, 5).map(ci =>
    allClients.find(c => c.id === ci.clientId)
  ).filter(Boolean) as ClientResponse[];

  return (
    <>
    <motion.div
      variants={fadeUp}
      className="glass-panel p-5 glass-panel-hover cursor-pointer relative group"
      onClick={() => navigate(`/admin/deals/${deal.id}`)}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 0.8s ease-out',
        }} />
      </div>

      {/* Top row: Ticker + Status + Menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[12px] font-bold bg-white/5 text-[#F5F5F0]">
            {deal.ticker}
          </span>
          <span className={statusColors[deal.status]}>
            {statusLabels[deal.status]}
          </span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          >
            <MoreHorizontal size={16} color="#8A8A93" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-40 py-1 rounded-xl z-40" style={{
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              {['Edit', 'View Details', 'Close Deal', 'Delete'].map((action) => (
                <button
                  key={action}
                  className="w-full text-left px-4 py-2 text-[13px] transition-colors hover:bg-white/5"
                  style={{ color: action === 'Delete' ? '#EF4444' : '#F5F5F0' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    if (action === 'Delete') {
                      setShowDeleteModal(true);
                      setConfirmName('');
                    } else if (action === 'View Details') {
                      navigate(`/admin/deals/${deal.id}`);
                    }
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Company name + total */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-h4" style={{ color: '#F5F5F0' }}>{deal.companyName}</h4>
        <span className="text-mono-m tabular-nums" style={{ color: '#B8A14E' }}>
          {formatCurrency(deal.totalPackageAmount)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-caption" style={{ color: '#8A8A93' }}>{allocatedPercent}% allocated</span>
          <span className="text-caption tabular-nums" style={{ color: '#55555E' }}>
            {deal.investments.length} clients
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--grad-gold)' }}
            initial={{ width: 0 }}
            animate={{ width: `${allocatedPercent}%` }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          />
        </div>
      </div>

      {/* Client avatars */}
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {cardClients.map((client) => (
            <img
              key={client.id}
              src={client.avatarUrl || '/default-avatar.png'}
              alt={getClientName(client)}
              className="w-7 h-7 rounded-full border-2"
              style={{ borderColor: '#111118' }}
              title={getClientName(client)}
            />
          ))}
        </div>
        {deal.investments.length > 5 && (
          <span className="ml-2 text-caption" style={{ color: '#55555E' }}>
            +{deal.investments.length - 5}
          </span>
        )}
      </div>
    </motion.div>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-6 rounded-2xl"
          style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#F5F5F0' }}>Delete Deal</h3>
              <p className="text-sm" style={{ color: '#8A8A93' }}>This action cannot be undone.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-sm mb-3" style={{ color: '#F5F5F0' }}>
              To confirm deletion, please type the deal name:
            </p>
            <p className="text-sm font-semibold" style={{ color: '#B8A14E' }}>{deal.companyName}</p>
          </div>

          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={`Type "${deal.companyName}" to confirm`}
            className="w-full px-4 py-3 rounded-xl text-sm mb-4 outline-none"
            style={{
              background: '#0A0A0F',
              border: `1px solid ${confirmName === deal.companyName ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: '#F5F5F0',
            }}
            autoFocus
          />

          <div className="flex gap-3">
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => { setShowDeleteModal(false); setConfirmName(''); }}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              disabled={confirmName !== deal.companyName || deleting}
              style={{
                background: confirmName === deal.companyName && !deleting ? '#EF4444' : 'rgba(239,68,68,0.2)',
                color: '#F5F5F0',
                opacity: confirmName === deal.companyName && !deleting ? 1 : 0.4,
                cursor: confirmName === deal.companyName && !deleting ? 'pointer' : 'not-allowed',
              }}
              onClick={async () => {
                if (confirmName !== deal.companyName) return;
                setDeleting(true);
                try {
                  await dealsApi.delete(deal.id);
                  setShowDeleteModal(false);
                  onDeleted?.();
                } catch (err) {
                  alert('Failed to delete deal: ' + String(err));
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Deal'}
            </button>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}

// ===== CLIENT SNAPSHOT ROW =====
function ClientSnapshotRow({ client, index }: { client: ClientResponse; index: number }) {
  const pnlPercent = getClientPnlPercent(client);
  const isProfit = pnlPercent >= 0;
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay: index * 0.08 }}
      className="flex items-center justify-between py-3 px-1 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <img src={client.avatarUrl || '/default-avatar.png'} alt={getClientName(client)} className="w-9 h-9 rounded-full" />
        <div>
          <p className="text-[14px] font-semibold" style={{ color: '#F5F5F0' }}>{getClientName(client)}</p>
          <p className="text-caption tabular-nums" style={{ color: '#55555E' }}>
            {formatCurrency(client.totalInvested)} invested
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-mono-s tabular-nums font-medium" style={{ color: isProfit ? '#10B981' : '#EF4444' }}>
          {formatPercent(pnlPercent)}
        </span>
      </div>
    </motion.div>
  );
}

// ===== ACTIVITY ITEM =====
function ActivityRow({ activity, index }: { activity: ActivityItem; index: number }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4 py-3"
    >
      <div className="flex flex-col items-center pt-1">
        <div className="w-2 h-2 rounded-full bg-[#B8A14E]" />
        <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium truncate" style={{ color: '#F5F5F0' }}>{activity.title}</p>
        <p className="text-caption mt-0.5" style={{ color: '#55555E' }}>{activity.detail}</p>
      </div>
      <span className="text-caption whitespace-nowrap mt-0.5" style={{ color: '#55555E' }}>
        {timeAgo(activity.timestamp)}
      </span>
    </motion.div>
  );
}

// ===== CUSTOM CHART TOOLTIP =====
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-3 rounded-xl" style={{ backdropFilter: 'blur(24px) saturate(140%)' }}>
      <p className="text-caption mb-1" style={{ color: '#55555E' }}>{label}</p>
      <p className="text-mono-s tabular-nums font-medium" style={{ color: '#F5F5F0' }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ===== MAIN DASHBOARD PAGE =====
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [dealFilter, setDealFilter] = useState<'all' | 'active' | 'pending' | 'closed' | 'draft'>('all');
  const [dealSearch, setDealSearch] = useState('');

  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [dashboardData, setDashboardData] = useState({
    totalAum: 0,
    activeDealCount: 0,
    totalClients: 0,
    avgReturn: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dealsApi.getAll(),
      clientsApi.getAll(),
      dashboardApi.getAdmin(),
    ]).then(([dealsData, clientsData, dashData]) => {
      setDeals(dealsData || []);
      setClients(clientsData || []);
      setDashboardData({
        totalAum: dashData?.totalAum || 0,
        activeDealCount: dashData?.activeDealCount || 0,
        totalClients: dashData?.totalClients || 0,
        avgReturn: dashData?.avgReturn || 0,
      });
      setActivities(dashData?.recentActivity || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const portfolioData = useMemo(() => {
    // Aggregate price history from all active deals
    const activeDeals = deals.filter(d => d.status === 'active');
    if (activeDeals.length === 0) return [];

    // Use the first active deal's price history as proxy
    const mainDeal = activeDeals[0];
    return (mainDeal.priceHistory || []).map(p => ({
      date: new Date(p.createdAt).toISOString().split('T')[0],
      price: p.price * (mainDeal.totalPackageAmount / mainDeal.entryPrice),
    })).slice(-30);
  }, [deals, chartRange]);

  const filteredDeals = deals.filter(d => {
    const matchesFilter = dealFilter === 'all' || d.status === dealFilter;
    const matchesSearch = !dealSearch || d.companyName.toLowerCase().includes(dealSearch.toLowerCase()) || d.ticker.toLowerCase().includes(dealSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const topClients = [...clients].sort((a, b) => getClientPnlPercent(b) - getClientPnlPercent(a)).slice(0, 5);

  const totalPnl = clients.reduce((sum, c) => sum + c.totalPnl, 0);
  const isTotalProfit = totalPnl >= 0;

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 rounded-full animate-pulse" style={{ background: 'rgba(184,161,78,0.2)' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ===== HERO: Globe + Metrics ===== */}
        <section className="relative mb-10">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none -mt-16 -mx-8"
            style={{ background: 'var(--grad-hero-overlay)' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[400px]">
            {/* Left: Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Total AUM"
                value={dashboardData.totalAum}
                prefix="$"
                icon={DollarSign}
                color="#F5F5F0"
                delay={0}
              />
              <StatCard
                label="Active Deals"
                value={dashboardData.activeDealCount}
                icon={BarChart3}
                color="#B8A14E"
                delay={0.15}
              />
              <StatCard
                label="Total Clients"
                value={dashboardData.totalClients}
                icon={Users}
                color="#F5F5F0"
                delay={0.3}
              />
              <StatCard
                label="Avg. Return"
                value={dashboardData.avgReturn}
                prefix="+"
                suffix="%"
                icon={TrendingUp}
                color="#10B981"
                delay={0.45}
              />
            </div>

            {/* Right: Globe */}
            <motion.div
              variants={fadeScale}
              className="relative h-[350px] lg:h-[450px] hidden lg:block"
            >
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full animate-pulse" style={{ background: 'rgba(184,161,78,0.1)' }} />
                </div>
              }>
                <Globe />
              </Suspense>
            </motion.div>
          </div>
        </section>

        {/* ===== QUICK ACTIONS BAR ===== */}
        <motion.section variants={fadeUp} className="mb-10">
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => navigate('/admin/deals/new')}
            >
              <Briefcase size={16} />
              + New Deal
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => navigate('/admin/clients/new')}
            >
              <UserPlus size={16} />
              + Add Client
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => navigate('/admin/materials')}
            >
              <Upload size={16} />
              Upload Materials
            </button>
          </div>
        </motion.section>

        {/* ===== DEALS + CLIENT SNAPSHOT ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Active Deals Panel (2/3) */}
          <motion.div variants={fadeUp} className="lg:col-span-2 glass-panel p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-h2" style={{ color: '#F5F5F0' }}>Active Deals</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="#55555E" />
                  <input
                    type="text"
                    placeholder="Search deals..."
                    value={dealSearch}
                    onChange={(e) => setDealSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl text-[13px] outline-none focus:ring-2"
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F5F5F0',
                      width: 200,
                    }}
                  />
                </div>
                <select
                  value={dealFilter}
                  onChange={(e) => setDealFilter(e.target.value as typeof dealFilter)}
                  className="px-3 py-2 rounded-xl text-[13px] outline-none cursor-pointer"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F5F5F0',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredDeals.map((deal, i) => (
                <DealCard key={deal.id} deal={deal} index={i} allClients={clients} onDeleted={() => {
  dealsApi.getAll().then(data => setDeals(data));
  dashboardApi.getAdmin().then(d => {
    setDashboardData({
      totalAum: d?.totalAum || 0,
      activeDealCount: d?.activeDealCount || 0,
      totalClients: d?.totalClients || 0,
      avgReturn: d?.avgReturn || 0,
    });
  });
}} />
              ))}
              {filteredDeals.length === 0 && (
                <div className="text-center py-12">
                  <img src="/empty-deals.svg" alt="No deals" className="w-32 h-32 mx-auto mb-4 opacity-50" />
                  <p className="text-body" style={{ color: '#8A8A93' }}>No deals found</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <Link
                to="/admin/deals"
                className="inline-flex items-center gap-1 text-[14px] font-medium transition-colors hover:opacity-80"
                style={{ color: '#B8A14E' }}
              >
                View All Deals
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Client Snapshot Panel (1/3) */}
          <motion.div variants={fadeUp} className="glass-panel p-6">
            <h3 className="text-h3 mb-4" style={{ color: '#F5F5F0' }}>Top Performers</h3>
            <div>
              {topClients.map((client, i) => (
                <ClientSnapshotRow key={client.id} client={client} index={i} />
              ))}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <Link
                to="/admin/clients"
                className="inline-flex items-center gap-1 text-[14px] font-medium transition-colors hover:opacity-80"
                style={{ color: '#B8A14E' }}
              >
                View All Clients
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ===== PORTFOLIO PERFORMANCE CHART ===== */}
        <motion.section variants={fadeUp} className="glass-panel p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-h2" style={{ color: '#F5F5F0' }}>Portfolio Performance</h2>
            <div className="flex items-center gap-1">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setChartRange(range)}
                  className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200"
                  style={{
                    background: chartRange === range ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: chartRange === range ? '#F5F5F0' : '#8A8A93',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* P&L Summary */}
          <div className="flex items-center gap-6 mb-6">
            <div>
              <span className="text-caption uppercase block mb-1" style={{ color: '#55555E' }}>Total Unrealized P&L</span>
              <span className="text-mono-m tabular-nums font-medium" style={{ color: isTotalProfit ? '#10B981' : '#EF4444' }}>
                {isTotalProfit ? '+' : ''}{formatCurrency(totalPnl)}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{
              background: isTotalProfit ? 'rgba(16,185,129,0.09)' : 'rgba(239,68,68,0.09)',
            }}>
              {isTotalProfit ? <ArrowUpRight size={14} color="#10B981" /> : <ArrowDownRight size={14} color="#EF4444" />}
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: isTotalProfit ? '#10B981' : '#EF4444' }}>
                {dashboardData.totalAum > 0 ? ((totalPnl / dashboardData.totalAum) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 360 }}>
            <ResponsiveContainer>
              <AreaChart data={portfolioData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B8A14E" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#B8A14E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#55555E', fontFamily: 'Inter' }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#55555E', fontFamily: '"JetBrains Mono", monospace' }}
                  tickFormatter={(v: number) => formatCurrency(v)}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#B8A14E"
                  strokeWidth={2}
                  fill="url(#chartGrad)"
                  dot={false}
                  activeDot={{ r: 6, stroke: '#B8A14E', strokeWidth: 2, fill: '#0A0A0F' }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* ===== RECENT ACTIVITY FEED ===== */}
        <motion.section variants={fadeUp} className="glass-panel p-6">
          <h2 className="text-h2 mb-4" style={{ color: '#F5F5F0' }}>Latest Updates</h2>
          <div className="max-h-[400px] overflow-y-auto pr-1">
            {activities.map((activity, i) => (
              <ActivityRow key={activity.id} activity={activity} index={i} />
            ))}
          </div>
        </motion.section>
      </motion.div>
    </Layout>
  );
}
