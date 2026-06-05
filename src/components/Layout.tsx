import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  role?: 'admin' | 'client';
  showFooter?: boolean;
}

export default function Layout({ children, role = 'admin', showFooter = false }: LayoutProps) {
  const isAdmin = role === 'admin';

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
    </div>
  );
}
