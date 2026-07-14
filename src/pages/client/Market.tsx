import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign,
  Users, Activity, ChevronRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { dealsApi, authApi } from '@/api';
import type { DealResponse } from '@/api';
import { formatCurrency } from '@/data/mockData';

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const TRADE_STATUSES = ['Pipeline', 'Reserve', 'Founding', 'Deal done', 'Wait IPO', 'Lock-up'];

export default function Market() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dealsApi.getAll().then(all => {
      const tradeDeals = all.filter(d => TRADE_STATUSES.includes(d.status));
      setDeals(tradeDeals);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Calculate order book stats for each deal
  const dealsWithStats = useMemo(() => {
    return deals.map(deal => {
      const orders = deal.investments || [];
      const totalShares = orders.reduce((s: number, o: any) => s + (o.shareCount || 0), 0);
      const lastPrice = deal.currentPrice || deal.entryPrice || 0;
      const change = deal.entryPrice ? ((lastPrice - deal.entryPrice) / deal.entryPrice) * 100 : 0;
      return { deal, totalShares, lastPrice, change };
    });
  }, [deals]);

  return (
    <Layout role="user" showFooter>
      <div className="max-w-[1440px] mx-auto">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="mb-8"
        >
          <h1 className="text-h1 mb-2" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
            Marketplace
          </h1>
          <p className="text-body" style={{ color: '#8A8A93' }}>
            Trade shares with other investors
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: '#8A8A93' }}>Loading market...</p>
          </div>
        ) : dealsWithStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-body" style={{ color: '#8A8A93' }}>No deals available for trading</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dealsWithStats.map(({ deal, totalShares, lastPrice, change }, i) => {
              const isUp = change >= 0;
              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: easeExpo }}
                  className="glass-panel p-5 glass-panel-hover cursor-pointer"
                  onClick={() => navigate(`/market/${deal.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[12px] font-bold bg-white/5 text-[#F5F5F0]">
                        {deal.ticker}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase" style={{
                        background: deal.status === 'Founding' ? 'rgba(245,158,11,0.15)' : deal.status === 'Reserve' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)',
                        color: deal.status === 'Founding' ? '#F59E0B' : deal.status === 'Reserve' ? '#8B5CF6' : '#10B981',
                      }}>
                        {deal.status}
                      </span>
                    </div>
                    <ChevronRight size={16} style={{ color: '#55555E' }} />
                  </div>

                  <h3 className="text-h4 mb-1" style={{ color: '#F5F5F0' }}>{deal.companyName}</h3>

                  <div className="flex items-center gap-4 mb-4 text-[12px]">
                    <span className="flex items-center gap-1" style={{ color: '#8A8A93' }}>
                      <Activity size={12} /> Last: ${lastPrice.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 font-medium" style={{ color: isUp ? '#10B981' : '#EF4444' }}>
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isUp ? '+' : ''}{change.toFixed(2)}%
                    </span>
                    <span className="flex items-center gap-1" style={{ color: '#8A8A93' }}>
                      <Users size={12} /> {deal.investments?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[12px]">
                    <span style={{ color: '#55555E' }}>
                      Shares: <span style={{ color: '#F5F5F0' }}>{totalShares.toFixed(2)}</span>
                    </span>
                    <span style={{ color: '#55555E' }}>
                      Entry: <span style={{ color: '#F5F5F0' }}>${deal.entryPrice?.toFixed(2)}</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
