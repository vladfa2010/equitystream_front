import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown,
  ExternalLink, FileText, Image as ImageIcon, Video,
  Globe, DollarSign, Calendar, Building2, User,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import Layout from '@/components/Layout';
import { dealsApi, clientsApi, authApi } from '@/api';
import type { DealResponse, ClientResponse, PriceHistoryItem } from '@/api';
import { formatCurrency, formatPercent } from '@/data/mockData';

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function ClientDealView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      dealsApi.getById(id),
      authApi.me(),
      dealsApi.getPriceHistory(id),
    ])
      .then(([dealData, user, ph]) => {
        if (dealData) {
          setDeal(dealData);
          setPriceHistory(ph || []);
          // Find client by matching email or use first investment client
          clientsApi.getAll().then(allClients => {
            const matched = allClients.find(
              (c: ClientResponse) => c.email === user?.email || dealData.investments?.some((i: any) => i.clientId === c.id)
            );
            setClient(matched || allClients[0] || null);
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Find client's investment in this deal
  const myInvestment = useMemo(() => {
    if (!deal || !client) return null;
    return deal.investments?.find((i: any) => i.clientId === client.id);
  }, [deal, client]);

  // Chart data from price history (sorted oldest first for chart)
  const chartData = useMemo(() => {
    if (!deal || priceHistory.length === 0) return [];
    const sorted = [...priceHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted.map((p: PriceHistoryItem, i: number, arr: PriceHistoryItem[]) => {
      const prevPrice = i > 0 ? arr[i - 1].price : (myInvestment?.entryPrice || deal?.entryPrice || p.price);
      const change = p.price - prevPrice;
      return {
        date: p.createdAt ? p.createdAt.split('T')[0] : '',
        price: p.price,
        change,
        isUp: change >= 0,
      };
    });
  }, [deal, priceHistory, myInvestment]);

  // Position calculations
  const shares = myInvestment ? myInvestment.amount / myInvestment.entryPrice : 0;
  const currentValue = shares * (deal?.currentPrice || 0);
  const invested = myInvestment?.amount || 0;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
  const isProfit = pnl >= 0;

  if (loading) {
    return (
      <Layout role="user" showFooter>
        <div className="flex items-center justify-center py-20">
          <p style={{ color: '#8A8A93' }}>Loading deal...</p>
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout role="user" showFooter>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="flex flex-col items-center justify-center py-20"
        >
          <h2 className="text-h2 mb-4" style={{ color: '#F5F5F0' }}>Deal Not Found</h2>
          <p className="text-body mb-6" style={{ color: '#8A8A93' }}>
            This deal does not exist or you do not have access to it.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Portfolio
          </button>
        </motion.div>
      </Layout>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Layout role="user" showFooter>
      <div className="max-w-[1440px] mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easeExpo }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[14px] mb-6 transition-colors hover:text-[#B8A14E]"
          style={{ color: '#8A8A93' }}
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </motion.button>

        {/* Deal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="flex flex-col sm:flex-row items-start gap-5 mb-8"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.2)' }}
          >
            <Building2 size={28} style={{ color: '#4F6EF7' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-h1" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                {deal.companyName}
              </h1>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={(() => {
                  const c: Record<string, React.CSSProperties> = {
                    draft:       { background: 'rgba(107,114,128,0.15)', color: '#6B7280' },
                    Pipeline:    { background: 'rgba(79,110,247,0.15)',  color: '#4F6EF7' },
                    Skip:        { background: 'rgba(100,116,139,0.15)', color: '#64748B' },
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
            <div className="flex flex-wrap items-center gap-3 text-[13px]" style={{ color: '#8A8A93' }}>
              <span className="flex items-center gap-1">
                <DollarSign size={13} />
                <span className="font-semibold" style={{ color: '#B8A14E', fontFamily: "'JetBrains Mono', monospace" }}>{deal.ticker}</span>
              </span>
              {deal.website && (
                <a href={deal.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#B8A14E] transition-colors">
                  <Globe size={13} />
                  Website
                  <ExternalLink size={11} />
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(deal.createdAt)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* My Position Panel */}
        {myInvestment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: easeExpo }}
            className="glass-panel p-5 sm:p-6 mb-8"
            style={{ borderLeft: `4px solid ${isProfit ? '#10B981' : '#EF4444'}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <User size={16} style={{ color: '#B8A14E' }} />
              <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#B8A14E' }}>My Position</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-caption mb-1" style={{ color: '#55555E', textTransform: 'uppercase' }}>Shares</p>
                <p className="text-mono-m" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                  {shares.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-caption mb-1" style={{ color: '#55555E', textTransform: 'uppercase' }}>Invested</p>
                <p className="text-mono-m" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatCurrency(invested)}
                </p>
              </div>
              <div>
                <p className="text-caption mb-1" style={{ color: '#55555E', textTransform: 'uppercase' }}>Current Value</p>
                <p className="text-mono-m" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatCurrency(currentValue)}
                </p>
              </div>
              <div>
                <p className="text-caption mb-1" style={{ color: '#55555E', textTransform: 'uppercase' }}>P&L</p>
                <div className="flex items-center gap-1.5">
                  {isProfit ? <TrendingUp size={16} color="#10B981" /> : <TrendingDown size={16} color="#EF4444" />}
                  <p className="text-mono-m" style={{ color: isProfit ? '#10B981' : '#EF4444', fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatPercent(pnlPercent)}
                  </p>
                </div>
                <p className="text-caption" style={{ color: isProfit ? '#10B981' : '#EF4444' }}>
                  {isProfit ? '+' : ''}{formatCurrency(pnl)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Deal Overview Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeExpo }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-8"
        >
          {[
            { label: 'Share Price', value: `$${(deal.currentPrice || 0).toFixed(2)}`, color: '#F5F5F0' },
            { label: 'Entry Price', value: `$${(deal.entryPrice || 0).toFixed(2)}`, color: '#8A8A93' },
            { label: 'Shares', value: `${(deal.shareQuantity || 0).toLocaleString()}`, color: '#B8A14E' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.08, ease: easeExpo }}
              className="glass-panel p-3 sm:p-5"
            >
              <p className="text-[10px] sm:text-caption mb-1" style={{ color: '#55555E', textTransform: 'uppercase' }}>
                {m.label}
              </p>
              <p className="text-[13px] sm:text-mono-m font-semibold" style={{ color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {m.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Price History Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: easeExpo }}
            className="glass-panel p-5 sm:p-6 mb-8"
          >
            <h3 className="text-h3 mb-4" style={{ color: '#F5F5F0' }}>Price History</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  stroke="#55555E"
                  tick={{ fill: '#55555E', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                />
                <YAxis
                  stroke="#55555E"
                  tick={{ fill: '#55555E', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1A1A24',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 16px',
                  }}
                  labelStyle={{ color: '#8A8A93', fontSize: 12, marginBottom: 4 }}
                  itemStyle={{ color: '#F5F5F0', fontSize: 14, fontWeight: 500 }}
                  formatter={(value: number, _name: string, props: any) => {
                    const change = props?.payload?.change;
                    const sign = change >= 0 ? '+' : '';
                    return [`$${value.toFixed(2)} (${sign}${change?.toFixed(2)})`, 'Price'];
                  }}
                />
                {myInvestment && (
                  <ReferenceLine
                    y={myInvestment.entryPrice}
                    stroke="#8A8A93"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{
                      value: `My Entry: $${myInvestment.entryPrice.toFixed(2)}`,
                      fill: '#8A8A93',
                      fontSize: 11,
                      position: 'insideBottomRight',
                    }}
                  />
                )}
                <Bar dataKey="price" radius={[4, 4, 0, 0]} animationDuration={1500}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isUp ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)'}
                      stroke={entry.isUp ? '#10B981' : '#EF4444'}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Price History Table */}
        {priceHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: easeExpo }}
            className="glass-panel p-5 sm:p-6 mb-8"
          >
            <h3 className="text-h3 mb-4" style={{ color: '#F5F5F0' }}>All Price Updates</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="text-left py-3 px-3 text-[11px] uppercase" style={{ color: '#55555E' }}>Date</th>
                    <th className="text-right py-3 px-3 text-[11px] uppercase" style={{ color: '#55555E' }}>Price</th>
                    <th className="text-left py-3 px-3 text-[11px] uppercase" style={{ color: '#55555E' }}>Admin</th>
                    <th className="text-left py-3 px-3 text-[11px] uppercase" style={{ color: '#55555E' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="py-3 px-3 text-[12px]" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right text-[12px] font-medium" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'rgba(184,161,78,0.1)', color: '#B8A14E' }}>
                          {item.changedByAdmin || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {item.sourceUrl ? (
                          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] flex items-center gap-1 hover:underline" style={{ color: '#B8A14E' }}>
                            <ExternalLink size={10} /> Source
                          </a>
                        ) : (
                          <span className="text-[11px]" style={{ color: '#55555E' }}>—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Materials */}
        {deal.materials && deal.materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: easeExpo }}
            className="mb-8"
          >
            <h3 className="text-h3 mb-4" style={{ color: '#F5F5F0' }}>Deal Materials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {deal.materials.map((mat: any, i: number) => (
                <motion.a
                  key={mat.id}
                  href={mat.url || mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.05, ease: easeExpo }}
                  className="glass-panel p-4 flex items-center gap-3 hover:border-[#B8A14E]/30 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: mat.type === 'pdf' ? 'rgba(239,68,68,0.12)' : mat.type === 'video' ? 'rgba(139,92,246,0.12)' : 'rgba(16,185,129,0.12)' }}
                  >
                    {mat.type === 'pdf' ? <FileText size={18} style={{ color: '#EF4444' }} /> :
                     mat.type === 'video' ? <Video size={18} style={{ color: '#8B5CF6' }} /> :
                     <ImageIcon size={18} style={{ color: '#10B981' }} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: '#F5F5F0' }}>{mat.title || mat.name}</p>
                    <p className="text-[11px] uppercase" style={{ color: '#55555E' }}>{mat.type}</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto shrink-0" style={{ color: '#55555E' }} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
