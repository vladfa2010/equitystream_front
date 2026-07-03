import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import type { ClientResponse } from '@/api';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (client: ClientResponse) => void;
}

export default function AddClientModal({ isOpen, onClose, onAdd }: AddClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const canSubmit = name.trim().length > 0 && isValidEmail(email) && !isSubmitting;

  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newClient: ClientResponse = {
      id: `c${Date.now()}`,
      fullName: name.trim(),
      name: name.trim(),
      nickname: email.trim().split('@')[0],
      dateOfBirth: null,
      role: 'client',
      email: email.trim(),
      phone: phone.trim() || null,
      telegram: null,
      notes: notes.trim() || null,
      contractUrl: null,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      idDocumentUrl: null,
      status: 'active',
      totalInvested: 0,
      totalPnl: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAdd(newClient);
    setIsSubmitting(false);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setEmailError('');
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      setEmailError('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
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
            className="relative w-full max-w-[480px] glass-panel p-6 sm:p-8"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
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

            <h2 className="text-h2 mb-6" style={{ color: '#F5F5F0' }}>
              Add New Client
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption" style={{ color: '#8A8A93' }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter client name"
                  required
                  className="w-full outline-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption" style={{ color: '#8A8A93' }}>
                  Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="client@example.com"
                  required
                  className="w-full outline-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: emailError
                      ? '1px solid rgba(239,68,68,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
                  }}
                  onBlur={(e) => {
                    handleEmailBlur();
                    e.currentTarget.style.borderColor = emailError
                      ? 'rgba(239,68,68,0.5)'
                      : 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {emailError && (
                  <span className="text-caption" style={{ color: '#EF4444' }}>
                    {emailError}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption" style={{ color: '#8A8A93' }}>
                  Phone <span style={{ color: '#55555E' }}>(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full outline-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-caption" style={{ color: '#8A8A93' }}>
                  Notes <span style={{ color: '#55555E' }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full outline-none resize-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#F5F5F0',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  style={{
                    opacity: canSubmit ? 1 : 0.5,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
