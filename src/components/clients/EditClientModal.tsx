import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import type { ClientResponse } from '@/api';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: ClientResponse) => void;
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
  // All form fields
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load client data into form
  useEffect(() => {
    if (client) {
      setFullName(client.fullName || client.name || '');
      setNickname(client.nickname || '');
      setDateOfBirth(client.dateOfBirth ? client.dateOfBirth.split('T')[0] : '');
      setRole(client.role || 'client');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setTelegram(client.telegram ? client.telegram.replace('@', '') : '');
      setNotes(client.notes || '');
      setShowDeleteConfirm(false);
      setDeleteConfirmName('');
    }
  }, [client]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const canSubmit = fullName.trim().length > 0 && isValidEmail(email) && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !client) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSave({
      ...client,
      fullName: fullName.trim(),
      name: fullName.trim(),
      nickname: nickname.trim(),
      dateOfBirth: dateOfBirth || null,
      role,
      email: email.trim(),
      phone: phone.trim() || null,
      telegram: telegram.trim() ? (telegram.trim().startsWith('@') ? telegram.trim() : `@${telegram.trim()}`) : null,
      notes: notes.trim() || null,
      updatedAt: new Date().toISOString(),
    } as ClientResponse);

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
    if (!client || deleteConfirmName !== (client.fullName || client.name)) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    onDelete?.(client.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setDeleteConfirmName('');
    onClose();
  };

  const resetForm = () => {
    if (client) {
      setFullName(client.fullName || client.name || '');
      setNickname(client.nickname || '');
      setDateOfBirth(client.dateOfBirth ? client.dateOfBirth.split('T')[0] : '');
      setRole(client.role || 'client');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setTelegram(client.telegram ? client.telegram.replace('@', '') : '');
      setNotes(client.notes || '');
    }
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
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
            {/* Close button */}
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
              {client.fullName || client.name}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Section: Personal Information */}
              <div className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: '#B8A14E' }}>
                  Personal Information
                </h3>

                <div className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} {...focusHandlers} />
                  </div>

                  {/* Nickname */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Nickname / Username</label>
                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="@username" style={inputStyle} {...focusHandlers} />
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={inputStyle} {...focusHandlers} />
                  </div>

                  {/* Role */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'client')} style={inputStyle} {...focusHandlers}>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Contact Information */}
              <div className="pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs uppercase tracking-wider mb-4 font-semibold" style={{ color: '#B8A14E' }}>
                  Contact Information
                </h3>

                <div className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Email <span style={{ color: '#EF4444' }}>*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ ...inputStyle, borderColor: !isValidEmail(email) && email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)' }}
                      {...focusHandlers}
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" style={inputStyle} {...focusHandlers} />
                  </div>

                  {/* Telegram */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Telegram</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#55555E' }}>@</span>
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="username"
                        style={{ ...inputStyle, paddingLeft: 28 }}
                        {...focusHandlers}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: '#8A8A93' }}>Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={3}
                      className="resize-none"
                      style={inputStyle}
                      {...focusHandlers}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#8A8A93', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-[2] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: canSubmit ? 'linear-gradient(135deg, #B8A14E, #C9B25F)' : 'rgba(184,161,78,0.2)',
                      color: '#0A0A0F',
                      opacity: canSubmit ? 1 : 0.5,
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {/* Delete Account Section */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(239,68,68,0.15)' }}>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => { setShowDeleteConfirm(true); setDeleteConfirmName(''); }}
                      className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                    >
                      <Trash2 size={14} /> Delete Account
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                        <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>Delete Account</span>
                      </div>
                      <p className="text-xs mb-3" style={{ color: '#8A8A93' }}>
                        This will permanently delete the client and all associated data. Type the client's full name to confirm:
                      </p>
                      <p className="text-sm font-semibold mb-3" style={{ color: '#B8A14E' }}>
                        {client.fullName || client.name}
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        placeholder={`Type "${client.fullName || client.name}" to confirm`}
                        className="w-full px-4 py-2.5 rounded-xl text-sm mb-3 outline-none"
                        style={{
                          background: '#0A0A0F',
                          border: `1px solid ${deleteConfirmName === (client.fullName || client.name) ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: '#F5F5F0',
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmName(''); }}
                          className="flex-1 py-2 rounded-lg text-xs font-medium"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={deleteConfirmName !== (client.fullName || client.name) || isDeleting}
                          onClick={handleDelete}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                          style={{
                            background: deleteConfirmName === (client.fullName || client.name) && !isDeleting ? '#EF4444' : 'rgba(239,68,68,0.2)',
                            color: '#F5F5F0',
                            opacity: deleteConfirmName === (client.fullName || client.name) && !isDeleting ? 1 : 0.4,
                            cursor: deleteConfirmName === (client.fullName || client.name) && !isDeleting ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {isDeleting && <Loader2 size={12} className="animate-spin" />}
                          {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
