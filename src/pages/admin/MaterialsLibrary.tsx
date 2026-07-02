import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link2, Trash2, Link2Icon, X, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { useMaterials } from '@/hooks/useMaterials';
import { deals } from '@/data/mockData';
import type { MaterialItem } from '@/hooks/useMaterials';

import StatsBar from '@/components/materials/StatsBar';
import FilterBar from '@/components/materials/FilterBar';
import MaterialCard from '@/components/materials/MaterialCard';
import MaterialTableRow from '@/components/materials/MaterialTableRow';
import UploadModal from '@/components/materials/UploadModal';
import AddLinkModal from '@/components/materials/AddLinkModal';
import PreviewModal from '@/components/materials/PreviewModal';
import AssociateDealModal from '@/components/materials/AssociateDealModal';
import EmptyState from '@/components/materials/EmptyState';

export default function MaterialsLibrary() {
  const {
    materials,
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
    selectedIds,
    toggleSelection,
    selectAll,
    addMaterial,
    deleteMaterial,
    deleteSelected,
    associateWithDeal,
    stats,
  } = useMaterials();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);
  const [showAssociateModal, setShowAssociateModal] = useState(false);

  const hasSelection = selectedIds.size > 0;

  const handleUpload = (newMaterials: MaterialItem[]) => {
    newMaterials.forEach((m) => addMaterial(m));
  };

  const handleAssociate = (dealId: string) => {
    associateWithDeal(Array.from(selectedIds), dealId);
  };

  const emptyType = searchQuery && materials.length === 0 ? 'search' : filterTab;

  return (
    <Layout role="admin">
      <div className="max-w-[1440px] mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        >
          <div>
            <h1
              className="text-h1 mb-1"
              style={{
                color: '#F5F5F0',
                fontFamily: "'Clash Display', system-ui, sans-serif",
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Materials Library
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="text-body"
              style={{ color: '#8A8A93' }}
            >
              Manage files and links for your deals
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 50%, #D4C070 100%)',
                color: '#0A0A0F',
              }}
            >
              <Upload size={16} /> Upload File
            </button>
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:bg-white/[0.04]"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#F5F5F0',
                background: 'transparent',
              }}
            >
              <Link2 size={16} /> Add Link
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <StatsBar
          totalFiles={stats.totalFiles}
          totalLinks={stats.totalLinks}
          storageUsed={stats.storageUsed}
          recentlyAdded={stats.recentlyAdded}
        />

        {/* Filters */}
        <FilterBar
          filterTab={filterTab}
          setFilterTab={setFilterTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          dealFilter={dealFilter}
          setDealFilter={setDealFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
          viewMode={viewMode}
          setViewMode={setViewMode}
          deals={deals}
          resultCount={materials.length}
        />

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="mb-4 overflow-hidden"
            >
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: 'rgba(184, 161, 78, 0.06)',
                  border: '1px solid rgba(184, 161, 78, 0.15)',
                }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-2 text-[13px] font-medium transition-colors hover:text-[#B8A14E]"
                    style={{ color: '#8A8A93' }}
                  >
                    {selectedIds.size === materials.length ? (
                      <>
                        <X size={14} /> Deselect All
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Select All
                      </>
                    )}
                  </button>
                  <span className="text-caption" style={{ color: '#55555E' }}>
                    {selectedIds.size} of {materials.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAssociateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F5F5F0',
                      background: 'transparent',
                    }}
                  >
                    <Link2Icon size={14} /> Associate with Deal
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {materials.length === 0 ? (
          <EmptyState
            type={emptyType}
            onUpload={() => setShowUploadModal(true)}
            onAddLink={() => setShowLinkModal(true)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {materials.map((material, index) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  index={index}
                  onPreview={(m) => setPreviewMaterial(m)}
                  onDelete={deleteMaterial}
                  isSelected={selectedIds.has(material.id)}
                  onToggleSelect={toggleSelection}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === materials.length && materials.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: '#B8A14E' }}
                      />
                    </th>
                    <th
                      className="py-3 px-4 text-left text-caption font-medium uppercase"
                      style={{ color: '#55555E', width: '35%' }}
                    >
                      Name
                    </th>
                    <th
                      className="py-3 px-4 text-left text-caption font-medium uppercase"
                      style={{ color: '#55555E', width: '12%' }}
                    >
                      Type
                    </th>
                    <th
                      className="py-3 px-4 text-left text-caption font-medium uppercase"
                      style={{ color: '#55555E', width: '12%' }}
                    >
                      Size
                    </th>
                    <th
                      className="py-3 px-4 text-left text-caption font-medium uppercase"
                      style={{ color: '#55555E', width: '18%' }}
                    >
                      Deal
                    </th>
                    <th
                      className="py-3 px-4 text-left text-caption font-medium uppercase"
                      style={{ color: '#55555E', width: '14%' }}
                    >
                      Added
                    </th>
                    <th
                      className="py-3 px-4 text-left text-caption font-medium uppercase"
                      style={{ color: '#55555E', width: '10%' }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {materials.map((material, index) => (
                      <MaterialTableRow
                        key={material.id}
                        material={material}
                        index={index}
                        onPreview={(m) => setPreviewMaterial(m)}
                        onDelete={deleteMaterial}
                        isSelected={selectedIds.has(material.id)}
                        onToggleSelect={toggleSelection}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        deals={deals}
      />

      <AddLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onAdd={addMaterial}
        deals={deals}
      />

      <PreviewModal
        material={previewMaterial}
        isOpen={!!previewMaterial}
        onClose={() => setPreviewMaterial(null)}
      />

      <AssociateDealModal
        isOpen={showAssociateModal}
        onClose={() => setShowAssociateModal(false)}
        onAssociate={handleAssociate}
        deals={deals}
        selectedCount={selectedIds.size}
      />
    </Layout>
  );
}
