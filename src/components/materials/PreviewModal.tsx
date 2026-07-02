import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Video,
  Link2,
  File,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react';
import type { MaterialItem } from '@/hooks/useMaterials';

interface PreviewModalProps {
  material: MaterialItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  document: { icon: FileText, color: '#EF4444', label: 'PDF Document' },
  image: { icon: Image, color: '#10B981', label: 'Image' },
  video: { icon: Video, color: '#8B5CF6', label: 'Video' },
  link: { icon: Link2, color: '#4F6EF7', label: 'External Link' },
  file: { icon: File, color: '#B8A14E', label: 'File' },
};

function ImagePreview({ material }: { material: MaterialItem }) {
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(1);

  const toggleZoom = () => {
    setZoomed(!zoomed);
    setScale(zoomed ? 1 : 1.5);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative overflow-hidden rounded-xl cursor-zoom-in"
        style={{ maxHeight: '60vh' }}
        onClick={toggleZoom}
      >
        <motion.img
          src={material.fileData || material.url}
          alt={material.title}
          className="max-w-full object-contain"
          style={{
            maxHeight: '60vh',
            borderRadius: 12,
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
          }}
          animate={{ scale }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={toggleZoom}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-white/5"
          style={{ color: '#8A8A93', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {zoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
          {zoomed ? 'Zoom Out' : 'Zoom In'}
        </button>
        <a
          href={material.fileData || material.url}
          download={material.title}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-white/5"
          style={{ color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Download size={14} /> Download
        </a>
      </div>
    </div>
  );
}

function PDFPreview({ material }: { material: MaterialItem }) {
  const [pageNum, setPageNum] = useState(1);
  const totalPages = 5; // Mock total pages

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{
          background: '#1A1A24',
          minHeight: 400,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <iframe
          src={material.fileData || material.url}
          title={material.title}
          className="w-full"
          style={{ minHeight: 500, border: 'none' }}
        />
      </div>
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => setPageNum(Math.max(1, pageNum - 1))}
          disabled={pageNum <= 1}
          className="p-2 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30"
          style={{ color: '#F5F5F0' }}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[13px]" style={{ color: '#8A8A93', fontFamily: "'JetBrains Mono', monospace" }}>
          {pageNum} / {totalPages}
        </span>
        <button
          onClick={() => setPageNum(Math.min(totalPages, pageNum + 1))}
          disabled={pageNum >= totalPages}
          className="p-2 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30"
          style={{ color: '#F5F5F0' }}
        >
          <ChevronRight size={16} />
        </button>
        <div className="w-px h-4 mx-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <a
          href={material.fileData || material.url}
          download={material.title}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors hover:bg-white/5"
          style={{ color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <Download size={14} /> Download
        </a>
      </div>
    </div>
  );
}

function VideoPreview({ material }: { material: MaterialItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const pct = parseFloat(e.target.value);
    setProgress(pct);
    videoRef.current.currentTime = (pct / 100) * videoRef.current.duration;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    };
  }, []);

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ background: '#0A0A0F' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={material.fileData || material.url}
        className="w-full"
        style={{ maxHeight: '60vh' }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Play overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={togglePlay}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(184, 161, 78, 0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
          >
            <Play size={28} style={{ color: '#0A0A0F', marginLeft: 3 }} />
          </div>
        </div>
      )}

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            }}
          >
            {/* Progress bar */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #B8A14E ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} style={{ color: '#F5F5F0' }}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={toggleMute} style={{ color: '#8A8A93' }}>
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
              <button onClick={handleFullscreen} style={{ color: '#8A8A93' }}>
                <Maximize size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkPreview({ material }: { material: MaterialItem }) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(79, 110, 247, 0.1)' }}
      >
        <Link2 size={40} style={{ color: '#4F6EF7' }} />
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
        {material.title}
      </h3>
      {material.description && (
        <p className="text-body mb-4 max-w-md" style={{ color: '#8A8A93' }}>
          {material.description}
        </p>
      )}
      <a
        href={material.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-mono-s mb-6 transition-colors hover:text-[#B8A14E]"
        style={{
          color: '#4F6EF7',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 'clamp(12px, 0.9vw, 14px)',
        }}
      >
        {material.url}
      </a>
      <a
        href={material.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:brightness-110"
        style={{
          background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 50%, #D4C070 100%)',
          color: '#0A0A0F',
        }}
      >
        <ExternalLink size={16} /> Open in New Tab
      </a>
    </div>
  );
}

function DownloadPrompt({ material }: { material: MaterialItem }) {
  const config = typeConfig[material.type] || typeConfig.file;
  const TypeIcon = config.icon;

  return (
    <div className="flex flex-col items-center text-center py-8">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: `${config.color}18` }}
      >
        <TypeIcon size={40} style={{ color: config.color }} />
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
        {material.title}
      </h3>
      <p className="text-body mb-2" style={{ color: '#8A8A93' }}>
        {config.label}
        {material.size ? ` \u2022 ${material.size}` : ''}
      </p>
      <p className="text-caption mb-6" style={{ color: '#55555E' }}>
        This file type cannot be previewed. Download to view.
      </p>
      <a
        href={material.fileData || material.url}
        download={material.title}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:brightness-110"
        style={{
          background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 50%, #D4C070 100%)',
          color: '#0A0A0F',
        }}
      >
        <Download size={16} /> Download File
      </a>
    </div>
  );
}

export default function PreviewModal({ material, isOpen, onClose }: PreviewModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!material) return null;

  const renderPreview = () => {
    switch (material.type) {
      case 'image':
        return <ImagePreview material={material} />;
      case 'document':
        return <PDFPreview material={material} />;
      case 'video':
        return <VideoPreview material={material} />;
      case 'link':
        return <LinkPreview material={material} />;
      default:
        return <DownloadPrompt material={material} />;
    }
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="w-full rounded-2xl overflow-hidden"
            style={{
              maxWidth: material.type === 'link' || material.type === 'file' ? 560 : 900,
              maxHeight: '85vh',
              background: material.type === 'image' || material.type === 'video' ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
              backdropFilter: material.type === 'image' || material.type === 'video' ? 'none' : 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: material.type === 'image' || material.type === 'video' ? 'none' : 'blur(24px) saturate(140%)',
              border: material.type === 'image' || material.type === 'video' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: material.type === 'image' || material.type === 'video' ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - only for non-image/video */}
            {material.type !== 'image' && material.type !== 'video' && (
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} style={{ color: '#8A8A93', flexShrink: 0 }} />
                  <h3
                    className="text-[15px] font-medium truncate"
                    style={{ color: '#F5F5F0' }}
                  >
                    {material.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {material.type !== 'link' && (
                    <a
                      href={material.fileData || material.url}
                      download={material.title}
                      className="p-2 rounded-lg transition-colors hover:bg-white/5"
                      title="Download"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} style={{ color: '#8A8A93' }} />
                    </a>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  >
                    <X size={18} style={{ color: '#8A8A93' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Image/video close button (floating) */}
            {(material.type === 'image' || material.type === 'video') && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              >
                <X size={18} style={{ color: '#F5F5F0' }} />
              </button>
            )}

            {/* Content */}
            <div
              className="overflow-y-auto"
              style={{
                maxHeight: 'calc(85vh - 70px)',
                padding: material.type === 'image' || material.type === 'video' ? 0 : 24,
              }}
            >
              {renderPreview()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
