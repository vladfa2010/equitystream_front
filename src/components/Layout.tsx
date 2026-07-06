import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  role?: 'user' | 'admin' | 'superadmin';
  showFooter?: boolean;
}

export default function Layout({ children, role = 'admin', showFooter = false }: LayoutProps) {
  const isAdmin = role === 'admin' || role === 'superadmin';
  const navigate = useNavigate();
  const location = useLocation();

  // Show FAB for client users on client pages (not on available deals page itself)
  const isClient = !isAdmin;
  const showFab = isClient && location.pathname !== '/deals/available';

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--bg-base)' }}>
      <Navbar role={role} />
      {isAdmin && <Sidebar />}
      <main
        className={isAdmin ? 'lg:ml-[260px]' : ''}
      >
        <div style={{ padding: 'clamp(16px, 4vw, 64px)' }}>
          {children}
        </div>
      </main>
      {showFooter && <Footer />}

      {/* FAB — Available Deals for clients */}
      {showFab && (
        <button
          onClick={() => navigate('/deals/available')}
          className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            bottom: 'clamp(24px, 5vh, 40px)',
            right: 'clamp(24px, 4vw, 40px)',
            background: 'linear-gradient(135deg, #B8A14E, #C9B25F)',
            boxShadow: '0 4px 20px rgba(184,161,78,0.4)',
          }}
          title="Available Deals"
        >
          <Plus size={24} color="#0A0A0F" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
