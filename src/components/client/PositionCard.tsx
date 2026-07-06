import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { Deal } from '@/data/mockData';
import { formatCurrency, formatPercent } from '@/data/mockData';
import Sparkline from './Sparkline';

interface PositionCardProps {
  deal: Deal;
  investment: { clientId: string; amount: number; entryPrice: number };
  index?: number;
}

export default function PositionCard({ deal, investment, index = 0 }: PositionCardProps) {
  const navigate = useNavigate();
  const shares = investment.amount / investment.entryPrice;
  const currentValue = shares * deal.currentPrice;
  const pnl = currentValue - investment.amount;
  const pnlPercent = (pnl / investment.amount) * 100;
  const isProfit = pnl >= 0;

  // Generate 7-day sparkline from price history
  const sparkData = deal.priceHistory
    .slice(-7)
    .map(p => ({ value: p.price }));

  const leftBorderColor = isProfit
    ? 'rgba(16, 185, 129, 0.3)'
    : 'rgba(239, 68, 68, 0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      onClick={() => navigate(`/deals/${deal.id}`)}
      className="cursor-pointer glass-panel-hover"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderLeft: `3px solid ${leftBorderColor}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--glass-shadow)',
        transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
      }}
    >
      {/* Top row: ticker + status */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-mono-s"
          style={{
            color: '#B8A14E',
            background: 'rgba(184, 161, 78, 0.1)',
            borderRadius: 6,
            padding: '4px 10px',
            fontWeight: 600,
          }}
        >
          {deal.ticker}
        </span>
        <span
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase"
          style={(() => {
            const c: Record<string, React.CSSProperties> = {
              draft:       { background: 'rgba(107,114,128,0.15)', color: '#6B7280' },
              Pipeline:    { background: 'rgba(79,110,247,0.15)',  color: '#4F6EF7' },
              Reserve:     { background: 'rgba(139,92,246,0.15)',  color: '#8B5CF6' },
              Founding:    { background: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
              'Deal done': { background: 'rgba(16,185,129,0.15)',  color: '#10B981' },
              'Wait IPO':  { background: 'rgba(6,182,212,0.15)',   color: '#06B6D4' },
              'Lock-up':   { background: 'rgba(234,179,8,0.15)',   color: '#EAB308' },
              Exit:        { background: 'rgba(239,68,68,0.15)',    color: '#EF4444' },
            };
            return c[deal.status] || c['draft'];
          })()}
        >
          {deal.status}
        </span>
      </div>

      {/* Company name */}
      <h4 className="text-h4" style={{ color: '#F5F5F0', marginBottom: 16 }}>
        {deal.companyName}
      </h4>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-caption" style={{ color: '#55555E', marginBottom: 4 }}>Invested</p>
          <p className="text-mono-m" style={{ color: '#F5F5F0' }}>{formatCurrency(investment.amount)}</p>
        </div>
        <div>
          <p className="text-caption" style={{ color: '#55555E', marginBottom: 4 }}>Current Value</p>
          <p className="text-mono-m" style={{ color: '#F5F5F0' }}>{formatCurrency(currentValue)}</p>
        </div>
        <div>
          <p className="text-caption" style={{ color: '#55555E', marginBottom: 4 }}>Entry Price</p>
          <p className="text-mono-s" style={{ color: '#F5F5F0' }}>${investment.entryPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-caption" style={{ color: '#55555E', marginBottom: 4 }}>Current Price</p>
          <p className="text-mono-s" style={{ color: '#F5F5F0' }}>${deal.currentPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* P&L */}
      <div className="flex items-center gap-2 mb-4">
        {isProfit ? <TrendingUp size={16} color="#10B981" /> : <TrendingDown size={16} color="#EF4444" />}
        <span
          className="text-mono-m"
          style={{ color: isProfit ? '#10B981' : '#EF4444' }}
        >
          {formatPercent(pnlPercent)}
        </span>
        <span className="text-caption" style={{ color: '#55555E' }}>
          ({isProfit ? '+' : ''}{formatCurrency(pnl)})
        </span>
      </div>

      {/* Sparkline */}
      {sparkData.length > 0 && (
        <div className="mb-4">
          <Sparkline
            data={sparkData}
            color={isProfit ? '#10B981' : '#EF4444'}
            width="100%"
            height={40}
          />
        </div>
      )}

      {/* Footer link */}
      <div className="flex items-center gap-1" style={{ color: '#8A8A93' }}>
        <span className="text-caption" style={{ fontWeight: 500 }}>View Details</span>
        <ArrowRight size={14} />
      </div>
    </motion.div>
  );
}
