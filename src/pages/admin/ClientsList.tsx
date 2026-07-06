import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  AlignJustify,
  Users,
  DollarSign,
  TrendingUp,
  Crown,
  Plus,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { formatCurrency, formatPercent } from '@/data/mockData';
import { clientsApi } from '@/api';
import type { ClientResponse } from '@/api';
import ClientCard from '@/components/clients/ClientCard';
import ClientTableRow from '@/components/clients/ClientTableRow';
import AddClientModal from '@/components/clients/AddClientModal';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'invested-desc'
  | 'invested-asc'
  | 'pnl-desc'
  | 'pnl-asc'
  | 'deals-desc';

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Helper: calculate P&L percentage
function getPnlPercent(c: ClientResponse): number {
  return c.totalInvested > 0 ? (c.totalPnl / c.totalInvested) * 100 : 0;
}

// Helper: get display name
function getName(c: ClientResponse): string {
  return c.fullName || c.name || 'Unknown';
}

export default function ClientsList() {
  const [clientList, setClientList] = useState<ClientResponse[]>([]);
  const [, setLoading] = useState(true);

  // Load clients from localStorage API on mount
  useEffect(() => {
    clientsApi.getAll().then(data => {
      setClientList(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Summary stats
  const stats = useMemo(() => {
    const totalClients = clientList.length;
    const activeClients = clientList.filter((c) => c.status === 'active').length;
    const totalInvested = clientList.reduce((sum, c) => sum + c.totalInvested, 0);
    const avgInvestment = totalClients > 0 ? totalInvested / totalClients : 0;
    const avgPnl =
      totalClients > 0
        ? clientList.reduce((sum, c) => sum + getPnlPercent(c), 0) / totalClients
        : 0;
    const topPerformer = clientList.length > 0
      ? clientList.reduce(
          (best, c) => (getPnlPercent(c) > getPnlPercent(best) ? c : best),
          clientList[0]
        )
      : null;
    return { totalClients, activeClients, totalInvested, avgInvestment, avgPnl, topPerformer };
  }, [clientList]);

  // Filtered & sorted clients
  const filteredClients = useMemo(() => {
    let result = [...clientList];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) => getName(c).toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => getName(a).localeCompare(getName(b)));
        break;
      case 'name-desc':
        result.sort((a, b) => getName(b).localeCompare(getName(a)));
        break;
      case 'invested-desc':
        result.sort((a, b) => b.totalInvested - a.totalInvested);
        break;
      case 'invested-asc':
        result.sort((a, b) => a.totalInvested - b.totalInvested);
        break;
      case 'pnl-desc':
        result.sort((a, b) => getPnlPercent(b) - getPnlPercent(a));
        break;
      case 'pnl-asc':
        result.sort((a, b) => getPnlPercent(a) - getPnlPercent(b));
        break;
    }

    return result;
  }, [clientList, searchQuery, statusFilter, sortBy]);

  const handleAddClient = (newClient: ClientResponse) => {
    setClientList((prev) => [...prev, newClient]);
  };

  // Refresh list from localStorage API when modal closes
  const handleModalClose = () => {
    setIsModalOpen(false);
    clientsApi.getAll().then(data => setClientList(data));
  };

  const statCards = [
    {
      label: 'Total Clients',
      value: stats.totalClients.toString(),
      sub: `${stats.activeClients} active`,
      icon: Users,
      iconColor: '#4F6EF7',
    },
    {
      label: 'Total Invested',
      value: formatCurrency(stats.totalInvested),
      sub: 'across all clients',
      icon: DollarSign,
      iconColor: '#B8A14E',
    },
    {
      label: 'Avg Investment',
      value: formatCurrency(stats.avgInvestment),
      sub: formatPercent(stats.avgPnl) + ' avg return',
      icon: TrendingUp,
      iconColor: '#10B981',
    },
    {
      label: 'Top Performer',
      value: stats.topPerformer ? getName(stats.topPerformer) : '-',
      sub: stats.topPerformer ? formatPercent(getPnlPercent(stats.topPerformer)) : '',
      icon: Crown,
      iconColor: '#8B5CF6',
      isName: true,
    },
  ];

  return (
    <Layout role="admin">
      <div className="max-w-[1440px] mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpo }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
          style={{ padding: '32px 0' }}
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeExpo }}
              className="text-h1"
              style={{ color: '#F5F5F0' }}
            >
              Clients
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeExpo }}
              className="text-body"
              style={{ color: '#8A8A93' }}
            >
              Manage your investors and their portfolios
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: easeExpo }}
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus size={16} />
            Add Client
          </motion.button>
        </motion.div>

        {/* Summary Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeExpo }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: easeExpo }}
                className="glass-panel p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-caption" style={{ color: '#55555E', textTransform: 'uppercase' }}>
                    {stat.label}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.iconColor}15` }}
                  >
                    <Icon size={16} style={{ color: stat.iconColor }} />
                  </div>
                </div>
                <p
                  className={stat.isName ? 'text-h4 truncate' : 'text-mono-m tabular-nums'}
                  style={{ color: '#F5F5F0', marginBottom: 4 }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-caption"
                  style={{
                    color: stat.sub?.startsWith('+')
                      ? '#10B981'
                      : stat.sub?.startsWith('-')
                        ? '#EF4444'
                        : '#8A8A93',
                  }}
                >
                  {stat.sub}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: easeExpo }}
          className="glass-panel p-4 sm:p-5 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-[400px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#55555E' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full outline-none"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '10px 14px 10px 38px',
                color: '#F5F5F0',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 14,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="outline-none cursor-pointer"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#F5F5F0',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 14,
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="outline-none cursor-pointer"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '10px 14px',
                color: '#F5F5F0',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 14,
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="invested-desc">Total Invested (High-Low)</option>
              <option value="invested-asc">Total Invested (Low-High)</option>
              <option value="pnl-desc">Total P&L (High-Low)</option>
              <option value="pnl-asc">Total P&L (Low-High)</option>
              <option value="deals-desc">Deal Count</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center" style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="p-2.5 transition-all"
                style={{
                  background: viewMode === 'grid' ? 'rgba(184,161,78,0.1)' : 'transparent',
                  color: viewMode === 'grid' ? '#B8A14E' : '#8A8A93',
                  borderRadius: '9px 0 0 9px',
                }}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2.5 transition-all"
                style={{
                  background: viewMode === 'list' ? 'rgba(184,161,78,0.1)' : 'transparent',
                  color: viewMode === 'list' ? '#B8A14E' : '#8A8A93',
                  borderRadius: '0 9px 9px 0',
                }}
                title="List view"
              >
                <AlignJustify size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Client List Content */}
        {filteredClients.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeExpo }}
            className="flex flex-col items-center justify-center py-20"
          >
            <img
              src="/empty-clients.svg"
              alt="No clients"
              className="w-40 h-40 mb-6 opacity-60"
            />
            <h3 className="text-h3 mb-2" style={{ color: '#F5F5F0' }}>
              No clients yet
            </h3>
            <p className="text-body mb-6 text-center" style={{ color: '#8A8A93' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'No clients match your filters. Try adjusting your search.'
                : 'Add your first investor to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                Add Client
              </button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClients.map((client, i) => (
              <ClientCard key={client.id} client={client} index={i} />
            ))}
          </div>
        ) : (
          /* List View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-panel overflow-x-auto"
          >
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Client', 'Status', 'Role', 'Total Invested', 'Total P&L', 'Last Active'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 text-caption"
                        style={{
                          color: '#55555E',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, i) => (
                  <ClientTableRow key={client.id} client={client} index={i} />
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Results count */}
        {filteredClients.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-caption mt-4"
            style={{ color: '#55555E' }}
          >
            Showing {filteredClients.length} of {clientList.length} client
            {clientList.length !== 1 ? 's' : ''}
          </motion.p>
        )}
      </div>

      {/* Add Client Modal */}
      <AddClientModal isOpen={isModalOpen} onClose={handleModalClose} onAdd={handleAddClient} />
    </Layout>
  );
}
