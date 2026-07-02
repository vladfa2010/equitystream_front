import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Search } from 'lucide-react';
import { clients } from '@/data/mockData';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (clientId: string, amount: string) => void;
  existingClientIds: string[];
}

export default function AddClientModal({ isOpen, onClose, onAdd, existingClientIds }: AddClientModalProps) {
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const availableClients = useMemo(() => {
    return clients.filter(c => !existingClientIds.includes(c.id) && (
      !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, existingClientIds]);

  const handleAdd = () => {
    if (selectedClientId && amount) {
      onAdd(selectedClientId, amount);
      setSelectedClientId(null);
      setAmount('');
      setSearch('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedClientId(null);
    setAmount('');
    setSearch('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg"
          >
            <div
              className="glass-panel"
              style={{ padding: 32 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <UserPlus size={20} style={{ color: '#B8A14E' }} />
                  <h3 className="text-h3" style={{ color: '#F5F5F0' }}>Add Client</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: '#8A8A93' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full text-[14px] outline-none transition-all duration-200"
                  style={{
                    background: '#14141C',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 16px 12px 40px',
                    color: '#F5F5F0',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#B8A14E';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Client List */}
              <div
                className="mb-4 overflow-y-auto"
                style={{ maxHeight: 280, borderRadius: 12 }}
              >
                {availableClients.length === 0 ? (
                  <div className="text-center py-8" style={{ color: '#55555E' }}>
                    No available clients
                  </div>
                ) : (
                  availableClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className="flex items-center gap-3 w-full text-left transition-colors"
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: selectedClientId === client.id ? 'rgba(184, 161, 78, 0.08)' : 'transparent',
                        borderLeft: selectedClientId === client.id ? '3px solid #B8A14E' : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedClientId !== client.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedClientId !== client.id) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="w-8 h-8 rounded-full"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium" style={{ color: '#F5F5F0' }}>{client.name}</p>
                        <p className="text-[12px]" style={{ color: '#55555E' }}>{client.email}</p>
                      </div>
                      {selectedClientId === client.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#B8A14E' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0A0A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Amount input */}
              {selectedClientId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <label className="block text-[13px] font-medium mb-2" style={{ color: '#8A8A93' }}>
                    Investment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}>
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d.]/g, '');
                        const parts = raw.split('.');
                        const cleaned = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
                        setAmount(cleaned);
                      }}
                      placeholder="0.00"
                      className="w-full text-[14px] outline-none transition-all duration-200"
                      style={{
                        background: '#14141C',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: '12px 16px 12px 32px',
                        color: '#F5F5F0',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#B8A14E';
                        e.target.style.boxShadow = '0 0 0 3px rgba(184, 161, 78, 0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button className="btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleAdd}
                  disabled={!selectedClientId || !amount}
                  style={{ opacity: !selectedClientId || !amount ? 0.5 : 1, cursor: !selectedClientId || !amount ? 'not-allowed' : 'pointer' }}
                >
                  Add to Deal
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
