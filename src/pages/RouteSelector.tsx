import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User } from 'lucide-react';

export default function RouteSelector() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4"
      style={{
        background: 'var(--bg-base)',
        backgroundImage: 'var(--grad-hero-overlay)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="text-center max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo-mark.svg" alt="EquityStream" className="w-10 h-10" />
          <span
            className="text-[18px] font-semibold tracking-[0.08em] text-[#F5F5F0]"
            style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
          >
            EQUITYSTREAM
          </span>
        </div>

        <h1
          className="text-display-l mb-4"
          style={{
            fontFamily: "'Clash Display', system-ui, sans-serif",
            color: '#F5F5F0',
          }}
        >
          Choose Your View
        </h1>
        <p className="text-body-l mb-12" style={{ color: '#8A8A93' }}>
          Select the interface you want to explore. Both admin and client views are fully functional.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Admin Card */}
          <motion.button
            whileHover={{ y: -4, borderColor: 'rgba(184, 161, 78, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin')}
            className="glass-panel p-8 text-left transition-all duration-300 group"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors"
              style={{ background: 'rgba(184, 161, 78, 0.12)' }}
            >
              <Shield size={28} color="#B8A14E" />
            </div>
            <h3
              className="text-h3 mb-2"
              style={{ color: '#F5F5F0' }}
            >
              Admin Panel
            </h3>
            <p className="text-body" style={{ color: '#8A8A93' }}>
              Deal creation, client allocation, portfolio management, and materials library.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[14px] font-semibold" style={{ color: '#B8A14E' }}>Enter Admin</span>
              <span className="transition-transform group-hover:translate-x-1" style={{ color: '#B8A14E' }}>→</span>
            </div>
          </motion.button>

          {/* Client Card */}
          <motion.button
            whileHover={{ y: -4, borderColor: 'rgba(79, 110, 247, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="glass-panel p-8 text-left transition-all duration-300 group"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors"
              style={{ background: 'rgba(79, 110, 247, 0.12)' }}
            >
              <User size={28} color="#4F6EF7" />
            </div>
            <h3
              className="text-h3 mb-2"
              style={{ color: '#F5F5F0' }}
            >
              Client Portal
            </h3>
            <p className="text-body" style={{ color: '#8A8A93' }}>
              Portfolio tracking, position viewing, deal materials, and performance charts.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[14px] font-semibold" style={{ color: '#4F6EF7' }}>Enter Client</span>
              <span className="transition-transform group-hover:translate-x-1" style={{ color: '#4F6EF7' }}>→</span>
            </div>
          </motion.button>
        </div>

        <p className="mt-12 text-caption" style={{ color: '#55555E' }}>
          EquityStream &copy; 2025. Premium stock portfolio distribution platform.
        </p>
      </motion.div>
    </div>
  );
}
