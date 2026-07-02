import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Loader2 } from 'lucide-react';
import type { MaterialItem } from '@/hooks/useMaterials';
import type { Deal } from '@/data/mockData';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (material: MaterialItem) => void;
  deals: Deal[];
}

export default function AddLinkModal({ isOpen, onClose, onAdd, deals }: AddLinkModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const [isFetching, setIsFetching] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({});

  const resetForm = useCallback(() => {
    setUrl('');
    setTitle('');
    setDescription('');
    setSelectedDeal('');
    setErrors({});
    setIsFetching(false);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const ensureProtocol = (inputUrl: string): string => {
    if (!inputUrl) return '';
    if (!/^https?:\/\//i.test(inputUrl)) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  };

  // Simulated title fetch — in production this would call a metadata API
  const fetchTitle = useCallback(async (inputUrl: string) => {
    const fullUrl = ensureProtocol(inputUrl);
    if (!fullUrl || !fullUrl.includes('.')) return;

    setIsFetching(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Try to extract a title from the URL
    try {
      const urlObj = new URL(fullUrl);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      // Generate a plausible title from the URL
      let guessedTitle = '';
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
          .replace(/[-_]/g, ' ')
          .replace(/\.(html?|php|asp)$/i, '');
        if (lastPart.length > 2) {
          guessedTitle = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
        }
      }
      if (!guessedTitle) {
        // Use domain-based fallback
        const domainParts = hostname.split('.');
        guessedTitle = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
      }

      setTitle(guessedTitle);
    } catch {
      // Invalid URL, ignore
    }
    setIsFetching(false);
  }, []);

  const handleUrlBlur = () => {
    if (url && !title) {
      fetchTitle(url);
    }
    setUrl(ensureProtocol(url));
  };

  const validate = (): boolean => {
    const newErrors: { url?: string; title?: string } = {};
    if (!url) newErrors.url = 'URL is required';
    else if (!/^https?:\/\/.+/i.test(url)) newErrors.url = 'Enter a valid URL';
    if (!title.trim()) newErrors.title = 'Title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const material: MaterialItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dealId: selectedDeal || 'unassigned',
      type: 'link',
      title: title.trim(),
      url,
      description: description.trim() || undefined,
      uploadedAt: new Date().toISOString(),
      clicks: 0,
    };

    onAdd(material);
    handleClose();
  };

  const isValid = url.trim() && title.trim();

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
            className="w-full max-w-[480px] rounded-2xl p-6"
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
                  style={{ background: 'rgba(79, 110, 247, 0.1)' }}
                >
                  <Link2 size={20} style={{ color: '#4F6EF7' }} />
                </div>
                <h2
                  className="text-h2"
                  style={{
                    color: '#F5F5F0',
                    fontFamily: "'Clash Display', system-ui, sans-serif",
                    fontSize: 'clamp(24px, 3vw, 36px)',
                    fontWeight: 500,
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Add Link
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <X size={18} style={{ color: '#8A8A93' }} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* URL */}
              <div>
                <label className="text-caption block mb-1.5" style={{ color: '#8A8A93' }}>
                  URL <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
                  }}
                  onBlur={handleUrlBlur}
                  placeholder="https://example.com"
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-200 focus:border-[#B8A14E]"
                  style={{
                    background: '#14141C',
                    border: `1px solid ${errors.url ? 'rgba(239,68,68,0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />
                {errors.url && (
                  <p className="text-caption mt-1" style={{ color: '#EF4444' }}>
                    {errors.url}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-caption block mb-1.5" style={{ color: '#8A8A93' }}>
                  Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    placeholder="Link title"
                    className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-200 focus:border-[#B8A14E]"
                    style={{
                      background: '#14141C',
                      border: `1px solid ${errors.title ? 'rgba(239,68,68,0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: '#F5F5F0',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  />
                  {isFetching && (
                    <Loader2
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
                      style={{ color: '#B8A14E' }}
                    />
                  )}
                </div>
                {errors.title && (
                  <p className="text-caption mt-1" style={{ color: '#EF4444' }}>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-caption block mb-1.5" style={{ color: '#8A8A93' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-200 resize-none focus:border-[#B8A14E]"
                  style={{
                    background: '#14141C',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                />
              </div>

              {/* Deal selection */}
              <div>
                <label className="text-caption block mb-1.5" style={{ color: '#8A8A93' }}>
                  Attach to Deal
                </label>
                <select
                  value={selectedDeal}
                  onChange={(e) => setSelectedDeal(e.target.value)}
                  className="w-full rounded-xl px-3 py-3 text-[14px] outline-none transition-all duration-200 cursor-pointer"
                  style={{
                    background: '#14141C',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  <option value="">No deal</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.ticker}] {d.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 justify-end mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                onClick={handleSubmit}
                disabled={!isValid}
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 50%, #D4C070 100%)',
                  color: '#0A0A0F',
                }}
              >
                Add Link
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
