import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ClientResponse } from '@/api';
import { formatCurrency, formatPercent } from '@/data/mockData';

interface ClientCardProps {
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

export default function ClientCard({ client, index }: ClientCardProps) {
  const navigate = useNavigate();
  const isProfit = getPnlPercent(client) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="glass-panel-hover cursor-pointer"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: '1px solid var(--glass-border)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--glass-shadow)',
        transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
      }}
      onClick={() => navigate(`/admin/clients/${client.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
        e.currentTarget.style.boxShadow =
          '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: avatar + name + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getAvatar(client) ? (
            <img
              src={getAvatar(client)!}
              alt={getName(client)}
              className="w-12 h-12 rounded-full object-cover"
              style={{ border: '2px solid rgba(255,255,255,0.06)' }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(184, 161, 78, 0.1)',
                border: '2px solid rgba(184, 161, 78, 0.2)',
              }}
            >
              <span
                className="text-[16px] font-semibold"
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
            <h4 className="text-h4" style={{ color: '#F5F5F0' }}>
              {getName(client)}
            </h4>
            <p className="text-caption" style={{ color: '#55555E' }}>
              {client.email}
            </p>
          </div>
        </div>
        <span
          className="shrink-0"
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
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-caption mb-1" style={{ color: '#55555E' }}>
            Total Invested
          </p>
          <p className="text-mono-s tabular-nums" style={{ color: '#F5F5F0' }}>
            {formatCurrency(client.totalInvested)}
          </p>
        </div>
        <div>
          <p className="text-caption mb-1" style={{ color: '#55555E' }}>
            Total P&L
          </p>
          <p
            className="text-mono-s tabular-nums"
            style={{ color: isProfit ? '#10B981' : '#EF4444' }}
          >
            {formatPercent(getPnlPercent(client))}
          </p>
        </div>
        <div>
          <p className="text-caption mb-1" style={{ color: '#55555E' }}>
            Role
          </p>
          <span
            className="text-mono-s uppercase"
            style={{
              color: client.role === 'superadmin' ? '#EF4444' : client.role === 'admin' ? '#8B5CF6' : '#4F6EF7',
              background: client.role === 'superadmin' ? 'rgba(239,68,68,0.12)' : client.role === 'admin' ? 'rgba(139,92,246,0.12)' : 'rgba(79,110,247,0.12)',
              borderRadius: 6,
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {client.role === 'superadmin' ? 'SUPERADMIN' : client.role === 'admin' ? 'ADMIN' : 'USER'}
          </span>
        </div>
        <div>
          <p className="text-caption mb-1" style={{ color: '#55555E' }}>
            P&L Amount
          </p>
          <p
            className="text-mono-s tabular-nums"
            style={{ color: isProfit ? '#10B981' : '#EF4444' }}
          >
            {isProfit ? '+' : ''}
            {formatCurrency(client.totalPnl || 0)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span
          className="text-[13px] font-medium transition-colors"
          style={{ color: '#8A8A93' }}
        >
          View Profile
        </span>
        <ArrowRight size={14} style={{ color: '#8A8A93' }} />
      </div>
    </motion.div>
  );
}
