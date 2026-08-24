import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  role?: 'user' | 'admin' | 'superadmin';
  showFooter?: boolean;
}

export default function Layout({ children, role: propRole, showFooter = false }: LayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine effective role: prop takes priority for backward compat, else derive from auth
  const effectiveRole = propRole ?? (user?.role || 'user');

  // Admin view mode: if we're on an admin route, we're in admin view
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showAdminNav = isAdminRoute;
  const showClientFab = !isAdminRoute && (effectiveRole === 'user' || !isAdminRoute);

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--bg-base)' }}>
      <Navbar role={effectiveRole} />
      {showAdminNav && <Sidebar />}
      <main className={showAdminNav ? 'lg:ml-[260px]' : ''}>
        <div style={{ padding: 'clamp(16px, 4vw, 64px)' }}>
          {children}
        </div>
      </main>
      {showFooter && <Footer />}

      {/* FAB — Available Deals for clients */}
      {showClientFab && (
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
