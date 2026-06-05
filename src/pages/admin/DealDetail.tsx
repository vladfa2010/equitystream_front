import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { deals } from '@/data/mockData';
import Layout from '@/components/Layout';

export default function DealDetailAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deal = deals.find(d => d.id === id);

  return (
    <Layout role="admin">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-[14px] mb-6 transition-colors hover:text-[#B8A14E]"
          style={{ color: '#8A8A93' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="glass-panel p-12 text-center">
          <h1 className="text-h1 mb-4" style={{ color: '#F5F5F0' }}>
            {deal ? `${deal.ticker} — ${deal.companyName}` : 'Deal Not Found'}
          </h1>
          <p className="text-body mb-8" style={{ color: '#8A8A93' }}>
            Full deal management: edit allocations, set current price, attach materials, view client positions.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary" onClick={() => navigate('/admin')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
