import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FolderOpen,
  Bell,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  role?: 'admin' | 'client';
}

const adminNavItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Deals', path: '/admin/deals', icon: Briefcase },
  { label: 'Clients', path: '/admin/clients', icon: Users },
  { label: 'Materials', path: '/admin/materials', icon: FolderOpen },
];

const clientNavItems = [
  { label: 'My Portfolio', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Deals', path: '/deals', icon: Briefcase },
];

export default function Navbar({ role = 'admin' }: NavbarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = role === 'admin' ? adminNavItems : clientNavItems;
  const isActive = (path: string) => {
    if (path === '/admin/deals') return location.pathname.startsWith('/admin/deals');
    if (path === '/admin/clients') return location.pathname.startsWith('/admin/clients');
    return location.pathname === path;
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8"
        style={{
          height: 64,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left: Logo */}
        <Link to={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3">
          <img src="/logo-mark.svg" alt="EquityStream" className="w-7 h-7" />
          <span
            className="hidden sm:inline text-[14px] font-semibold tracking-[0.08em] text-[#F5F5F0]"
            style={{ fontFamily: "'Clash Display', system-ui, sans-serif" }}
          >
            EQUITYSTREAM
          </span>
        </Link>

        {/* Center: Nav Tabs (desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 text-[14px] font-medium transition-colors duration-200"
                style={{
                  color: active ? '#B8A14E' : '#8A8A93',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#B8A14E]"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Role Badge, Notification, Avatar */}
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex items-center px-2.5 py-1 text-[12px] font-semibold rounded-md"
            style={{
              background: 'rgba(184, 161, 78, 0.12)',
              color: '#B8A14E',
            }}
          >
            {role === 'admin' ? 'ADMIN' : 'CLIENT'}
          </span>

          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell size={18} style={{ color: '#8A8A93' }} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: '#EF4444' }}
            />
          </button>

          <div
            className="w-9 h-9 rounded-full overflow-hidden"
            style={{ border: '2px solid rgba(255, 255, 255, 0.1)' }}
          >
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} color="#8A8A93" /> : <Menu size={20} color="#8A8A93" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
              style={{ backdropFilter: 'blur(8px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-72 z-[70] md:hidden p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(24px) saturate(140%)',
                WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                  <X size={20} color="#8A8A93" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                      style={{
                        background: active ? 'rgba(184, 161, 78, 0.08)' : 'transparent',
                        color: active ? '#B8A14E' : '#8A8A93',
                      }}
                    >
                      <Icon size={18} />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
