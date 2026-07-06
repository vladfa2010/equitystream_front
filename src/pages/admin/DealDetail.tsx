import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown, Users, Loader2,
  Pencil, Trash2, X, Plus, CheckCircle2, Crown,
  Link as LinkIcon, ExternalLink,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { formatCurrency, formatPercent } from '@/data/mockData';
import { dealsApi, clientsApi, authApi } from '@/api';
import type { DealResponse, ClientResponse, PriceHistoryItem } from '@/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

function getClientName(c: ClientResponse | any): string {
  return c?.fullName || c?.name || 'Unknown';
}

/* ─── input style helpers ─── */
const inpBase: React.CSSProperties = {
  background: '#14141C',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '12px 16px',
  color: '#F5F5F0',
  fontSize: 14,
  width: '100%',
  outline: 'none',
  fontFamily: 'Inter, system-ui, sans-serif',
};
const inpFocus = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#B8A14E';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  },
};

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deal, setDeal] = useState<DealResponse | null>(null);
  const [allClients, setAllClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  /* edit modal state */
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DealResponse>>({});
  const [saving, setSaving] = useState(false);

  /* delete deal modal */
  const [showDeleteDeal, setShowDeleteDeal] = useState(false);
  const [confirmDealName, setConfirmDealName] = useState('');
  const [deletingDeal, setDeletingDeal] = useState(false);

  /* delete investment */
  const [invToDelete, setInvToDelete] = useState<string | null>(null);

  /* add client modal */
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addIsLead, setAddIsLead] = useState(false);
  const [adding, setAdding] = useState(false);

  /* inline price edit */
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  /* price history */
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [addPriceValue, setAddPriceValue] = useState('');
  const [addPriceAdmin, setAddPriceAdmin] = useState('');
  const [addPriceSource, setAddPriceSource] = useState('');
  const [addingPrice, setAddingPrice] = useState(false);

  /* edit price history row */
  const [editingPriceRow, setEditingPriceRow] = useState<string | null>(null);
  const [editPriceRowValue, setEditPriceRowValue] = useState('');
  const [editPriceRowAdmin, setEditPriceRowAdmin] = useState('');
  const [editPriceRowSource, setEditPriceRowSource] = useState('');
  const [savingPriceRow, setSavingPriceRow] = useState(false);

  /* delete price history */
  const [priceToDelete, setPriceToDelete] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    Promise.all([dealsApi.getById(id), clientsApi.getAll(), dealsApi.getPriceHistory(id), authApi.me()])
      .then(([d, c, ph, admin]) => {
        setDeal(d);
        setAllClients(c || []);
        setPriceHistory(ph || []);
        setAddPriceAdmin(admin?.name || 'Admin');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* ────────── open edit modal ────────── */
  const openEdit = () => {
    if (!deal) return;
    setEditForm({
      companyName: deal.companyName,
      ticker: deal.ticker,
      exchange: deal.exchange,
      sector: deal.sector,
      description: deal.description,
      totalPackageAmount: deal.totalPackageAmount,
      entryPrice: deal.entryPrice,
      marketCap: deal.marketCap,
      website: deal.website,
      founder: deal.founder,
      managementFeePercent: deal.managementFeePercent,
      targetPrice: deal.targetPrice,
      timeHorizon: deal.timeHorizon,
      status: deal.status,
    });
    setShowEdit(true);
  };

  /* ────────── save edit ────────── */
  const handleSaveEdit = async () => {
    if (!deal || !id) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const payload: any = { ...editForm };
    if (payload.totalPackageAmount && payload.entryPrice) {
      payload.shareQuantity = payload.totalPackageAmount / payload.entryPrice;
    }
    /* API update */
    await dealsApi.update(id, payload);
    setSaving(false); setShowEdit(false); load();
  };

  /* ────────── delete deal ────────── */
  const handleDeleteDeal = async () => {
    if (!deal || confirmDealName !== deal.companyName) return;
    setDeletingDeal(true);
    await dealsApi.delete(deal.id);
    setDeletingDeal(false); setShowDeleteDeal(false); setConfirmDealName('');
    navigate('/admin/deals');
  };

  /* ────────── remove investment ────────── */
  const handleRemoveInvestment = async (invId: string) => {
    if (!deal || !id) return;
    await dealsApi.removeInvestment(id, invId);
    setInvToDelete(null);
    load();
  };

  /* ────────── add client ────────── */
  const handleAddClient = async () => {
    if (!deal || !id || !selectedClientId || !addAmount) return;
    setAdding(true);
    const amt = parseFloat(addAmount);
    await dealsApi.addInvestment(id, { clientId: selectedClientId, amount: amt, isLead: addIsLead });
    /* API — investment already added above */
    setAdding(false); setShowAddClient(false); setSelectedClientId(''); setAddAmount(''); setAddIsLead(false); load();
  };

  /* ────────── inline price update (current price) ────────── */
  const handlePriceUpdate = async () => {
    if (!deal || !id || !newPrice) return;
    const price = parseFloat(newPrice);
    await dealsApi.addPriceHistory(id, { price, changedByAdmin: addPriceAdmin || 'Admin' });
    setEditingPrice(false); setNewPrice(''); load();
  };

  /* ────────── add price history entry ────────── */
  const handleAddPrice = async () => {
    if (!deal || !id || !addPriceValue) return;
    setAddingPrice(true);
    const price = parseFloat(addPriceValue);
    await dealsApi.addPriceHistory(id, {
      price,
      changedByAdmin: addPriceAdmin || 'Admin',
      sourceUrl: addPriceSource || null,
    });
    setAddingPrice(false);
    setShowAddPrice(false);
    setAddPriceValue('');
    setAddPriceSource('');
    load();
  };

  /* ────────── edit price history row ────────── */
  const handleEditPriceRow = async (priceId: string) => {
    if (!editPriceRowValue) return;
    setSavingPriceRow(true);
    await dealsApi.updatePriceHistory(priceId, {
      price: parseFloat(editPriceRowValue),
      changedByAdmin: editPriceRowAdmin || 'Admin',
      sourceUrl: editPriceRowSource || null,
    });
    setSavingPriceRow(false);
    setEditingPriceRow(null);
    setEditPriceRowValue('');
    setEditPriceRowAdmin('');
    setEditPriceRowSource('');
    load();
  };

  /* ────────── delete price history row ────────── */
  const handleDeletePriceRow = async (priceId: string) => {
    await dealsApi.deletePriceHistory(priceId);
    setPriceToDelete(null);
    load();
  };

  /* ────────── start editing price row ────────── */
  const startEditPriceRow = (item: PriceHistoryItem) => {
    setEditingPriceRow(item.id);
    setEditPriceRowValue(String(item.price));
    setEditPriceRowAdmin(item.changedByAdmin || '');
    setEditPriceRowSource(item.sourceUrl || '');
  };

  if (loading) return <Layout role="admin"><div className="flex justify-center py-32"><Loader2 size={32} className="animate-spin" style={{ color: '#B8A14E' }} /></div></Layout>;
  if (!deal) return <Layout role="admin"><div className="text-center py-20"><h1 className="text-2xl font-semibold mb-4" style={{ color: '#F5F5F0' }}>Deal Not Found</h1><button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }} onClick={() => navigate('/admin')}>Back to Dashboard</button></div></Layout>;

  const priceChange = ((deal.currentPrice - deal.entryPrice) / deal.entryPrice) * 100;
  const totalAllocated = (deal.investments || []).reduce((s: number, i: any) => s + i.amount, 0);
  const allocationPercent = deal.totalPackageAmount > 0 ? (totalAllocated / deal.totalPackageAmount) * 100 : 0;
  const isProfit = priceChange >= 0;

  /* clients not yet in deal */
  const existingClientIds = new Set((deal.investments || []).map((i: any) => i.clientId));
  const availableClients = allClients.filter(c => !existingClientIds.has(c.id) && c.status === 'active');

  return (
    <Layout role="admin">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ═══════ HEADER ═══════ */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin/deals')} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <ArrowLeft size={20} style={{ color: '#8A8A93' }} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(184,161,78,0.15)', color: '#B8A14E' }}>{deal.ticker}</span>
              <span
                className="px-2 py-1 rounded text-xs"
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
              >{deal.status}</span>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>{deal.companyName}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={openEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Pencil size={14} /> Edit
            </button>
            <button onClick={() => { setShowDeleteDeal(true); setConfirmDealName(''); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* ═══════ METRICS ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Package', value: formatCurrency(deal.totalPackageAmount) },
            { label: 'Allocated', value: `${formatCurrency(totalAllocated)} (${allocationPercent.toFixed(0)}%)` },
            { label: 'Clients', value: String(deal.investments?.length || 0), icon: <Users size={16} /> },
            { label: 'Total Return', value: `${isProfit ? '+' : ''}${formatPercent(priceChange)}`, color: isProfit ? '#10B981' : '#EF4444', icon: isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} /> },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8A93' }}>{m.label}</p>
              <div className="flex items-center gap-2">{m.icon}<p className="text-xl font-bold" style={{ color: m.color || '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{m.value}</p></div>
            </motion.div>
          ))}
        </div>

        {/* ═══════ PRICE + DETAILS ═══════ */}
        <div className="p-6 rounded-2xl mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Entry Price</p><p className="text-xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>${deal.entryPrice.toFixed(2)}</p></div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Current Price</p>
              {editingPrice ? (
                <div className="flex items-center gap-2 justify-center">
                  <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-24 px-2 py-1 rounded text-sm text-center" style={{ ...inpBase, padding: '6px' }} autoFocus />
                  <button onClick={handlePriceUpdate} className="p-1 rounded" style={{ background: 'rgba(16,185,129,0.2)' }}><CheckCircle2 size={14} style={{ color: '#10B981' }} /></button>
                  <button onClick={() => setEditingPrice(false)} className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}><X size={14} style={{ color: '#8A8A93' }} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                  <p className="text-xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>${deal.currentPrice.toFixed(2)}</p>
                  <button onClick={() => { setNewPrice(String(deal.currentPrice)); setEditingPrice(true); }} className="p-1 rounded hover:bg-white/5"><Pencil size={12} style={{ color: '#8A8A93' }} /></button>
                </div>
              )}
            </div>
            <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Shares</p><p className="text-xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{deal.shareQuantity.toFixed(2)}</p></div>
            <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Fee</p><p className="text-xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{deal.managementFeePercent}%</p></div>
            <div><p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>Target</p><p className="text-xl font-bold" style={{ color: deal.targetPrice ? '#B8A14E' : '#55555E', fontFamily: 'JetBrains Mono' }}>{deal.targetPrice ? `$${deal.targetPrice.toFixed(2)}` : '—'}</p></div>
          </div>
          {deal.website && <p className="text-center text-xs mt-4" style={{ color: '#8A8A93' }}><a href={deal.website} target="_blank" rel="noopener noreferrer" style={{ color: '#B8A14E' }}>{deal.website}</a></p>}
          {deal.founder && <p className="text-center text-xs mt-1" style={{ color: '#8A8A93' }}>Founder: {deal.founder}</p>}
          {deal.description && <p className="text-center text-xs mt-1" style={{ color: '#8A8A93' }}>{deal.description}</p>}
        </div>

        {/* ═══════ CLIENT POSITIONS ═══════ */}
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#F5F5F0' }}>Client Positions</h2>
            <button onClick={() => setShowAddClient(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}><Plus size={14} /> Add Client</button>
          </div>
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
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Entry</th>
                    <th className="text-right py-3 px-4 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>P&L</th>
                    <th className="text-right py-3 px-4" style={{ color: '#8A8A93' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(deal.investments || []).map((inv: any, idx: number) => {
                    const client = allClients.find((c: any) => c.id === inv.clientId);
                    const shares = inv.amount / inv.entryPrice;
                    const pnl = (shares * deal.currentPrice) - inv.amount;
                    const pnlPercent = inv.amount > 0 ? (pnl / inv.amount) * 100 : 0;
                    return (
                      <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}>
                              {getClientName(client || { name: inv.clientName }).split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#F5F5F0' }}>{getClientName(client || { name: inv.clientName })}</p>
                              {inv.isLead && <span className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1 inline-flex" style={{ background: 'rgba(184,161,78,0.15)', color: '#B8A14E' }}><Crown size={10} /> Lead</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{formatCurrency(inv.amount)}</td>
                        <td className="py-3 px-4 text-right text-sm" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{shares.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-sm" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono' }}>${inv.entryPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right"><span className="text-sm font-medium" style={{ color: pnl >= 0 ? '#10B981' : '#EF4444', fontFamily: 'JetBrains Mono' }}>{pnl >= 0 ? '+' : ''}{formatPercent(pnlPercent)}</span></td>
                        <td className="py-3 px-4 text-right">
                          {invToDelete === inv.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleRemoveInvestment(inv.id)} className="p-1 rounded" style={{ background: 'rgba(239,68,68,0.2)' }}><CheckCircle2 size={14} style={{ color: '#EF4444' }} /></button>
                              <button onClick={() => setInvToDelete(null)} className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}><X size={14} style={{ color: '#8A8A93' }} /></button>
                            </div>
                          ) : (
                            <button onClick={() => setInvToDelete(inv.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity" style={{ color: '#EF4444' }}><Trash2 size={14} /></button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ═══════ PRICE HISTORY CHART ═══════ */}
        {priceHistory.length > 0 && (
          <div className="p-6 rounded-2xl mt-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#F5F5F0' }}>Price History</h2>
            <PriceHistoryChart priceHistory={priceHistory} entryPrice={deal?.entryPrice || 0} />
          </div>
        )}

        {/* ═══════ PRICE HISTORY TABLE ═══════ */}
        <div className="p-6 rounded-2xl mt-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#F5F5F0' }}>Price History</h2>
              <p className="text-xs mt-0.5" style={{ color: '#8A8A93' }}>{priceHistory.length} record{priceHistory.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => { setShowAddPrice(true); setAddPriceValue(''); setAddPriceSource(''); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}><Plus size={14} /> Add Last Price</button>
          </div>

          {priceHistory.length === 0 ? (
            <p style={{ color: '#8A8A93' }}>No price history yet. Click "Add Last Price" to add the first entry.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Date</th>
                    <th className="text-right py-3 px-3 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Price</th>
                    <th className="text-right py-3 px-3 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Change</th>
                    <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Admin</th>
                    <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: '#8A8A93' }}>Source</th>
                    <th className="text-right py-3 px-3" style={{ color: '#8A8A93' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map((item, idx) => {
                    const prevPrice = idx < priceHistory.length - 1 ? priceHistory[idx + 1].price : deal?.entryPrice || item.price;
                    const change = ((item.price - prevPrice) / prevPrice) * 100;
                    const isPositive = change >= 0;
                    const isEditing = editingPriceRow === item.id;
                    const isDeleting = priceToDelete === item.id;

                    return (
                      <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="group" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-3 px-3 text-sm" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                          {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {item.updatedAt && <span className="ml-1 text-[10px]" style={{ color: '#8A8A93' }}>(edited)</span>}
                        </td>
                        <td className="py-3 px-3 text-right" style={{ fontFamily: 'JetBrains Mono' }}>
                          {isEditing ? (
                            <input type="number" value={editPriceRowValue} onChange={e => setEditPriceRowValue(e.target.value)} className="w-24 px-2 py-1 rounded text-sm text-right" style={{ ...inpBase, padding: '6px' }} autoFocus />
                          ) : (
                            <span className="text-sm font-medium" style={{ color: '#F5F5F0' }}>${item.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!isEditing && (
                            <span className="text-xs font-medium" style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
                              {isPositive ? '+' : ''}{change.toFixed(2)}%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <input type="text" value={editPriceRowAdmin} onChange={e => setEditPriceRowAdmin(e.target.value)} className="w-28 px-2 py-1 rounded text-sm" style={{ ...inpBase, padding: '6px' }} />
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(184,161,78,0.1)', color: '#B8A14E' }}>{item.changedByAdmin || '—'}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <input type="url" value={editPriceRowSource} onChange={e => setEditPriceRowSource(e.target.value)} placeholder="https://..." className="w-40 px-2 py-1 rounded text-sm" style={{ ...inpBase, padding: '6px' }} />
                          ) : item.sourceUrl ? (
                            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: '#B8A14E' }}>
                              <LinkIcon size={10} /> Source <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-xs" style={{ color: '#55555E' }}>—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => handleEditPriceRow(item.id)} disabled={savingPriceRow} className="p-1 rounded" style={{ background: 'rgba(16,185,129,0.2)' }}><CheckCircle2 size={14} style={{ color: '#10B981' }} /></button>
                              <button onClick={() => { setEditingPriceRow(null); }} className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}><X size={14} style={{ color: '#8A8A93' }} /></button>
                            </div>
                          ) : isDeleting ? (
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => handleDeletePriceRow(item.id)} className="p-1 rounded" style={{ background: 'rgba(239,68,68,0.2)' }}><CheckCircle2 size={14} style={{ color: '#EF4444' }} /></button>
                              <button onClick={() => setPriceToDelete(null)} className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}><X size={14} style={{ color: '#8A8A93' }} /></button>
                            </div>
                          ) : (
                            <div className={`flex items-center gap-1 justify-end transition-opacity ${editingPriceRow === null ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                              <button onClick={() => startEditPriceRow(item)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: '#8A8A93' }}><Pencil size={13} /></button>
                              <button onClick={() => setPriceToDelete(item.id)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: '#EF4444' }}><Trash2 size={13} /></button>
                            </div>
                          )}
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

      {/* ════════════════════════════════════════════════
          EDIT DEAL MODAL
          ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEdit && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowEdit(false)} />
            <motion.div className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px) saturate(140%)', border: '1px solid rgba(255,255,255,0.08)' }} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}>
              <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 p-2" style={{ color: '#8A8A93' }}><X size={18} /></button>
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Edit Deal</h2>
              <p className="text-sm mb-6" style={{ color: '#8A8A93' }}>{deal.companyName}</p>

              <div className="flex flex-col gap-4">
                {/* Company Info */}
                <div className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: '#B8A14E' }}>Company Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Company Name *</label><input type="text" value={editForm.companyName || ''} onChange={e => setEditForm({ ...editForm, companyName: e.target.value })} style={inpBase} {...inpFocus} /></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Ticker *</label><input type="text" value={editForm.ticker || ''} onChange={e => setEditForm({ ...editForm, ticker: e.target.value.toUpperCase() })} style={inpBase} {...inpFocus} /></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Exchange</label><select value={editForm.exchange || ''} onChange={e => setEditForm({ ...editForm, exchange: e.target.value })} style={inpBase} {...inpFocus}><option>NASDAQ</option><option>NYSE</option><option>AMEX</option><option>OTC</option><option>OTHER</option></select></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Sector</label><select value={editForm.sector || ''} onChange={e => setEditForm({ ...editForm, sector: e.target.value })} style={inpBase} {...inpFocus}><option>Technology</option><option>Healthcare</option><option>Finance</option><option>Energy</option><option>Consumer</option><option>Industrial</option><option>Materials</option><option>Utilities</option><option>Real Estate</option><option>Telecom</option></select></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Status</label><select value={editForm.status || ''} onChange={e => setEditForm({ ...editForm, status: e.target.value as any })} style={inpBase} {...inpFocus}><option value="draft">Draft</option><option value="Pipeline">Pipeline</option><option value="Skip">Skip</option><option value="Reserve">Reserve</option><option value="Founding">Founding</option><option value="Deal done">Deal done</option><option value="Wait IPO">Wait IPO</option><option value="Lock-up">Lock-up</option><option value="Exit">Exit</option></select></div>
                    <div className="col-span-2"><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Description</label><textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={2} style={inpBase} {...inpFocus} /></div>
                  </div>
                </div>

                {/* Financial */}
                <div className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: '#B8A14E' }}>Financial Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Total Volume ($)</label><input type="number" value={editForm.totalPackageAmount || ''} onChange={e => setEditForm({ ...editForm, totalPackageAmount: parseFloat(e.target.value) })} style={inpBase} {...inpFocus} /></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Share Price ($)</label><input type="number" value={editForm.entryPrice || ''} onChange={e => setEditForm({ ...editForm, entryPrice: parseFloat(e.target.value) })} style={inpBase} {...inpFocus} /></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Market Cap</label><input type="number" value={editForm.marketCap || ''} onChange={e => setEditForm({ ...editForm, marketCap: parseFloat(e.target.value) || null })} style={inpBase} {...inpFocus} /></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Management Fee (%)</label><input type="number" step="0.01" value={editForm.managementFeePercent || ''} onChange={e => setEditForm({ ...editForm, managementFeePercent: parseFloat(e.target.value) })} style={inpBase} {...inpFocus} /></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Target Price ($)</label><input type="number" value={editForm.targetPrice || ''} onChange={e => setEditForm({ ...editForm, targetPrice: parseFloat(e.target.value) || null })} style={inpBase} {...inpFocus} /></div>
                    <div><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Time Horizon</label><input type="date" value={editForm.timeHorizon ? editForm.timeHorizon.split('T')[0] : ''} onChange={e => setEditForm({ ...editForm, timeHorizon: e.target.value || null })} style={inpBase} {...inpFocus} /></div>
                  </div>
                </div>

                {/* Extra */}
                <div className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: '#B8A14E' }}>Additional</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Website</label><input type="url" value={editForm.website || ''} onChange={e => setEditForm({ ...editForm, website: e.target.value || null })} style={inpBase} {...inpFocus} /></div>
                    <div className="col-span-2"><label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Founder(s)</label><input type="text" value={editForm.founder || ''} onChange={e => setEditForm({ ...editForm, founder: e.target.value || null })} style={inpBase} {...inpFocus} /></div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowEdit(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                  <button onClick={handleSaveEdit} disabled={saving || !editForm.companyName || !editForm.ticker} className="flex-[2] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F', opacity: saving ? 0.5 : 1 }}>{saving && <Loader2 size={14} className="animate-spin" />}{saving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          DELETE DEAL MODAL
          ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDeleteDeal && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowDeleteDeal(false)} />
            <motion.div className="relative w-full max-w-md p-6 rounded-2xl" style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)' }} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></div>
                <div><h3 className="text-lg font-semibold" style={{ color: '#F5F5F0' }}>Delete Deal</h3><p className="text-sm" style={{ color: '#8A8A93' }}>This action cannot be undone.</p></div>
              </div>
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-sm mb-2" style={{ color: '#F5F5F0' }}>Type the deal name to confirm:</p>
                <p className="text-sm font-semibold" style={{ color: '#B8A14E' }}>{deal.companyName}</p>
              </div>
              <input type="text" value={confirmDealName} onChange={e => setConfirmDealName(e.target.value)} placeholder={`Type "${deal.companyName}"`} className="w-full px-4 py-3 rounded-xl text-sm mb-4 outline-none" style={{ background: '#0A0A0F', border: `1px solid ${confirmDealName === deal.companyName ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`, color: '#F5F5F0' }} autoFocus />
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteDeal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                <button onClick={handleDeleteDeal} disabled={confirmDealName !== deal.companyName || deletingDeal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: confirmDealName === deal.companyName && !deletingDeal ? '#EF4444' : 'rgba(239,68,68,0.2)', color: '#F5F5F0', opacity: confirmDealName === deal.companyName && !deletingDeal ? 1 : 0.4 }}>{deletingDeal ? 'Deleting...' : 'Delete Deal'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          ADD LAST PRICE MODAL
          ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddPrice && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddPrice(false)} />
            <motion.div className="relative w-full max-w-md p-6 rounded-2xl" style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)' }} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <button onClick={() => setShowAddPrice(false)} className="absolute top-4 right-4 p-2" style={{ color: '#8A8A93' }}><X size={18} /></button>
              <h3 className="text-xl font-bold mb-1" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Add Last Price</h3>
              <p className="text-sm mb-6" style={{ color: '#8A8A93' }}>{deal?.companyName} ({deal?.ticker})</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Current Price ($) *</label>
                  <input type="number" step="0.01" value={addPriceValue} onChange={e => setAddPriceValue(e.target.value)} placeholder="e.g. 198.45" style={inpBase} {...inpFocus} autoFocus />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Admin *</label>
                  <input type="text" value={addPriceAdmin} onChange={e => setAddPriceAdmin(e.target.value)} placeholder="Your name" style={inpBase} {...inpFocus} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Source URL</label>
                  <input type="url" value={addPriceSource} onChange={e => setAddPriceSource(e.target.value)} placeholder="https://finance.yahoo.com/quote/..." style={inpBase} {...inpFocus} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddPrice(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                  <button onClick={handleAddPrice} disabled={!addPriceValue || addingPrice} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F', opacity: addPriceValue && !addingPrice ? 1 : 0.5 }}>{addingPrice && <Loader2 size={14} className="animate-spin" />}{addingPrice ? 'Adding...' : 'Add Price'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          ADD CLIENT MODAL
          ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddClient && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddClient(false)} />
            <motion.div className="relative w-full max-w-md p-6 rounded-2xl" style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)' }} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <button onClick={() => setShowAddClient(false)} className="absolute top-4 right-4 p-2" style={{ color: '#8A8A93' }}><X size={18} /></button>
              <h3 className="text-xl font-bold mb-1" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Add Client</h3>
              <p className="text-sm mb-6" style={{ color: '#8A8A93' }}>{deal.companyName}</p>

              {availableClients.length === 0 ? (
                <p style={{ color: '#8A8A93' }}>No available clients. Create a client first.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Client *</label>
                    <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} style={inpBase} {...inpFocus}>
                      <option value="">Select client...</option>
                      {availableClients.map(c => <option key={c.id} value={c.id}>{getClientName(c)} ({c.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#8A8A93' }}>Investment Amount ($) *</label>
                    <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="e.g. 50000" style={inpBase} {...inpFocus} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setAddIsLead(!addIsLead)} className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ border: '1px solid rgba(255,255,255,0.2)', background: addIsLead ? '#B8A14E' : 'transparent' }}>{addIsLead && <CheckCircle2 size={14} style={{ color: '#0A0A0F' }} />}</button>
                    <span className="text-sm" style={{ color: '#F5F5F0' }}>Lead Investor</span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowAddClient(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                    <button onClick={handleAddClient} disabled={!selectedClientId || !addAmount || adding} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F', opacity: selectedClientId && addAmount && !adding ? 1 : 0.5 }}>{adding ? 'Adding...' : 'Add Client'}</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

/* ═══════════════════════════════════════════
   PRICE HISTORY BAR CHART (shared component)
   ═══════════════════════════════════════════ */
function PriceHistoryChart({ priceHistory, entryPrice }: { priceHistory: PriceHistoryItem[]; entryPrice: number }) {
  const chartData = useMemo(() => {
    const sorted = [...priceHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted.map((p, i, arr) => {
      const prevPrice = i > 0 ? arr[i - 1].price : entryPrice;
      const change = p.price - prevPrice;
      return {
        date: p.createdAt ? p.createdAt.split('T')[0] : '',
        price: p.price,
        change,
        isUp: change >= 0,
        admin: p.changedByAdmin || '—',
      };
    });
  }, [priceHistory, entryPrice]);

  const minPrice = Math.min(...chartData.map(d => d.price), entryPrice) * 0.98;
  const maxPrice = Math.max(...chartData.map(d => d.price), entryPrice) * 1.02;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          stroke="#55555E"
          tick={{ fill: '#55555E', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
        />
        <YAxis
          stroke="#55555E"
          tick={{ fill: '#55555E', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          domain={[minPrice, maxPrice]}
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
          labelFormatter={(label: string) => {
            const d = new Date(label);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }}
        />
        <ReferenceLine
          y={entryPrice}
          stroke="#8A8A93"
          strokeDasharray="4 4"
          strokeWidth={1}
          label={{
            value: `Entry: $${entryPrice.toFixed(2)}`,
            fill: '#8A8A93',
            fontSize: 11,
            position: 'insideBottomRight',
          }}
        />
        <Bar dataKey="price" radius={[4, 4, 0, 0]} animationDuration={1500}>
          {chartData.map((entry, index) => (
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
  );
}
