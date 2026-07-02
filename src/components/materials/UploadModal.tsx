import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Check, AlertCircle } from 'lucide-react';
import type { MaterialItem } from '@/hooks/useMaterials';
import type { Deal } from '@/data/mockData';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  progress: number;
  completed: boolean;
  fileData?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (materials: MaterialItem[]) => void;
  deals: Deal[];
}

export default function UploadModal({ isOpen, onClose, onUpload, deals }: UploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMaterialType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'document';
    return 'file';
  };

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadFile[] = Array.from(files).map((file) => ({
      id: `uf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: formatSize(file.size),
      type: getMaterialType(file),
      progress: 0,
      completed: false,
    }));

    setUploadFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress for each file
    newFiles.forEach((uf) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 25 + 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === uf.id ? { ...f, progress: 100, completed: true, fileData } : f
              )
            );
          } else {
            setUploadFiles((prev) =>
              prev.map((f) => (f.id === uf.id ? { ...f, progress } : f))
            );
          }
        }, 200);
      };
      reader.readAsDataURL(uf.file);
    });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = () => {
    const completed = uploadFiles.filter((f) => f.completed);
    const materials: MaterialItem[] = completed.map((f) => ({
      id: f.id,
      dealId: selectedDeal || 'unassigned',
      type: f.type as 'file' | 'image' | 'video' | 'document' | 'link',
      title: f.name,
      url: f.fileData || '#',
      size: f.size,
      uploadedAt: new Date().toISOString(),
      fileData: f.fileData,
    }));
    onUpload(materials);
    setUploadFiles([]);
    setSelectedDeal('');
    onClose();
  };

  const allCompleted = uploadFiles.length > 0 && uploadFiles.every((f) => f.completed);
  const hasFiles = uploadFiles.length > 0;

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
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="w-full max-w-[560px] max-h-[85vh] overflow-y-auto rounded-2xl p-6"
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
                Upload Files
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <X size={18} style={{ color: '#8A8A93' }} />
              </button>
            </div>

            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 mb-6"
              style={{
                border: isDragOver
                  ? '2px dashed #B8A14E'
                  : '2px dashed rgba(255, 255, 255, 0.12)',
                background: isDragOver ? 'rgba(184, 161, 78, 0.04)' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4,.mov"
              />
              <Upload
                size={48}
                style={{ color: isDragOver ? '#B8A14E' : '#55555E' }}
                className="mx-auto mb-4 transition-colors"
              />
              <p className="text-body mb-2" style={{ color: '#8A8A93' }}>
                {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-caption mb-3" style={{ color: '#55555E' }}>
                or
              </p>
              <button
                className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#F5F5F0',
                  background: 'transparent',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse files
              </button>
              <p className="text-caption mt-4" style={{ color: '#55555E' }}>
                PDF, DOC, XLS, PNG, JPG, MP4 — up to 50MB each
              </p>
            </div>

            {/* File list */}
            <AnimatePresence>
              {hasFiles && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 space-y-3"
                >
                  {uploadFiles.map((uf) => (
                    <div
                      key={uf.id}
                      className="flex items-center gap-3 rounded-xl p-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                      >
                        {uf.completed ? (
                          <Check size={16} style={{ color: '#10B981' }} />
                        ) : (
                          <File size={16} style={{ color: '#8A8A93' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[13px] font-medium truncate"
                          style={{ color: '#F5F5F0' }}
                        >
                          {uf.name}
                        </p>
                        <p className="text-caption" style={{ color: '#55555E' }}>
                          {uf.size}
                        </p>
                        {!uf.completed && (
                          <div
                            className="w-full h-1.5 rounded-full mt-2 overflow-hidden"
                            style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: '#B8A14E' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${uf.progress}%` }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                            />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(uf.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5 flex-shrink-0"
                      >
                        <X size={14} style={{ color: '#55555E' }} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Deal selection */}
            {hasFiles && (
              <div className="mb-6">
                <label
                  className="text-caption block mb-2"
                  style={{ color: '#8A8A93' }}
                >
                  Attach to deal (optional):
                </label>
                <select
                  value={selectedDeal}
                  onChange={(e) => setSelectedDeal(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition-all duration-200 cursor-pointer"
                  style={{
                    background: '#14141C',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  <option value="">No deal (upload only)</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.ticker}] {d.companyName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            {hasFiles && (
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    setUploadFiles([]);
                    setSelectedDeal('');
                  }}
                  className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#F5F5F0',
                    background: 'transparent',
                  }}
                >
                  Clear All
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!allCompleted}
                  className="px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 50%, #D4C070 100%)',
                    color: '#0A0A0F',
                  }}
                >
                  Upload {uploadFiles.length > 1 ? `& Attach ${uploadFiles.length} Files` : '& Attach'}
                </button>
              </div>
            )}

            {/* No files hint */}
            {!hasFiles && (
              <div className="flex items-center gap-2 mt-4" style={{ color: '#55555E' }}>
                <AlertCircle size={14} />
                <span className="text-caption">Select files to begin upload</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
