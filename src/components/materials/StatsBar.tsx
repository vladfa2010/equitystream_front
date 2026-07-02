import { motion } from 'framer-motion';
import { FileText, Link2, HardDrive, Clock } from 'lucide-react';

interface StatsBarProps {
  totalFiles: number;
  totalLinks: number;
  storageUsed: number;
  recentlyAdded: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function StatsBar({ totalFiles, totalLinks, storageUsed, recentlyAdded }: StatsBarProps) {
  const cards = [
    { label: 'Total Files', value: totalFiles, icon: FileText, color: '#4F6EF7' },
    { label: 'Total Links', value: totalLinks, icon: Link2, color: '#8B5CF6' },
    { label: 'Storage Used', value: `${storageUsed.toFixed(1)} MB`, icon: HardDrive, color: '#10B981' },
    { label: 'Recently Added', value: recentlyAdded, icon: Clock, color: '#B8A14E' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          variants={item}
          className="rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(255,255,255,0.14)]"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <card.icon size={16} style={{ color: card.color }} />
            <span className="text-caption" style={{ color: '#55555E' }}>
              {card.label}
            </span>
          </div>
          <div
            className="text-mono-m"
            style={{
              color: '#F5F5F0',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'clamp(18px, 2vw, 28px)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            {card.value}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
