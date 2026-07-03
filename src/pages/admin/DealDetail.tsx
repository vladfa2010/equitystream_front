import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { formatCurrency, formatPercent } from '@/data/mockData';
import { dealsApi, clientsApi } from '@/api';
import type { DealResponse, ClientResponse } from '@/api';

function getClientName(c: ClientResponse): string {
  return c.fullName || c.name || 'Unknown';
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [clientInvestors, setClientInvestors] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      dealsApi.getById(id),
      clientsApi.getAll(),
    ]).then(([dealData, allClients]) => {
      setDeal(dealData);
      if (dealData?.investments) {
        const investorIds = dealData.investments.map((i: any) => i.clientId);
        const investors = (allClients || []).filter((c: ClientResponse) =>
          investorIds.includes(c.id)
        );
        setClientInvestors(investors);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin" style={{ color: '#B8A14E' }} />
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout role="admin">
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold mb-4" style={{ color: '#F5F5F0' }}>Deal Not Found</h1>
          <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }} onClick={() => navigate('/admin')}>
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const priceChange = ((deal.currentPrice - deal.entryPrice) / deal.entryPrice) * 100;
  const totalAllocated = (deal.investments || []).reduce((s: number, i: any) => s + i.amount, 0);
  const allocationPercent = deal.totalPackageAmount > 0 ? (totalAllocated / deal.totalPackageAmount) * 100 : 0;
  const isProfit = priceChange >= 0;

  return (
    <Layout role="admin">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin')} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <ArrowLeft size={20} style={{ color: '#8A8A93' }} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(184,161,78,0.15)', color: '#B8A14E' }}>{deal.ticker}</span>
              <span className="px-2 py-1 rounded text-xs" style={{ background: deal.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: deal.status === 'active' ? '#10B981' : '#8A8A93' }}>{deal.status}</span>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>{deal.companyName}</h1>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Package', value: formatCurrency(deal.totalPackageAmount) },
            { label: 'Allocated', value: `${formatCurrency(totalAllocated)} (${allocationPercent.toFixed(0)}%)` },
            { label: 'Clients', value: String(deal.investments?.length || 0), icon: <Users size={16} /> },
            { label: 'Total Return', value: `${isProfit ? '+' : ''}${formatPercent(priceChange)}`, color: isProfit ? '#10B981' : '#EF4444', icon: isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} /> },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8A93' }}>{m.label}</p>
              <div className="flex items-center gap-2">
                {m.icon}
                <p className="text-xl font-bold" style={{ color: m.color || '#F5F5F0', fontFamily: 'JetBrains Mono, monospace' }}>{m.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Price Info */}
        <div className="p-6 rounded-2xl mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Entry Price</p>
              <p className="text-2xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>${deal.entryPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Current Price</p>
              <p className="text-2xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>${deal.currentPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Share Quantity</p>
              <p className="text-2xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{deal.shareQuantity.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Client Investments Table */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#F5F5F0' }}>Client Positions</h2>
          {(deal.investments || []).length === 0 ? (
            <p style={{ color: '#8A8A93' }}>No client investments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="text-left py-3 px-4 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Client</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Investment</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Shares</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Entry Price</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {(deal.investments || []).map((inv: any, idx: number) => {
                    const client = clientInvestors.find(c => c.id === inv.clientId);
                    const shares = inv.amount / inv.entryPrice;
                    const currentValue = shares * deal.currentPrice;
                    const pnl = currentValue - inv.amount;
                    const pnlPercent = inv.amount > 0 ? (pnl / inv.amount) * 100 : 0;
                    const pnlPositive = pnl >= 0;
                    return (
                      <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}>
                              {getClientName(client || { name: inv.clientName } as any).split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#F5F5F0' }}>{getClientName(client || { name: inv.clientName } as any)}</p>
                              {inv.isLead && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(184,161,78,0.15)', color: '#B8A14E' }}>Lead</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{formatCurrency(inv.amount)}</td>
                        <td className="py-3 px-4 text-right text-sm" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{shares.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-sm" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono' }}>${inv.entryPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium" style={{ color: pnlPositive ? '#10B981' : '#EF4444', fontFamily: 'JetBrains Mono' }}>
                            {pnlPositive ? '+' : ''}{formatPercent(pnlPercent)}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
