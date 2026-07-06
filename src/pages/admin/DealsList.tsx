import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  ArrowLeft,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Users,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { dealsApi } from '@/api';
import type { DealResponse } from '@/api';
import { formatCurrency, formatPercent } from '@/data/mockData';

function getAllocatedPercent(deal: DealResponse): number {
  const allocated = (deal.investments || []).reduce((s: number, i: any) => s + i.amount, 0);
  return deal.totalPackageAmount > 0 ? (allocated / deal.totalPackageAmount) * 100 : 0;
}

function getPriceChange(deal: DealResponse): number {
  return ((deal.currentPrice - deal.entryPrice) / deal.entryPrice) * 100;
}

export default function DealsList() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'Pipeline' | 'Skip' | 'Reserve' | 'Founding' | 'Deal done' | 'Wait IPO' | 'Lock-up' | 'Exit'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'volume' | 'return'>('newest');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; deal: DealResponse | null }>({ open: false, deal: null });
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = () => {
    setLoading(true);
    dealsApi.getAll().then(data => {
      setDeals(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!deleteModal.deal || confirmName !== deleteModal.deal.companyName) return;
    setDeleting(true);
    try {
      await dealsApi.delete(deleteModal.deal.id);
      setDeleteModal({ open: false, deal: null });
      setConfirmName('');
      loadDeals();
    } catch (err) {
      alert('Failed to delete: ' + String(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...deals];

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(d => ACTIVE_STATUSES.includes(d.status));
      } else {
        result = result.filter(d => d.status === statusFilter);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.companyName.toLowerCase().includes(q) ||
        d.ticker.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'volume':
        result.sort((a, b) => b.totalPackageAmount - a.totalPackageAmount);
        break;
      case 'return':
        result.sort((a, b) => getPriceChange(b) - getPriceChange(a));
        break;
    }

    return result;
  }, [deals, statusFilter, search, sortBy]);

  const ACTIVE_STATUSES = ['Pipeline', 'Skip', 'Reserve', 'Founding', 'Deal done', 'Wait IPO'];

  const stats = useMemo(() => {
    const active = deals.filter(d => ACTIVE_STATUSES.includes(d.status));
    const totalAum = active.reduce((s, d) => s + d.totalPackageAmount, 0);
    const avgReturn = active.length
      ? active.reduce((s, d) => s + getPriceChange(d), 0) / active.length
      : 0;
    return {
      total: deals.length,
      active: active.length,
      totalAum,
      avgReturn,
    };
  }, [deals]);

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin" style={{ color: '#B8A14E' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <ArrowLeft size={20} style={{ color: '#8A8A93' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
              All Deals
            </h1>
            <p className="text-sm" style={{ color: '#8A8A93' }}>{stats.total} deals total</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => navigate('/admin/deals/new')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
            >
              <Plus size={16} /> New Deal
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Deals', value: stats.total, icon: <Briefcase size={16} /> },
            { label: 'Active', value: stats.active, icon: <Briefcase size={16} style={{ color: '#10B981' }} /> },
            { label: 'Total AUM', value: formatCurrency(stats.totalAum), icon: <TrendingUp size={16} /> },
            { label: 'Avg Return', value: `${stats.avgReturn >= 0 ? '+' : ''}${formatPercent(stats.avgReturn)}`, color: stats.avgReturn >= 0 ? '#10B981' : '#EF4444', icon: stats.avgReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8A8A93' }}>{s.label}</p>
              <div className="flex items-center gap-2">
                {s.icon}
                <p className="text-xl font-bold" style={{ color: s.color || '#F5F5F0', fontFamily: 'JetBrains Mono' }}>{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company or ticker..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F0' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F0' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (all)</option>
            <option value="draft">Draft</option>
            <option value="Pipeline">Pipeline</option>
            <option value="Skip">Skip</option>
            <option value="Reserve">Reserve</option>
            <option value="Founding">Founding</option>
            <option value="Deal done">Deal done</option>
            <option value="Wait IPO">Wait IPO</option>
            <option value="Lock-up">Lock-up</option>
            <option value="Exit">Exit</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)', color: '#F5F5F0' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="volume">By Volume</option>
            <option value="return">By Return</option>
          </select>
        </div>

        {/* Deals Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-8 gap-4 px-6 py-3 text-xs uppercase tracking-wider" style={{ color: '#8A8A93', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="col-span-2">Company</div>
            <div className="text-center">Status</div>
            <div className="text-right">Volume</div>
            <div className="text-right">Entry Price</div>
            <div className="text-right">Current</div>
            <div className="text-right">Return</div>
            <div className="text-right">Clients</div>
            <div></div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase size={32} style={{ color: '#55555E', margin: '0 auto 12px' }} />
              <p style={{ color: '#8A8A93' }}>No deals found</p>
            </div>
          ) : (
            filtered.map((deal, i) => {
              const priceChange = getPriceChange(deal);
              const allocated = getAllocatedPercent(deal);
              const isProfit = priceChange >= 0;
              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-1 md:grid-cols-8 gap-4 px-6 py-4 items-center cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onClick={() => navigate(`/admin/deals/${deal.id}`)}
                >
                  {/* Company */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(184,161,78,0.15)', color: '#B8A14E' }}>
                      {deal.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#F5F5F0' }}>{deal.companyName}</p>
                      <p className="text-xs" style={{ color: '#8A8A93' }}>{deal.ticker} &middot; {allocated.toFixed(0)}% allocated</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase" style={(() => {
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
                    })()}>
                      {deal.status}
                    </span>
                  </div>

                  {/* Volume */}
                  <div className="text-right text-sm" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>
                    {formatCurrency(deal.totalPackageAmount)}
                  </div>

                  {/* Entry */}
                  <div className="text-right text-sm" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono' }}>
                    ${deal.entryPrice.toFixed(2)}
                  </div>

                  {/* Current */}
                  <div className="text-right text-sm" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono' }}>
                    ${deal.currentPrice.toFixed(2)}
                  </div>

                  {/* Return */}
                  <div className="text-right">
                    <span className="text-sm font-medium" style={{ color: isProfit ? '#10B981' : '#EF4444', fontFamily: 'JetBrains Mono' }}>
                      {isProfit ? '+' : ''}{formatPercent(priceChange)}
                    </span>
                  </div>

                  {/* Clients */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users size={14} style={{ color: '#8A8A93' }} />
                      <span className="text-sm" style={{ color: '#F5F5F0' }}>{(deal.investments || []).length}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="text-right relative">
                    <button
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === deal.id ? null : deal.id); }}
                    >
                      <MoreHorizontal size={16} style={{ color: '#8A8A93' }} />
                    </button>
                    {menuOpenId === deal.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-8 w-36 py-1 rounded-xl z-40" style={{ background: '#1A1A22', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                          <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-white/5 transition-colors" style={{ color: '#F5F5F0' }} onClick={(e) => { e.stopPropagation(); navigate(`/admin/deals/${deal.id}`); setMenuOpenId(null); }}>View</button>
                          <button className="w-full text-left px-4 py-2 text-[13px] hover:bg-white/5 transition-colors" style={{ color: '#EF4444' }} onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); setDeleteModal({ open: true, deal }); setConfirmName(''); }}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.open && deleteModal.deal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) { setDeleteModal({ open: false, deal: null }); setConfirmName(''); } }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-6 rounded-2xl" style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#F5F5F0' }}>Delete Deal</h3>
                <p className="text-sm" style={{ color: '#8A8A93' }}>This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-sm mb-2" style={{ color: '#F5F5F0' }}>To confirm, type the deal name:</p>
              <p className="text-sm font-semibold" style={{ color: '#B8A14E' }}>{deleteModal.deal.companyName}</p>
            </div>
            <input
              type="text"
              value={confirmName}
              onChange={e => setConfirmName(e.target.value)}
              placeholder={`Type "${deleteModal.deal.companyName}"`}
              className="w-full px-4 py-3 rounded-xl text-sm mb-4 outline-none"
              style={{ background: '#0A0A0F', border: `1px solid ${confirmName === deleteModal.deal.companyName ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`, color: '#F5F5F0' }}
              autoFocus
            />
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }} onClick={() => { setDeleteModal({ open: false, deal: null }); setConfirmName(''); }}>Cancel</button>
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                disabled={confirmName !== deleteModal.deal!.companyName || deleting}
                style={{ background: confirmName === deleteModal.deal!.companyName && !deleting ? '#EF4444' : 'rgba(239,68,68,0.2)', color: '#F5F5F0', opacity: confirmName === deleteModal.deal!.companyName && !deleting ? 1 : 0.4, cursor: confirmName === deleteModal.deal!.companyName && !deleting ? 'pointer' : 'not-allowed' }}
                onClick={handleDelete}
              >
                {deleting ? 'Deleting...' : 'Delete Deal'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
