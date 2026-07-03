import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pencil,
  UserX,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Briefcase,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Layout from '@/components/Layout';
import { formatCurrency, formatPercent } from '@/data/mockData';
import type { PricePoint } from '@/data/mockData';
import { clientsApi, dealsApi } from '@/api';
import type { ClientResponse } from '@/api';
import EditClientModal from '@/components/clients/EditClientModal';

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

function getClientName(c: ClientResponse): string {
  return c.fullName || c.name || 'Unknown';
}

interface ClientPosition {
  deal: any;
  investment: any;
  shares: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<ClientResponse | null>(null);
  const [clientDeals, setClientDeals] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [chartRange, setChartRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('ALL');

  // Load client from localStorage API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      clientsApi.getById(id),
      dealsApi.getAll(),
    ]).then(([clientData, allDeals]) => {
      setClient(clientData);
      // Filter deals where this client has investments
      const dealsWithClient = (allDeals || []).filter((d: any) =>
        d.investments?.some((i: any) => i.clientId === id)
      );
      setClientDeals(dealsWithClient);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Compute client's positions across all deals
  const positions: ClientPosition[] = useMemo(() => {
    if (!client || !clientDeals.length) return [];
    const result: ClientPosition[] = [];
    for (const deal of clientDeals) {
      const investment = deal.investments?.find((ci: any) => ci.clientId === client.id);
      if (investment) {
        const shares = investment.amount / investment.entryPrice;
        const currentValue = shares * deal.currentPrice;
        const pnl = currentValue - investment.amount;
        const pnlPercent = (pnl / investment.amount) * 100;
        result.push({ deal, investment, shares, currentValue, pnl, pnlPercent });
      }
    }
    return result;
  }, [client, clientDeals]);

  // Compute portfolio history for this client
  const portfolioHistory: ChartDataPoint[] = useMemo(() => {
    if (!client || positions.length === 0) return [];

    const now = new Date('2025-06-01');
    const rangeMap: Record<string, number> = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      ALL: 730,
    };
    const days = rangeMap[chartRange] || 730;

    const history: ChartDataPoint[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let totalValue = 0;
      for (const pos of positions) {
        const ph = pos.deal.priceHistory.find((p: PricePoint) => p.date === dateStr);
        if (ph) {
          const val = pos.shares * ph.price;
          totalValue += val;
        } else {
          // interpolate from nearest point
          const nearest = pos.deal.priceHistory.reduce(
            (closest: PricePoint, p: PricePoint) => {
              const pd = new Date(p.date).getTime();
              const cd = new Date(closest.date).getTime();
              const td = date.getTime();
              return Math.abs(pd - td) < Math.abs(cd - td) ? p : closest;
            },
            pos.deal.priceHistory[0]
          );
          if (nearest) {
            totalValue += pos.shares * nearest.price;
          }
        }
      }

      if (totalValue > 0) {
        history.push({ date: dateStr, value: Math.round(totalValue) });
      }
    }

    return history;
  }, [client, positions, chartRange]);

  // Summary metrics
  const metrics = useMemo(() => {
    if (!client || positions.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalPnl: 0,
        totalPnlPercent: 0,
        dealCount: 0,
        avgReturn: 0,
      };
    }
    const totalInvested = positions.reduce((s, p) => s + p.investment.amount, 0);
    const currentValue = positions.reduce((s, p) => s + p.currentValue, 0);
    const totalPnl = currentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const avgReturn = positions.reduce((s, p) => s + p.pnlPercent, 0) / positions.length;
    return {
      totalInvested,
      currentValue,
      totalPnl,
      totalPnlPercent,
      dealCount: positions.length,
      avgReturn,
    };
  }, [client, positions]);

  // Client-specific activities (placeholder)
  interface ActivityItem {
    id: string;
    type: string;
    title: string;
    detail: string;
    timestamp: string;
  }
  const clientActivities = useMemo<ActivityItem[]>(() => {
    if (!client) return [];
    return [] as ActivityItem[];
  }, [client]);

  const handleToggleStatus = useCallback(() => {
    if (!client) return;
    setClient({
      ...client,
      status: client.status === 'active' ? 'inactive' : 'active',
    });
  }, [client]);

  const handleSaveClient = useCallback(
    (updated: ClientResponse) => {
      setClient(updated);
    },
    [setClient]
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('');

  if (!client) {
    return (
      <Layout role="admin">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="flex flex-col items-center justify-center py-20"
        >
          <h2 className="text-h2 mb-4" style={{ color: '#F5F5F0' }}>
            Client Not Found
          </h2>
          <p className="text-body mb-6" style={{ color: '#8A8A93' }}>
            The client you are looking for does not exist.
          </p>
          <button onClick={() => navigate('/admin/clients')} className="btn-primary">
            Back to Clients
          </button>
        </motion.div>
      </Layout>
    );
  }

  const isProfit = metrics.totalPnl >= 0;

  const metricItems = [
    { label: 'Total Invested', value: formatCurrency(metrics.totalInvested), color: '#F5F5F0' },
    { label: 'Current Value', value: formatCurrency(metrics.currentValue), color: '#F5F5F0' },
    {
      label: 'Total P&L',
      value: `${isProfit ? '+' : ''}${formatCurrency(metrics.totalPnl)} (${formatPercent(metrics.totalPnlPercent)})`,
      color: isProfit ? '#10B981' : '#EF4444',
    },
    { label: 'Active Deals', value: metrics.dealCount.toString(), color: '#B8A14E' },
    { label: 'Avg Return', value: formatPercent(metrics.avgReturn), color: '#4F6EF7' },
  ];

  return (
    <Layout role="admin">
      <div className="max-w-[1440px] mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeExpo }}
          onClick={() => navigate('/admin/clients')}
          className="flex items-center gap-2 text-[14px] mb-6 transition-colors hover:text-[#B8A14E]"
          style={{ color: '#8A8A93' }}
        >
          <ArrowLeft size={16} />
          Back to Clients
        </motion.button>

        {/* Client Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="flex flex-col sm:flex-row items-start gap-5 mb-8"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            }}
          >
            {client.avatarUrl ? (
              <img
                src={client.avatarUrl}
                alt={getClientName(client)}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '3px solid rgba(184,161,78,0.2)' }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(184, 161, 78, 0.1)',
                  border: '3px solid rgba(184,161,78,0.2)',
                }}
              >
                <span
                  className="text-[24px] font-semibold"
                  style={{
                    fontFamily: "'Clash Display', system-ui, sans-serif",
                    color: 'var(--accent-gold)',
                  }}
                >
                  {getInitials(getClientName(client))}
                </span>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: easeExpo }}
              className="text-h1 mb-1"
              style={{ color: '#F5F5F0' }}
            >
              {getClientName(client)}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: easeExpo }}
              className="text-body mb-1"
              style={{ color: '#8A8A93' }}
            >
              {client.email}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: easeExpo }}
              className="text-caption"
              style={{ color: '#55555E' }}
            >
              Joined {formatDate(client.createdAt.split('T')[0])}
            </motion.p>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: easeExpo }}
            className="flex gap-3 shrink-0"
          >
            <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary flex items-center gap-2">
              <Pencil size={14} />
              Edit Profile
            </button>
            <button
              onClick={handleToggleStatus}
              className="flex items-center gap-2"
              style={{
                background: client.status === 'active' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                border: `1px solid ${client.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                color: client.status === 'active' ? '#EF4444' : '#10B981',
                borderRadius: 10,
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
              }}
            >
              {client.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
              {client.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          </motion.div>
        </motion.div>

        {/* Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeExpo }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
        >
          {metricItems.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.08, ease: easeExpo }}
              className="glass-panel p-4"
            >
              <p className="text-caption mb-2" style={{ color: '#55555E', textTransform: 'uppercase' }}>
                {m.label}
              </p>
              <p className="text-mono-m tabular-nums" style={{ color: m.color, fontSize: 'clamp(14px, 1.6vw, 22px)' }}>
                {m.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Portfolio Performance Chart + Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: easeExpo }}
          className="glass-panel p-5 sm:p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-h3" style={{ color: '#F5F5F0' }}>
              Portfolio Performance
            </h3>
            <div className="flex items-center gap-1">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setChartRange(range)}
                  className="px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all"
                  style={{
                    background: chartRange === range ? 'rgba(184,161,78,0.12)' : 'transparent',
                    color: chartRange === range ? '#B8A14E' : '#8A8A93',
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {portfolioHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={portfolioHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="clientPortfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B8A14E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#B8A14E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                  stroke="#55555E"
                  tick={{ fill: '#55555E', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                />
                <YAxis
                  stroke="#55555E"
                  tick={{ fill: '#55555E', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickFormatter={(v: number) =>
                    v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}k`
                  }
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1A1A24',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  }}
                  labelStyle={{ color: '#8A8A93', fontSize: 12, marginBottom: 4 }}
                  itemStyle={{ color: '#F5F5F0', fontSize: 14, fontWeight: 500 }}
                  formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                  labelFormatter={(label: string) => {
                    const d = new Date(label);
                    return d.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#B8A14E"
                  strokeWidth={2}
                  fill="url(#clientPortfolioGrad)"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px]">
              <p className="text-body" style={{ color: '#55555E' }}>
                No portfolio data available
              </p>
            </div>
          )}
        </motion.div>

        {/* Deal Positions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: easeExpo }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-h2" style={{ color: '#F5F5F0' }}>
              Active Positions
            </h2>
            <span
              className="text-[12px] font-semibold px-2.5 py-1 rounded-md"
              style={{
                background: 'rgba(184, 161, 78, 0.12)',
                color: '#B8A14E',
              }}
            >
              {positions.length}
            </span>
          </div>

          {positions.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Briefcase size={40} style={{ color: '#55555E' }} className="mx-auto mb-4" />
              <h3 className="text-h4 mb-2" style={{ color: '#F5F5F0' }}>
                No Active Positions
              </h3>
              <p className="text-body" style={{ color: '#8A8A93' }}>
                This client is not currently invested in any deals.
              </p>
            </div>
          ) : (
            <div className="glass-panel overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Deal', 'Entry Price', 'Current Price', 'Shares', 'Position Value', 'P&L', 'Investment'].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-caption"
                          style={{
                            color: '#55555E',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, i) => {
                    const posProfit = pos.pnl >= 0;
                    const priceChange = pos.deal.currentPrice - pos.investment.entryPrice;
                    const priceChangePercent = (priceChange / pos.investment.entryPrice) * 100;

                    return (
                      <motion.tr
                        key={pos.deal.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 * i, ease: easeExpo }}
                        onClick={() => navigate(`/admin/deals/${pos.deal.id}`)}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Deal */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: 'rgba(79,110,247,0.12)' }}
                            >
                              <span
                                className="text-[11px] font-bold"
                                style={{ color: '#4F6EF7', fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                {pos.deal.ticker.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="text-[14px] font-medium" style={{ color: '#F5F5F0' }}>
                                {pos.deal.companyName}
                              </p>
                              <p className="text-caption" style={{ color: '#55555E' }}>
                                {pos.deal.ticker}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Entry Price */}
                        <td className="py-3.5 px-4">
                          <span className="text-mono-s tabular-nums" style={{ color: '#F5F5F0' }}>
                            ${pos.investment.entryPrice.toFixed(2)}
                          </span>
                        </td>

                        {/* Current Price */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-mono-s tabular-nums" style={{ color: '#F5F5F0' }}>
                              ${pos.deal.currentPrice.toFixed(2)}
                            </span>
                            <span
                              className="text-caption tabular-nums"
                              style={{ color: priceChange >= 0 ? '#10B981' : '#EF4444' }}
                            >
                              {priceChange >= 0 ? '+' : ''}
                              {priceChangePercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>

                        {/* Shares */}
                        <td className="py-3.5 px-4">
                          <span className="text-mono-s tabular-nums" style={{ color: '#F5F5F0' }}>
                            {pos.shares.toFixed(2)}
                          </span>
                        </td>

                        {/* Position Value */}
                        <td className="py-3.5 px-4">
                          <span className="text-mono-s tabular-nums font-medium" style={{ color: '#F5F5F0' }}>
                            {formatCurrency(pos.currentValue)}
                          </span>
                        </td>

                        {/* P&L */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {posProfit ? (
                              <TrendingUp size={14} style={{ color: '#10B981' }} />
                            ) : (
                              <TrendingDown size={14} style={{ color: '#EF4444' }} />
                            )}
                            <span
                              className="text-mono-s tabular-nums font-medium"
                              style={{
                                color: posProfit ? '#10B981' : '#EF4444',
                              }}
                            >
                              {formatPercent(pos.pnlPercent)}
                            </span>
                          </div>
                        </td>

                        {/* Investment */}
                        <td className="py-3.5 px-4">
                          <span className="text-mono-s tabular-nums" style={{ color: '#8A8A93' }}>
                            {formatCurrency(pos.investment.amount)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: easeExpo }}
        >
          <h2 className="text-h2 mb-4" style={{ color: '#F5F5F0' }}>
            Recent Activity
          </h2>

          <div className="flex flex-col gap-3">
            {clientActivities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.06, ease: easeExpo }}
                className="glass-panel p-4 flex items-start gap-4"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background:
                      activity.type === 'deal_created'
                        ? 'rgba(79,110,247,0.12)'
                        : activity.type === 'price_updated'
                          ? 'rgba(16,185,129,0.12)'
                          : activity.type === 'client_added'
                            ? 'rgba(184,161,78,0.12)'
                            : activity.type === 'deal_closed'
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(139,92,246,0.12)',
                  }}
                >
                  {activity.type === 'deal_created' && <Briefcase size={18} style={{ color: '#4F6EF7' }} />}
                  {activity.type === 'price_updated' && (
                    <TrendingUp size={18} style={{ color: '#10B981' }} />
                  )}
                  {activity.type === 'client_added' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8A14E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  )}
                  {activity.type === 'material_uploaded' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  )}
                  {activity.type === 'deal_closed' && <TrendingDown size={18} style={{ color: '#EF4444' }} />}
                  {activity.type === 'client_joined' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium" style={{ color: '#F5F5F0' }}>
                    {activity.title}
                  </p>
                  <p className="text-caption" style={{ color: '#8A8A93' }}>
                    {activity.detail}
                  </p>
                </div>
                <span className="text-caption shrink-0" style={{ color: '#55555E' }}>
                  {(() => {
                    const d = new Date(activity.timestamp);
                    const now = new Date('2025-06-01T10:00:00Z');
                    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
                    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                    return `${Math.floor(diff / 86400)}d ago`;
                  })()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Edit Client Modal */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveClient}
        client={client || null}
      />
    </Layout>
  );
}
