import { motion } from 'framer-motion';
import { FileText, Link2, Image, Video, ExternalLink, Eye, Download } from 'lucide-react';
import type { DealMaterial } from '@/data/mockData';

interface MaterialMiniCardProps {
  material: DealMaterial;
  dealName?: string;
  index?: number;
  compact?: boolean;
}

const typeIconMap = {
  file: FileText,
  document: FileText,
  link: Link2,
  image: Image,
  video: Video,
};

const typeColorMap = {
  file: '#4F6EF7',
  document: '#4F6EF7',
  link: '#10B981',
  image: '#8B5CF6',
  video: '#F59E0B',
};

export default function MaterialMiniCard({ material, dealName, index = 0, compact = true }: MaterialMiniCardProps) {
  const Icon = typeIconMap[material.type as keyof typeof typeIconMap] || FileText;
  const iconColor = typeColorMap[material.type as keyof typeof typeColorMap] || '#8A8A93';

  const handleAction = () => {
    if (material.type === 'link') {
      window.open(material.url, '_blank');
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.06,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
        className="flex-shrink-0 glass-panel-hover"
        style={{
          width: 240,
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--glass-shadow)',
          scrollSnapAlign: 'start',
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center mb-3"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.04)',
          }}
        >
          <Icon size={24} color={iconColor} />
        </div>

        {/* Title */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 13,
            fontWeight: 500,
            color: '#F5F5F0',
            marginBottom: 6,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {material.title}
        </p>

        {/* Meta */}
        <p className="text-caption" style={{ color: '#55555E', marginBottom: 12 }}>
          {material.type.toUpperCase()}
          {dealName && ` \u2022 ${dealName}`}
          {material.size && ` \u2022 ${material.size}`}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {material.type === 'link' ? (
            <button
              onClick={handleAction}
              className="btn-secondary flex items-center gap-1"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              <ExternalLink size={12} />
              Open
            </button>
          ) : (
            <button
              className="btn-secondary flex items-center gap-1"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              <Eye size={12} />
              View
            </button>
          )}
          {material.type !== 'link' && (
            <button
              className="btn-secondary flex items-center gap-1"
              style={{ padding: '6px 12px', fontSize: 12 }}
            >
              <Download size={12} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Full-size card for DealView grid
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="glass-panel-hover"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.04)',
        }}
      >
        <Icon size={24} color={iconColor} />
      </div>

      <p
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: '#F5F5F0',
          marginBottom: 8,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {material.title}
      </p>

      <p className="text-caption" style={{ color: '#55555E', marginBottom: 16 }}>
        {material.type.toUpperCase()}
        {material.size && ` \u2022 ${material.size}`}
        {material.uploadedAt && ` \u2022 ${new Date(material.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
      </p>

      {material.type === 'link' ? (
        <button
          onClick={handleAction}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <ExternalLink size={14} />
          Open Link
        </button>
      ) : (
        <button
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <Eye size={14} />
          Preview
        </button>
      )}
    </motion.div>
  );
}
