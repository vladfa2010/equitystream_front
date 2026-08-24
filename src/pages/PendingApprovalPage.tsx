import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Clock, Mail, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isVerified } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (isVerified) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, isVerified, navigate]);

  if (!user) return null;

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
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(184,161,78,0.1)' }}>
            <Clock size={32} style={{ color: '#B8A14E' }} />
          </div>

          <h1
            className="text-display-m mb-3"
            style={{ color: '#F5F5F0', fontFamily: "'Clash Display', system-ui, sans-serif" }}
          >
            Thank You for Registering!
          </h1>

          <p className="text-body mb-2" style={{ color: '#8A8A93' }}>
            Your application is under review.
          </p>
          <p className="text-body mb-6" style={{ color: '#8A8A93' }}>
            An administrator will verify your account shortly. You will receive an email notification once approved.
          </p>

          <div className="rounded-xl p-4 mb-6 text-left" style={{ background: 'rgba(184,161,78,0.05)', border: '1px solid rgba(184,161,78,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} style={{ color: '#B8A14E' }} />
              <span className="text-[13px] font-medium" style={{ color: '#B8A14E' }}>Registered Email</span>
            </div>
            <p className="text-[14px]" style={{ color: '#F5F5F0', fontFamily: "'JetBrains Mono', monospace" }}>
              {user.email}
            </p>
          </div>

          <div className="text-[12px] mb-6" style={{ color: '#55555E' }}>
            <p>Typical review time: 1-2 business days</p>
            <p className="mt-1">Questions? Contact support@equitystream.ru</p>
          </div>

          <button
            onClick={logout}
            className="w-full py-3 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-colors hover:bg-white/5"
            style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
