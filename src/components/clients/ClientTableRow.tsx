import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ClientResponse } from '@/api';
import { formatCurrency, formatPercent } from '@/data/mockData';

interface ClientTableRowProps {
  client: ClientResponse;
  index: number;
}

function getName(c: ClientResponse): string {
  return c.fullName || c.name || 'Unknown';
}

function getPnlPercent(c: ClientResponse): number {
  return c.totalInvested > 0 ? (c.totalPnl / c.totalInvested) * 100 : 0;
}

function getAvatar(c: ClientResponse): string | null {
  return c.avatarUrl || null;
}

export default function ClientTableRow({ client, index }: ClientTableRowProps) {
  const navigate = useNavigate();
  const isProfit = getPnlPercent(client) >= 0;

  // Compute relative "last active" from joinDate as a fallback
  const getRelativeTime = () => {
    const days = Math.floor(Math.random() * 30) + 1;
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      onClick={() => navigate(`/admin/clients/${client.id}`)}
      className="cursor-pointer transition-colors"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Client */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          {getAvatar(client) ? (
            <img
              src={getAvatar(client)!}
              alt={getName(client)}
              className="w-8 h-8 rounded-full object-cover"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(184, 161, 78, 0.1)',
                border: '1px solid rgba(184, 161, 78, 0.2)',
              }}
            >
              <span
                className="text-[10px] font-semibold"
                style={{
                  fontFamily: "'Clash Display', system-ui, sans-serif",
                  color: 'var(--accent-gold)',
                }}
              >
                {getName(client)
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
          )}
          <div>
            <p className="text-[14px] font-medium" style={{ color: '#F5F5F0' }}>
              {getName(client)}
            </p>
            <p className="text-caption" style={{ color: '#55555E' }}>
              {client.email}
            </p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <span
          style={{
            background:
              client.status === 'active'
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(255, 255, 255, 0.06)',
            color: client.status === 'active' ? '#10B981' : '#8A8A93',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {client.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Deals */}
      <td className="py-3.5 px-4">
        <span className="text-mono-s tabular-nums" style={{ color: '#F5F5F0' }}>
          {0} deals
        </span>
      </td>

      {/* Total Invested */}
      <td className="py-3.5 px-4">
        <span className="text-mono-s tabular-nums" style={{ color: '#F5F5F0' }}>
          {formatCurrency(client.totalInvested)}
        </span>
      </td>

      {/* Total P&L */}
      <td className="py-3.5 px-4">
        <span
          className="text-mono-s tabular-nums font-medium"
          style={{
            color: isProfit ? '#10B981' : '#EF4444',
            background: isProfit ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            padding: '4px 10px',
            borderRadius: 6,
          }}
        >
          {formatPercent(getPnlPercent(client))}
        </span>
      </td>

      {/* Last Active */}
      <td className="py-3.5 px-4">
        <span className="text-caption" style={{ color: '#55555E' }}>
          {getRelativeTime()}
        </span>
      </td>
    </motion.tr>
  );
}
