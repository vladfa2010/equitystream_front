import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  UserPlus,
  FolderOpen,
  Settings,
} from 'lucide-react';

const sidebarSections = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'DEALS',
    items: [
      { label: 'All Deals', path: '/admin/deals', icon: Briefcase },
      { label: 'Create Deal', path: '/admin/deals/new', icon: PlusCircle },
    ],
  },
  {
    title: 'CLIENTS',
    items: [
      { label: 'All Clients', path: '/admin/clients', icon: Users },
      { label: 'Add Client', path: '/admin/clients/new', icon: UserPlus },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      { label: 'Materials', path: '/admin/materials', icon: FolderOpen },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin/deals') return location.pathname.startsWith('/admin/deals');
    if (path === '/admin/clients') return location.pathname.startsWith('/admin/clients');
    return location.pathname === path;
  };

  return (
    <aside
      className="hidden lg:block fixed left-0 overflow-y-auto"
      style={{
        top: 64,
        width: 260,
        height: 'calc(100dvh - 64px)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '24px 16px',
      }}
    >
      {sidebarSections.map((section) => (
        <div key={section.title} className="mb-6">
          <h3
            className="px-3 mb-2 text-caption uppercase"
            style={{ color: '#55555E' }}
          >
            {section.title}
          </h3>
          {section.items.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 h-10 px-3 rounded-[10px] transition-all duration-200"
                style={{
                  background: active ? 'rgba(184, 161, 78, 0.08)' : 'transparent',
                  color: active ? '#B8A14E' : '#8A8A93',
                  borderLeft: active ? '3px solid #B8A14E' : '3px solid transparent',
                }}
              >
                <Icon
                  size={18}
                  style={{ color: active ? '#B8A14E' : '#55555E' }}
                />
                <span className="text-[14px]" style={{ color: active ? '#B8A14E' : '#8A8A93' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
