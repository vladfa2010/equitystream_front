import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { deals } from '@/data/mockData';
import Layout from '@/components/Layout';

export default function ClientDealView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deal = deals.find(d => d.id === id);

  return (
    <Layout role="client" showFooter>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[14px] mb-6 transition-colors hover:text-[#B8A14E]"
          style={{ color: '#8A8A93' }}
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </button>

        <div className="glass-panel p-12 text-center">
          <h1 className="text-h1 mb-4" style={{ color: '#F5F5F0' }}>
            {deal ? `${deal.ticker} — ${deal.companyName}` : 'Deal Not Found'}
          </h1>
          <p className="text-body mb-8" style={{ color: '#8A8A93' }}>
            Client's view of a single deal: their position, entry vs current price, deal materials.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Back to Portfolio
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
