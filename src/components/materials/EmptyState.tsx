import { motion } from 'framer-motion';
import { Upload, Link2, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'all' | 'files' | 'links' | 'search';
  onUpload: () => void;
  onAddLink: () => void;
}

const config: Record<string, { title: string; description: string; icon: typeof FolderOpen }> = {
  all: {
    title: 'No materials yet',
    description: 'Upload files or add links to enrich your deals',
    icon: FolderOpen,
  },
  files: {
    title: 'No files yet',
    description: 'Upload files to attach them to your deals',
    icon: FolderOpen,
  },
  links: {
    title: 'No links yet',
    description: 'Add external links to enrich your deals',
    icon: FolderOpen,
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your search or filters',
    icon: FolderOpen,
  },
};

export default function EmptyState({ type, onUpload, onAddLink }: EmptyStateProps) {
  const c = config[type];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Icon size={36} style={{ color: '#55555E' }} />
      </div>
      <h3
        className="text-h3 mb-2"
        style={{
          color: '#F5F5F0',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 'clamp(18px, 2vw, 24px)',
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {c.title}
      </h3>
      <p className="text-body mb-8 max-w-sm" style={{ color: '#8A8A93' }}>
        {c.description}
      </p>
      {type !== 'search' && (
        <div className="flex items-center gap-3">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 50%, #D4C070 100%)',
              color: '#0A0A0F',
            }}
          >
            <Upload size={16} /> Upload File
          </button>
          <button
            onClick={onAddLink}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F5F5F0',
              background: 'transparent',
            }}
          >
            <Link2 size={16} /> Add Link
          </button>
        </div>
      )}
    </motion.div>
  );
}
