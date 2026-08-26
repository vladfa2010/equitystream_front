import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import type { ClientResponse } from '@/api';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<ClientResponse>) => void;
  onDelete?: (clientId: string) => void;
  client: ClientResponse | null;
}

const inputStyle: React.CSSProperties = {
  background: '#14141C',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '12px 16px',
  color: '#F5F5F0',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
  outline: 'none',
};

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#B8A14E';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.boxShadow = 'none';
  },
};

export default function EditClientModal({ isOpen, onClose, onSave, onDelete, client }: EditClientModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setRole(client.role || 'client');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setNotes(client.notes || '');
      setStatus(client.status || 'active');
      setShowDeleteConfirm(false);
      setDeleteConfirmName('');
    }
  }, [client]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const canSubmit = name.trim().length > 0 && isValidEmail(email) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !client) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    onSave({
      name: name.trim(),
      role,
      email: email.trim(),
      phone: phone.trim() || null,
      notes: notes.trim() || null,
      status,
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setShowDeleteConfirm(false);
    setDeleteConfirmName('');
    onClose();
  };

  const handleDelete = async () => {
    if (!client || deleteConfirmName !== client.name) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onDelete?.(client.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setDeleteConfirmName('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && client && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '32px',
            }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
              style={{ color: '#8A8A93' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F5F0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8A8A93')}
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-bold mb-1" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
              Edit Profile
            </h2>
            <p className="text-sm mb-6" style={{ color: '#8A8A93' }}>
              {client.name}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: '#B8A14E' }}>
                  Personal Information
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Name <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} {...focusHandlers} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'client')} style={inputStyle} {...focusHandlers}>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} style={inputStyle} {...focusHandlers}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: '#B8A14E' }}>
                  Contact Information
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Email <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} {...focusHandlers} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1-555-123-4567" style={inputStyle} {...focusHandlers} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes about the client..." style={inputStyle} {...focusHandlers} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-3 rounded-xl text-[14px] font-medium transition-colors flex items-center gap-2"
                  style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-colors hover:bg-white/5"
                  style={{ color: '#8A8A93', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>

            {showDeleteConfirm && (
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.16)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle size={20} style={{ color: '#EF4444' }} />
                  <div>
                    <h3 className="text-[16px] font-semibold mb-1" style={{ color: '#F5F5F0' }}>Deactivate client?</h3>
                    <p className="text-[13px]" style={{ color: '#8A8A93' }}>
                      Type <strong style={{ color: '#F5F5F0' }}>{client.name}</strong> to confirm deactivation.
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Type client name"
                  style={inputStyle}
                  className="mb-3"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-xl text-[13px] transition-colors hover:bg-white/5"
                    style={{ color: '#8A8A93', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteConfirmName !== client.name || isDeleting}
                    className="flex-1 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: '#EF4444', color: '#fff' }}
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Deactivate'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
