import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  Video,
  Link2,
  MoreVertical,
  Download,
  ExternalLink,
  Trash2,
  Eye,
  File,
} from 'lucide-react';
import { useState, useRef } from 'react';
import type { MaterialItem } from '@/hooks/useMaterials';
import { deals } from '@/data/mockData';
import { timeAgo } from '@/data/mockData';

interface MaterialCardProps {
  material: MaterialItem;
  index: number;
  onPreview: (m: MaterialItem) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  document: { icon: FileText, color: 'rgba(239,68,68,0.3)', label: 'PDF' },
  image: { icon: Image, color: 'rgba(16,185,129,0.3)', label: 'Image' },
  video: { icon: Video, color: 'rgba(139,92,246,0.3)', label: 'Video' },
  link: { icon: Link2, color: 'rgba(79,110,247,0.3)', label: 'Link' },
  file: { icon: File, color: 'rgba(184,161,78,0.3)', label: 'File' },
};

export default function MaterialCard({
  material,
  index,
  onPreview,
  onDelete,
  isSelected,
  onToggleSelect,
}: MaterialCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const deal = deals.find((d) => d.id === material.dealId);
  const config = typeConfig[material.type] || typeConfig.file;
  const TypeIcon = config.icon;
  const isLink = material.type === 'link';

  const handleActionClick = (action: string) => {
    setShowActions(false);
    if (action === 'preview') onPreview(material);
    if (action === 'delete') onDelete(material.id);
    if (action === 'open' && material.url) window.open(material.url, '_blank');
    if (action === 'download') {
      // Create temporary download
      const a = document.createElement('a');
      a.href = material.fileData || material.url;
      a.download = material.title;
      a.click();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking actions menu or checkbox
    if (
      actionsRef.current?.contains(e.target as Node) ||
      (e.target as HTMLElement).closest('.action-menu') ||
      (e.target as HTMLElement).closest('.select-checkbox')
    ) {
      return;
    }
    onPreview(material);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      layout
      className="group rounded-2xl p-4 cursor-pointer transition-all duration-300 relative"
      style={{
        background: isSelected ? 'rgba(184, 161, 78, 0.06)' : 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: isSelected
          ? '1px solid rgba(184, 161, 78, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.14)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
        } else {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(184, 161, 78, 0.3)';
        }
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
        setShowActions(false);
      }}
      onClick={handleCardClick}
    >
      {/* Checkbox for bulk select */}
      <div className="select-checkbox absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(material.id)}
          className="w-4 h-4 rounded cursor-pointer"
          style={{ accentColor: '#B8A14E' }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Preview area */}
      <div
        className="rounded-xl mb-3 flex items-center justify-center overflow-hidden relative"
        style={{
          height: 120,
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        {material.type === 'image' && material.fileData && !imageError ? (
          <img
            src={material.fileData}
            alt={material.title}
            className="w-full h-full object-cover"
            style={{ borderRadius: 10 }}
            onError={() => setImageError(true)}
          />
        ) : material.type === 'image' ? (
          <div className="flex flex-col items-center gap-1">
            <Image size={40} style={{ color: '#10B981' }} />
          </div>
        ) : material.type === 'video' ? (
          <div className="flex flex-col items-center gap-1">
            <Video size={40} style={{ color: '#8B5CF6' }} />
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
              >
                <Video size={18} style={{ color: '#F5F5F0' }} />
              </div>
            </div>
          </div>
        ) : material.type === 'link' ? (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(79, 110, 247, 0.1)' }}
            >
              <Link2 size={28} style={{ color: '#4F6EF7' }} />
            </div>
          </div>
        ) : material.type === 'document' ? (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <FileText size={28} style={{ color: '#EF4444' }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(184, 161, 78, 0.1)' }}
            >
              <TypeIcon size={28} style={{ color: '#B8A14E' }} />
            </div>
          </div>
        )}

        {/* Actions dropdown */}
        <div
          ref={actionsRef}
          className="action-menu absolute top-2 right-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <MoreVertical size={14} style={{ color: '#F5F5F0' }} />
          </button>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-8 right-0 rounded-xl py-1.5 z-20 min-w-[140px]"
              style={{
                background: '#1A1A24',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              <button
                onClick={() => handleActionClick('preview')}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                style={{ color: '#F5F5F0' }}
              >
                <Eye size={14} /> Preview
              </button>
              {isLink ? (
                <button
                  onClick={() => handleActionClick('open')}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                  style={{ color: '#F5F5F0' }}
                >
                  <ExternalLink size={14} /> Open Link
                </button>
              ) : (
                <button
                  onClick={() => handleActionClick('download')}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                  style={{ color: '#F5F5F0' }}
                >
                  <Download size={14} /> Download
                </button>
              )}
              <button
                onClick={() => handleActionClick('delete')}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] transition-colors hover:bg-white/5"
                style={{ color: '#EF4444' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <h4
          className="text-[14px] font-medium truncate mb-1"
          style={{ color: '#F5F5F0' }}
          title={material.title}
        >
          {material.title}
        </h4>
        <p className="text-caption mb-2" style={{ color: '#55555E' }}>
          {config.label}
          {material.size ? ` \u2022 ${material.size}` : ''} \u2022 {timeAgo(material.uploadedAt)}
        </p>

        {/* Deal tag */}
        {deal && (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md cursor-pointer transition-colors hover:brightness-110"
              style={{
                background: 'rgba(184, 161, 78, 0.1)',
                color: '#B8A14E',
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              [{deal.ticker}] {deal.companyName}
            </span>
          </div>
        )}

        {/* Click count for links */}
        {isLink && material.clicks !== undefined && (
          <p className="text-caption mt-1.5" style={{ color: '#55555E' }}>
            {material.clicks} clicks
          </p>
        )}
      </div>
    </motion.div>
  );
}
