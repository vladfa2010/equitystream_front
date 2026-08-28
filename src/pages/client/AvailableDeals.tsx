import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building2,
  DollarSign, Users, Globe, ChevronRight, X, Loader2, CheckCircle2,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { dealsApi, clientsApi, authApi } from '@/api';
import type { DealResponse, ClientResponse } from '@/api';
import { formatCurrency } from '@/data/mockData';

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const OPEN_STATUSES = ['Reserve', 'Founding'];

const statusColors: Record<string, { bg: string; text: string }> = {
  Reserve:  { bg: 'rgba(139,92,246,0.15)', text: '#8B5CF6' },
  Founding: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
};

export default function AvailableDeals() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<DealResponse | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [allDeals, clientsEnvelope, user] = await Promise.all([
        dealsApi.getAll(),
        clientsApi.getAll(),
        authApi.me(),
      ]);
      const allClients = clientsEnvelope.data || [];
      // Filter open deals
      const openDeals = allDeals.filter(d => OPEN_STATUSES.includes(d.pipelineStatus));
      // Exclude deals where client already invested
      const me = allClients.find(c => c.email === user?.email) || allClients.find(c => c.id === user?.id);
      setClient(me || null);
      const available = openDeals.filter(d => !d.investments?.some((i: any) => i.userId === me?.id));
      setDeals(available);
    } catch {
      setDeals([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Clear toast after 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleReserve = async () => {
    if (!selectedDeal || !client || !investAmount) return;
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) return;
    setSubmitting(true);
    try {
      await dealsApi.createReservation({
        dealId: selectedDeal.id,
        dealName: selectedDeal.companyName,
        dealTicker: selectedDeal.ticker,
        clientId: client.id,
        clientName: client.name || 'Unknown',
        amount,
        entryPrice: selectedDeal.entryPrice || selectedDeal.currentPrice || 0,
        isLead,
      });
      setSubmitting(false);
      setSelectedDeal(null);
      setInvestAmount('');
      setIsLead(false);
      setToast({ message: `${formatCurrency(amount)} reserved in ${selectedDeal.companyName}`, type: 'success' });
      load(); // Refresh list
    } catch (err: any) {
      setSubmitting(false);
      setToast({ message: err.message || 'Reservation failed', type: 'error' });
    }
  };

  const remainingForDeal = (deal: DealResponse) => {
    const allocated = deal.investments?.reduce((s: number, i: any) => s + i.amount, 0) || 0;
    return deal.totalPackageAmount - allocated;
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="mb-8"
        >
          <h1 className="text-h1 mb-2" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
            Available Deals
          </h1>
          <p className="text-body" style={{ color: '#8A8A93' }}>
            Reserve & Founding deals — commit your allocation
          </p>
        </motion.div>

        {/* Deals list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: '#8A8A93' }}>Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <p className="text-body mb-4" style={{ color: '#8A8A93' }}>No open deals available</p>
            <p className="text-caption" style={{ color: '#55555E' }}>Check back later for new opportunities</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal, i) => {
              const remaining = remainingForDeal(deal);
              const allocated = deal.investments?.reduce((s: number, i: any) => s + i.amount, 0) || 0;
              const allocatedPct = deal.totalPackageAmount > 0 ? (allocated / deal.totalPackageAmount) * 100 : 0;
              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: easeExpo }}
                  className="glass-panel p-5 glass-panel-hover cursor-pointer"
                  onClick={() => { setSelectedDeal(deal); setInvestAmount(''); setIsLead(false); }}
                >
                  {/* Top: ticker + status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[12px] font-bold bg-white/5 text-[#F5F5F0]">
                        {deal.ticker}
                      </span>
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase"
                        style={(statusColors[deal.pipelineStatus] || { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' }) as any}
                      >
                        {deal.pipelineStatus}
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: '#55555E' }} />
                  </div>

                  {/* Company name */}
                  <h3 className="text-h4 mb-1" style={{ color: '#F5F5F0' }}>{deal.companyName}</h3>

                  {/* Metrics row */}
                  <div className="flex items-center gap-4 mb-4 text-[12px]">
                    <span className="flex items-center gap-1" style={{ color: '#8A8A93' }}>
                      <DollarSign size={12} /> Entry: ${deal.entryPrice?.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: '#8A8A93' }}>
                      <Users size={12} /> {deal.investments?.length || 0} investors
                    </span>
                    {deal.website && (
                      <span className="flex items-center gap-1" style={{ color: '#8A8A93' }}>
                        <Globe size={12} /> Website
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px]" style={{ color: '#8A8A93' }}>
                        {formatCurrency(allocated)} allocated
                      </span>
                      <span className="text-[11px]" style={{ color: remaining > 0 ? '#B8A14E' : '#10B981' }}>
                        {remaining > 0 ? `${formatCurrency(remaining)} remaining` : 'Fully allocated'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, allocatedPct)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: easeExpo }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invest Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedDeal(null)} />
            <motion.div
              className="relative w-full max-w-md p-6 rounded-2xl"
              style={{ background: '#14141C', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button onClick={() => setSelectedDeal(null)} className="absolute top-4 right-4 p-2" style={{ color: '#8A8A93' }}>
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,110,247,0.12)', border: '1px solid rgba(79,110,247,0.2)' }}>
                  <Building2 size={20} style={{ color: '#4F6EF7' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                    {selectedDeal.companyName}
                  </h3>
                  <p className="text-[12px]" style={{ color: '#8A8A93' }}>{selectedDeal.ticker} — ${selectedDeal.entryPrice?.toFixed(2)} entry</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                {/* Amount */}
                <div>
                  <label className="text-[12px] mb-1.5 block" style={{ color: '#8A8A93' }}>Reservation Amount ($) *</label>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={e => setInvestAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full text-[14px] px-4 py-3 outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      color: '#F5F5F0',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    autoFocus
                  />
                  {remainingForDeal(selectedDeal) > 0 && (
                    <p className="text-[11px] mt-1" style={{ color: '#55555E' }}>
                      Remaining: {formatCurrency(remainingForDeal(selectedDeal))}
                    </p>
                  )}
                </div>

                {/* Lead investor toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLead}
                    onChange={e => setIsLead(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#B8A14E]"
                  />
                  <span className="text-[13px]" style={{ color: '#F5F5F0' }}>Lead Investor</span>
                </label>

                {/* Summary */}
                {investAmount && parseFloat(investAmount) > 0 && (
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="text-[12px]" style={{ color: '#8A8A93' }}>
                      Shares: <span style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
                        {(parseFloat(investAmount) / selectedDeal.entryPrice).toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedDeal(null)}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReserve}
                    disabled={!investAmount || parseFloat(investAmount) <= 0 || submitting}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {submitting ? 'Reserving...' : 'Reserve'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-[70] px-5 py-3 rounded-xl text-[13px] font-medium"
            style={{
              background: toast.type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
