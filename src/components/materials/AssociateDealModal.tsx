import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2 } from 'lucide-react';
import type { Deal } from '@/data/mockData';

interface AssociateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssociate: (dealId: string) => void;
  deals: Deal[];
  selectedCount: number;
}

export default function AssociateDealModal({
  isOpen,
  onClose,
  onAssociate,
  deals,
  selectedCount,
}: AssociateDealModalProps) {
  const [selectedDeal, setSelectedDeal] = useState<string>('');

  const handleAssociate = () => {
    if (!selectedDeal) return;
    onAssociate(selectedDeal);
    setSelectedDeal('');
    onClose();
  };

  const handleClose = () => {
    setSelectedDeal('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="w-full max-w-[440px] rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(184, 161, 78, 0.1)' }}
                >
                  <Link2 size={20} style={{ color: '#B8A14E' }} />
                </div>
                <div>
                  <h2
                    className="text-h4"
                    style={{
                      color: '#F5F5F0',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 'clamp(16px, 1.5vw, 20px)',
                      fontWeight: 600,
                      lineHeight: 1.35,
                    }}
                  >
                    Associate with Deal
                  </h2>
                  <p className="text-caption" style={{ color: '#55555E' }}>
                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <X size={18} style={{ color: '#8A8A93' }} />
              </button>
            </div>

            {/* Deal list */}
            <div className="space-y-2 mb-6 max-h-72 overflow-y-auto custom-scrollbar">
              {deals.map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => setSelectedDeal(deal.id)}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200"
                  style={{
                    background: selectedDeal === deal.id ? 'rgba(184, 161, 78, 0.08)' : 'transparent',
                    border: selectedDeal === deal.id ? '1px solid rgba(184, 161, 78, 0.2)' : '1px solid transparent',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: selectedDeal === deal.id ? '#B8A14E' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {selectedDeal === deal.id && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: '#B8A14E' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate" style={{ color: '#F5F5F0' }}>
                      [{deal.ticker}] {deal.companyName}
                    </p>
                    <p className="text-caption" style={{ color: '#55555E' }}>
                      {deal.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#F5F5F0',
                  background: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssociate}
                disabled={!selectedDeal}
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 50%, #D4C070 100%)',
                  color: '#0A0A0F',
                }}
              >
                Associate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
