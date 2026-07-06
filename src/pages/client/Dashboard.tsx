import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import PortfolioMetricCard from '@/components/client/PortfolioMetricCard';
import PositionCard from '@/components/client/PositionCard';
import MaterialMiniCard from '@/components/client/MaterialMiniCard';
import {
  deals, clients, formatCurrency, formatPercent, getPortfolioHistory,
} from '@/data/mockData';
import type { Deal, PricePoint } from '@/data/mockData';

const CLIENT_ID = 'c1';
const TIME_RANGES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 730 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Build portfolio chart data from price history
function buildPortfolioChartData(history: PricePoint[]) {
  return history.map((h, i, arr) => {
    const prev = i > 0 ? arr[i - 1].price : h.price;
    return {
      date: h.date,
      value: h.price,
      change: h.price - prev,
    };
  });
}

// Custom chart tooltip
interface TooltipPayloadItem {
  value: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      className="glass-panel"
      style={{
        padding: '12px 16px',
        borderRadius: 12,
        background: 'rgba(26, 26, 36, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <p className="text-caption" style={{ color: '#55555E', marginBottom: 4 }}>
        {label}
      </p>
      <p className="text-mono-s" style={{ color: '#F5F5F0', fontWeight: 600 }}>
        {formatCurrency(val)}
      </p>
    </div>
  );
}

export default function ClientDashboard() {
  const [timeRange, setTimeRange] = useState('6M');

  const client = useMemo(() => clients.find(c => c.id === CLIENT_ID)!, []);

  // Get deals where this client has an investment
  const clientDeals = useMemo(() => {
    return deals
      .map(deal => {
        const investment = deal.clientInvestments.find(ci => ci.clientId === CLIENT_ID);
        return investment ? { deal, investment } : null;
      })
      .filter((d): d is { deal: Deal; investment: { clientId: string; amount: number; entryPrice: number } } => d !== null);
  }, []);

  // Top-level metrics
  const totalInvested = client.totalInvested;
  const totalPnl = client.totalPnl;
  const portfolioValue = totalInvested + totalPnl;
  const isProfit = totalPnl >= 0;

  // Portfolio history for chart
  const days = TIME_RANGES.find(t => t.label === timeRange)?.days || 180;
  const portfolioHistory = useMemo(() => getPortfolioHistory(days), [days]);
  const chartData = useMemo(() => buildPortfolioChartData(portfolioHistory), [portfolioHistory]);

  // Sparkline data for Total Return card (last 30 points)
  const sparklineData = useMemo(() => {
    return portfolioHistory.slice(-30).map(p => ({ value: p.price }));
  }, [portfolioHistory]);

  // Mini bar distribution for Total Invested card
  const miniBars = useMemo(() => {
    const amounts = clientDeals.map(cd => cd.investment.amount);
    const max = Math.max(...amounts, 1);
    return amounts.map(a => a / max);
  }, [clientDeals]);

  // Materials from all client deals
  const clientMaterials = useMemo(() => {
    const mats: Array<{ material: typeof clientDeals[0]['deal']['materials'][0]; dealName: string }> = [];
    for (const { deal } of clientDeals) {
      for (const material of deal.materials) {
        mats.push({ material, dealName: deal.companyName });
      }
    }
    // Sort by uploadedAt desc, take latest 8
    return mats
      .sort((a, b) => new Date(b.material.uploadedAt).getTime() - new Date(a.material.uploadedAt).getTime())
      .slice(0, 8);
  }, [clientDeals]);

  const scrollMaterials = (dir: 'left' | 'right') => {
    const el = document.getElementById('materials-scroll');
    if (el) {
      const amount = dir === 'left' ? -300 : 300;
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <Layout role="user" showFooter>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto"
        style={{ maxWidth: 1200 }}
      >
        {/* Hero: Animated greeting */}
        <motion.section variants={itemVariants} className="mb-10">
          <motion.h2
            className="text-h2"
            style={{ color: '#F5F5F0', marginBottom: 8 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {getGreeting()}, {client.name.split(' ')[0]}
          </motion.h2>
          <motion.p
            className="text-body-l"
            style={{ color: '#8A8A93' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            Here&apos;s how your investments are performing &mdash; {formatDate()}
          </motion.p>
        </motion.section>

        {/* Key Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <PortfolioMetricCard
            label="Portfolio Value"
            value={formatCurrency(portfolioValue)}
            subValue={isProfit ? `+${formatCurrency(totalPnl)} total gain` : `${formatCurrency(totalPnl)} total loss`}
            isPositive={isProfit}
            sparklineData={sparklineData}
            accentColor="green"
            index={0}
          />
          <PortfolioMetricCard
            label="Total Invested"
            value={formatCurrency(totalInvested)}
            accentColor="gold"
            index={1}
            miniBars={miniBars}
          />
          <PortfolioMetricCard
            label="Total Return"
            value={formatPercent((totalPnl / totalInvested) * 100)}
            subValue={`${isProfit ? '+' : ''}${formatCurrency(totalPnl)}`}
            isPositive={isProfit}
            accentColor={isProfit ? 'green' : 'red'}
            index={2}
          />
        </section>

        {/* Portfolio Performance Chart */}
        <motion.section
          variants={itemVariants}
          className="mb-10"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 16,
            padding: 24,
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-h3" style={{ color: '#F5F5F0' }}>Portfolio Performance</h3>
            <div className="flex items-center gap-1">
              {TIME_RANGES.map(tr => (
                <button
                  key={tr.label}
                  onClick={() => setTimeRange(tr.label)}
                  className="px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all duration-200"
                  style={{
                    background: timeRange === tr.label ? 'rgba(184, 161, 78, 0.15)' : 'transparent',
                    color: timeRange === tr.label ? '#B8A14E' : '#55555E',
                    border: timeRange === tr.label ? '1px solid rgba(184, 161, 78, 0.3)' : '1px solid transparent',
                  }}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isProfit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'} />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.03)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: '#55555E', fontSize: 11, fontFamily: 'Inter, system-ui' }}
                tickFormatter={(val: string) => {
                  const d = new Date(val);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#55555E', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                tickFormatter={(val: number) => formatCurrency(val)}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={totalInvested}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeDasharray="6 4"
                label={{
                  value: 'Your Investment',
                  position: 'insideTopRight',
                  fill: '#55555E',
                  fontSize: 11,
                  fontFamily: 'Inter, system-ui',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isProfit ? '#10B981' : '#EF4444'}
                strokeWidth={2.5}
                fill="url(#portfolioGradient)"
                animationDuration={1800}
                animationEasing="ease-out"
                dot={false}
                activeDot={{ r: 6, fill: '#fff', stroke: isProfit ? '#10B981' : '#EF4444', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.section>

        {/* My Positions */}
        <motion.section variants={itemVariants} className="mb-10">
          <div className="mb-6">
            <h3 className="text-h3" style={{ color: '#F5F5F0', marginBottom: 4 }}>Your Investments</h3>
            <p className="text-body" style={{ color: '#8A8A93' }}>Active positions across all your deals</p>
          </div>

          {clientDeals.length === 0 ? (
            <div
              className="glass-panel text-center py-16"
              style={{ borderRadius: 16 }}
            >
              <img src="/empty-deals.svg" alt="No positions" className="w-32 h-32 mx-auto mb-4 opacity-40" />
              <h4 className="text-h4" style={{ color: '#F5F5F0', marginBottom: 8 }}>No active investments</h4>
              <p className="text-body" style={{ color: '#8A8A93', maxWidth: 400, margin: '0 auto' }}>
                Your deals will appear here once the admin assigns you to a package.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientDeals.map(({ deal, investment }, i) => (
                  <PositionCard
                    key={deal.id}
                    deal={deal}
                    investment={investment}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </motion.section>

        {/* Recent Materials */}
        {clientMaterials.length > 0 && (
          <motion.section variants={itemVariants} className="mb-10">
            <div className="mb-6">
              <h3 className="text-h3" style={{ color: '#F5F5F0', marginBottom: 4 }}>Deal Materials</h3>
              <p className="text-body" style={{ color: '#8A8A93' }}>Documents and resources from your investments</p>
            </div>

            <div className="relative">
              {/* Scroll container */}
              <div
                id="materials-scroll"
                className="flex gap-4 overflow-x-auto pb-4"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'thin',
                  msOverflowStyle: 'none',
                }}
              >
                {clientMaterials.map(({ material, dealName }, i) => (
                  <MaterialMiniCard
                    key={material.id}
                    material={material}
                    dealName={dealName}
                    index={i}
                    compact
                  />
                ))}
              </div>

              {/* Scroll arrows (desktop) */}
              <button
                onClick={() => scrollMaterials('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 items-center justify-center rounded-full glass-panel"
                style={{ zIndex: 10 }}
              >
                <ChevronLeft size={18} color="#8A8A93" />
              </button>
              <button
                onClick={() => scrollMaterials('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 items-center justify-center rounded-full glass-panel"
                style={{ zIndex: 10 }}
              >
                <ChevronRight size={18} color="#8A8A93" />
              </button>

              {/* Fade gradients */}
              <div
                className="hidden md:block absolute left-0 top-0 bottom-4 w-12 pointer-events-none"
                style={{ background: 'linear-gradient(to right, var(--bg-base), transparent)' }}
              />
              <div
                className="hidden md:block absolute right-0 top-0 bottom-4 w-12 pointer-events-none"
                style={{ background: 'linear-gradient(to left, var(--bg-base), transparent)' }}
              />
            </div>
          </motion.section>
        )}
      </motion.div>
    </Layout>
  );
}
