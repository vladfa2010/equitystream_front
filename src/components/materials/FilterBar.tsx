import { motion } from 'framer-motion';
import { Search, LayoutGrid, List, X } from 'lucide-react';
import type { FilterTab, ViewMode, SortOption } from '@/hooks/useMaterials';
import type { Deal } from '@/data/mockData';

interface FilterBarProps {
  filterTab: FilterTab;
  setFilterTab: (tab: FilterTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  dealFilter: string;
  setDealFilter: (d: string) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  deals: Deal[];
  resultCount: number;
}

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'files', label: 'Files' },
  { key: 'links', label: 'Links' },
];

export default function FilterBar({
  filterTab,
  setFilterTab,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  dealFilter,
  setDealFilter,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
  deals,
  resultCount,
}: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="rounded-2xl p-4 mb-6"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Top row: tabs + view toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className="relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200"
              style={{
                color: filterTab === tab.key ? '#B8A14E' : '#8A8A93',
                background: filterTab === tab.key ? 'rgba(184, 161, 78, 0.08)' : 'transparent',
              }}
            >
              {tab.label}
              {filterTab === tab.key && (
                <motion.div
                  layoutId="filter-tab-indicator"
                  className="absolute inset-0 rounded-lg border"
                  style={{ borderColor: 'rgba(184, 161, 78, 0.2)' }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-caption mr-1" style={{ color: '#55555E' }}>
            {resultCount} items
          </span>
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 transition-colors"
              style={{
                background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                color: viewMode === 'grid' ? '#F5F5F0' : '#55555E',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 transition-colors"
              style={{
                background: viewMode === 'list' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                color: viewMode === 'list' ? '#F5F5F0' : '#55555E',
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
          <input
            type="text"
            placeholder="Search files and links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-9 pr-8 py-2.5 text-[13px] outline-none transition-all duration-200 focus:border-[#B8A14E]"
            style={{
              background: '#14141C',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#F5F5F0',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X size={14} style={{ color: '#55555E' }} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-[13px] outline-none transition-all duration-200 cursor-pointer"
          style={{
            background: '#14141C',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#F5F5F0',
            fontFamily: 'Inter, system-ui, sans-serif',
            minWidth: 140,
          }}
        >
          <option value="all">All Types</option>
          <option value="document">Documents</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="file">Files</option>
          <option value="link">Links</option>
        </select>

        {/* Deal filter */}
        <select
          value={dealFilter}
          onChange={(e) => setDealFilter(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-[13px] outline-none transition-all duration-200 cursor-pointer"
          style={{
            background: '#14141C',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#F5F5F0',
            fontFamily: 'Inter, system-ui, sans-serif',
            minWidth: 160,
          }}
        >
          <option value="all">All Deals</option>
          {deals.map((d) => (
            <option key={d.id} value={d.id}>
              [{d.ticker}] {d.companyName}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="rounded-xl px-3 py-2.5 text-[13px] outline-none transition-all duration-200 cursor-pointer"
          style={{
            background: '#14141C',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#F5F5F0',
            fontFamily: 'Inter, system-ui, sans-serif',
            minWidth: 140,
          }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="largest">Largest First</option>
        </select>
      </div>
    </motion.div>
  );
}
