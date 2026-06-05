import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';
import Layout from '@/components/Layout';

export default function ClientDashboard() {
  const navigate = useNavigate();

  return (
    <Layout role="client" showFooter>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <div className="glass-panel p-12 text-center">
          <LayoutDashboard size={48} className="mx-auto mb-4" color="#B8A14E" />
          <h1 className="text-h1 mb-4" style={{ color: '#F5F5F0' }}>My Portfolio</h1>
          <p className="text-body mb-8 max-w-lg mx-auto" style={{ color: '#8A8A93' }}>
            Client landing page: portfolio summary, active positions, P&L chart, recent materials.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary" onClick={() => navigate('/')}>
              Switch to Admin View
            </button>
            <button className="btn-secondary" onClick={() => navigate('/deals/d1')}>
              View a Deal
            </button>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
