import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  Video,
  Link2,
  File,
  ExternalLink,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import type { MaterialItem } from '@/hooks/useMaterials';
import { deals, timeAgo } from '@/data/mockData';

interface MaterialTableRowProps {
  material: MaterialItem;
  index: number;
  onPreview: (m: MaterialItem) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  document: { icon: FileText, color: '#EF4444', label: 'PDF' },
  image: { icon: Image, color: '#10B981', label: 'Image' },
  video: { icon: Video, color: '#8B5CF6', label: 'Video' },
  link: { icon: Link2, color: '#4F6EF7', label: 'Link' },
  file: { icon: File, color: '#B8A14E', label: 'File' },
};

export default function MaterialTableRow({
  material,
  index,
  onPreview,
  onDelete,
  isSelected,
  onToggleSelect,
}: MaterialTableRowProps) {
  const deal = deals.find((d) => d.id === material.dealId);
  const config = typeConfig[material.type] || typeConfig.file;
  const TypeIcon = config.icon;
  const isLink = material.type === 'link';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="group transition-colors duration-150"
      style={{
        background: isSelected ? 'rgba(184, 161, 78, 0.06)' : 'transparent',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        borderLeft: isSelected ? '2px solid #B8A14E' : '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      {/* Checkbox */}
      <td className="py-3.5 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(material.id)}
          className="w-4 h-4 rounded cursor-pointer"
          style={{ accentColor: '#B8A14E' }}
        />
      </td>

      {/* Name */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${config.color}18` }}
          >
            <TypeIcon size={16} style={{ color: config.color }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[14px] font-medium truncate cursor-pointer hover:text-[#B8A14E] transition-colors"
              style={{ color: '#F5F5F0' }}
              onClick={() => onPreview(material)}
            >
              {material.title}
            </p>
            {isLink && (
              <p className="text-caption truncate" style={{ color: '#55555E' }}>
                {material.url}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="py-3.5 px-4">
        <span className="text-caption" style={{ color: '#8A8A93' }}>
          {config.label}
        </span>
      </td>

      {/* Size / URL */}
      <td className="py-3.5 px-4">
        <span className="text-caption" style={{ color: '#8A8A93' }}>
          {material.size || '—'}
        </span>
      </td>

      {/* Deal */}
      <td className="py-3.5 px-4">
        {deal ? (
          <span
            className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md"
            style={{
              background: 'rgba(184, 161, 78, 0.1)',
              color: '#B8A14E',
            }}
          >
            [{deal.ticker}]
          </span>
        ) : (
          <span className="text-caption" style={{ color: '#55555E' }}>
            Unassigned
          </span>
        )}
      </td>

      {/* Date */}
      <td className="py-3.5 px-4">
        <span className="text-caption" style={{ color: '#8A8A93' }}>
          {timeAgo(material.uploadedAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPreview(material)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            title="Preview"
          >
            <Eye size={14} style={{ color: '#8A8A93' }} />
          </button>
          {isLink ? (
            <button
              onClick={() => window.open(material.url, '_blank')}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              title="Open Link"
            >
              <ExternalLink size={14} style={{ color: '#8A8A93' }} />
            </button>
          ) : (
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = material.fileData || material.url;
                a.download = material.title;
                a.click();
              }}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              title="Download"
            >
              <Download size={14} style={{ color: '#8A8A93' }} />
            </button>
          )}
          <button
            onClick={() => onDelete(material.id)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            title="Delete"
          >
            <Trash2 size={14} style={{ color: '#EF4444' }} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
