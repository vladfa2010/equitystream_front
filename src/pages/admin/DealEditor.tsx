import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, TrendingUp, Globe, Users, Crown, Pencil, Trash2,
  Plus, Search, X, ChevronRight, ChevronLeft, AlertTriangle,
  CheckCircle2, XCircle, Percent, Upload, Equal, Sparkles,
  Mail, Calendar, DollarSign, Calculator
} from 'lucide-react';
import StepIndicator from '../../components/deals/StepIndicator';
import CurrencyInput from '../../components/deals/CurrencyInput';
import { clients, formatCurrency as fmtCur } from '../../data/mockData';
import type { Client } from '../../data/mockData';

// =============================================================================
// TYPES
// =============================================================================

interface CompanyForm {
  companyName: string;
  ticker: string;
  exchange: string;
  sector: string;
  description: string;
  totalVolume: string;
  sharePrice: string;
  marketCap: string;
  website: string;
  founders: string;
  logoPreview: string | null;
  managementFee: string;
  targetPrice: string;
  timeHorizon: string;
}

interface ClientAllocation {
  clientId: string;
  amount: string;
  isLead: boolean;
  entryPrice: string;
}

interface FormErrors {
  [key: string]: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STEPS = ['Company Information', 'Client Allocations', 'Review & Create'];
const EXCHANGES = ['NASDAQ', 'NYSE', 'AMEX', 'OTC', 'OTHER'];
const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial', 'Materials', 'Utilities', 'Real Estate', 'Telecom'];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const GLASS = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(24px) saturate(140%)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
};

const INPUT_STYLE = {
  background: '#14141C',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#F5F5F0',
  fontFamily: 'Inter, system-ui, sans-serif',
};

// =============================================================================
// MOCK "FETCH DATA" DATA
// =============================================================================

const MOCK_COMPANY_DATA: Record<string, Partial<CompanyForm>> = {
  AAPL: { companyName: 'Apple Inc.', sector: 'Technology', marketCap: '3200000000000', description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', website: 'https://www.apple.com', founders: 'Steve Jobs, Steve Wozniak, Ronald Wayne' },
  NVDA: { companyName: 'NVIDIA Corporation', sector: 'Technology', marketCap: '2800000000000', description: 'NVIDIA Corporation provides graphics, and compute and networking solutions worldwide.', website: 'https://www.nvidia.com', founders: 'Jensen Huang, Chris Malachowsky, Curtis Priem' },
  TSLA: { companyName: 'Tesla, Inc.', sector: 'Consumer', marketCap: '750000000000', description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.', website: 'https://www.tesla.com', founders: 'Elon Musk, JB Straubel, Martin Eberhard' },
  MSFT: { companyName: 'Microsoft Corporation', sector: 'Technology', marketCap: '3100000000000', description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.', website: 'https://www.microsoft.com', founders: 'Bill Gates, Paul Allen' },
  GOOGL: { companyName: 'Alphabet Inc.', sector: 'Technology', marketCap: '2100000000000', description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, and internationally.', website: 'https://abc.xyz', founders: 'Larry Page, Sergey Brin' },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function parseNum(v: string): number {
  return parseFloat(v.replace(/,/g, '')) || 0;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function getLogoFromTicker(ticker: string): string {
  const letter = (ticker[0] || 'C').toUpperCase();
  const colors = ['#B8A14E', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'];
  const color = colors[letter.charCodeAt(0) % colors.length];
  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><rect width=\"120\" height=\"120\" rx=\"24\" fill=\"${color}\"/><text x=\"60\" y=\"78\" font-family=\"Arial\" font-size=\"56\" font-weight=\"bold\" fill=\"white\" text-anchor=\"middle\">${letter}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// =============================================================================
// SUB-COMPONENT: GlassCard
// =============================================================================

function GlassCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ ...GLASS, padding: 24, ...style }}>
      {children}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: FormField
// =============================================================================

function FormField({ label, required, error, children, hint }: { label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="w-full">
      <label className="block text-[13px] font-medium mb-2" style={{ color: '#8A8A93', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {label}
        {required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-[12px] font-medium" style={{ color: '#EF4444' }}>{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-[12px]" style={{ color: '#55555E' }}>{hint}</p>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: Step 1 - Company Information
// =============================================================================

interface Step1Props {
  form: CompanyForm;
  setForm: React.Dispatch<React.SetStateAction<CompanyForm>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

function Step1CompanyInfo({ form, setForm, errors, setErrors }: Step1Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const shareQuantity = useMemo(() => {
    const vol = parseNum(form.totalVolume);
    const price = parseNum(form.sharePrice);
    if (!vol || !price) return '0.0000';
    return (vol / price).toFixed(4);
  }, [form.totalVolume, form.sharePrice]);

  const updateField = useCallback((field: keyof CompanyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, [setForm, errors, setErrors]);

  const handleFetchData = useCallback(() => {
    const ticker = form.ticker.toUpperCase();
    if (!ticker) return;
    const data = MOCK_COMPANY_DATA[ticker];
    if (data) {
      setForm(prev => ({ ...prev, ...data }));
    }
  }, [form.ticker, setForm]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateField('logoPreview', ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [updateField]);

  const logoUrl = form.logoPreview || (form.ticker ? getLogoFromTicker(form.ticker) : null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Fields */}
      <div className="lg:col-span-2 space-y-5">
        {/* Row: Company Name + Ticker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Company Name" required error={errors.companyName}>
            <input
              type="text"
              value={form.companyName}
              onChange={e => updateField('companyName', e.target.value)}
              placeholder="e.g. Apple Inc."
              maxLength={100}
              className="w-full text-[14px] px-4 py-3 outline-none transition-all duration-200"
              style={{
                ...INPUT_STYLE,
                borderColor: errors.companyName ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
                boxShadow: errors.companyName ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
              }}
              onFocus={e => { if (!errors.companyName) { e.target.style.borderColor = '#B8A14E'; e.target.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)'; } }}
              onBlur={e => { e.target.style.borderColor = errors.companyName ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </FormField>

          <FormField label="Ticker Symbol" required error={errors.ticker}>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.ticker}
                onChange={e => updateField('ticker', e.target.value.toUpperCase().slice(0, 10))}
                placeholder="e.g. AAPL"
                maxLength={10}
                className="flex-1 text-[14px] px-4 py-3 outline-none transition-all duration-200 uppercase"
                style={{
                  ...INPUT_STYLE,
                  fontFamily: 'JetBrains Mono, monospace',
                  borderColor: errors.ticker ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
                  boxShadow: errors.ticker ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
                }}
                onFocus={e => { if (!errors.ticker) { e.target.style.borderColor = '#B8A14E'; e.target.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)'; } }}
                onBlur={e => { e.target.style.borderColor = errors.ticker ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={handleFetchData}
                disabled={!form.ticker}
                className="px-3 py-2 text-[12px] font-medium rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'rgba(184,161,78,0.15)', color: '#B8A14E', border: '1px solid rgba(184,161,78,0.3)' }}
                onMouseEnter={e => { if (form.ticker) { e.currentTarget.style.background = 'rgba(184,161,78,0.25)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(184,161,78,0.15)'; }}
              >
                <Sparkles size={13} />
                Fetch
              </button>
            </div>
          </FormField>
        </div>

        {/* Row: Exchange + Sector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Exchange" required error={errors.exchange}>
            <select
              value={form.exchange}
              onChange={e => updateField('exchange', e.target.value)}
              className="w-full text-[14px] px-4 py-3 outline-none transition-all duration-200 appearance-none cursor-pointer"
              style={{
                ...INPUT_STYLE,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A93' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: 40,
                borderColor: errors.exchange ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
              }}
              onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
              onBlur={e => { e.target.style.borderColor = errors.exchange ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; }}
            >
              <option value="" style={{ background: '#14141C' }}>Select exchange...</option>
              {EXCHANGES.map(e => <option key={e} value={e} style={{ background: '#14141C' }}>{e}</option>)}
            </select>
          </FormField>

          <FormField label="Sector">
            <select
              value={form.sector}
              onChange={e => updateField('sector', e.target.value)}
              className="w-full text-[14px] px-4 py-3 outline-none transition-all duration-200 appearance-none cursor-pointer"
              style={{
                ...INPUT_STYLE,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A93' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: 40,
              }}
              onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <option value="" style={{ background: '#14141C' }}>Select sector...</option>
              {SECTORS.map(s => <option key={s} value={s} style={{ background: '#14141C' }}>{s}</option>)}
            </select>
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description" hint={`${form.description.length}/500 characters`}>
          <textarea
            value={form.description}
            onChange={e => updateField('description', e.target.value.slice(0, 500))}
            placeholder="Brief company description..."
            rows={3}
            maxLength={500}
            className="w-full text-[14px] px-4 py-3 outline-none transition-all duration-200 resize-none"
            style={{ ...INPUT_STYLE }}
            onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </FormField>

        {/* Row: Total Volume + Share Price + Share Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Total Deal Volume" required error={errors.totalVolume}>
            <CurrencyInput
              value={form.totalVolume}
              onChange={v => updateField('totalVolume', v)}
              placeholder="0.00"
              error={errors.totalVolume}
            />
          </FormField>

          <FormField label="Share Price" required error={errors.sharePrice}>
            <CurrencyInput
              value={form.sharePrice}
              onChange={v => updateField('sharePrice', v)}
              placeholder="0.00"
              error={errors.sharePrice}
            />
          </FormField>

          <FormField label="Share Quantity" hint="Auto-calculated">
            <div
              className="w-full text-[14px] px-4 py-3 flex items-center"
              style={{
                background: '#0E0E14',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                color: '#55555E',
                fontFamily: 'JetBrains Mono, monospace',
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              {shareQuantity}
            </div>
          </FormField>
        </div>

        {/* Row: Market Cap + Target Price + Time Horizon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Market Cap">
            <CurrencyInput
              value={form.marketCap}
              onChange={v => updateField('marketCap', v)}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Target Price">
            <CurrencyInput
              value={form.targetPrice}
              onChange={v => updateField('targetPrice', v)}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Time Horizon">
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
              <input
                type="date"
                value={form.timeHorizon}
                onChange={e => updateField('timeHorizon', e.target.value)}
                className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
                style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </FormField>
        </div>

        {/* Row: Website + Founders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Company Website">
            <div className="relative">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
              <input
                type="url"
                value={form.website}
                onChange={e => updateField('website', e.target.value)}
                placeholder="https://..."
                className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
                style={{ ...INPUT_STYLE, fontFamily: 'Inter, system-ui, sans-serif' }}
                onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </FormField>

          <FormField label="Founder(s)" hint="Max 200 characters">
            <input
              type="text"
              value={form.founders}
              onChange={e => updateField('founders', e.target.value.slice(0, 200))}
              placeholder="e.g. Elon Musk"
              maxLength={200}
              className="w-full text-[14px] px-4 py-3 outline-none transition-all duration-200"
              style={{ ...INPUT_STYLE }}
              onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </FormField>
        </div>

        {/* Management Fee */}
        <FormField label="Management Fee %">
          <div className="relative">
            <Percent size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
            <input
              type="number"
              value={form.managementFee}
              onChange={e => updateField('managementFee', clamp(parseFloat(e.target.value) || 0, 0, 100).toString())}
              placeholder="0.00"
              min={0}
              max={100}
              step={0.01}
              className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
              style={{ ...INPUT_STYLE, fontFeatureSettings: '"tnum" 1' }}
              onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </div>
        </FormField>

        {/* Logo Upload */}
        <FormField label="Company Logo">
          <div className="flex items-center gap-4">
            {logoUrl && (
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={logoUrl}
                alt="Logo"
                className="w-14 h-14 rounded-xl object-cover"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              />
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="px-4 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#8A8A93', border: '1px dashed rgba(255,255,255,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,161,78,0.4)'; e.currentTarget.style.color = '#B8A14E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#8A8A93'; }}
            >
              <Upload size={14} />
              {form.logoPreview ? 'Change Logo' : 'Upload Logo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        </FormField>
      </div>

      {/* Live Preview Card */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-5">
              <Building2 size={16} style={{ color: '#B8A14E' }} />
              <h3 className="text-[14px] font-semibold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                Live Preview
              </h3>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Building2 size={28} style={{ color: '#55555E' }} />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-[16px] font-bold truncate" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                  {form.companyName || 'Company Name'}
                </h4>
                <p className="text-[13px] font-medium mt-0.5" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}>
                  {form.ticker || 'TICKER'}
                  {form.exchange && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#55555E' }}>{form.exchange}</span>}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Total Volume', value: form.totalVolume ? fmtCur(parseNum(form.totalVolume)) : '-' },
                { label: 'Share Price', value: form.sharePrice ? `$${parseNum(form.sharePrice).toFixed(2)}` : '-' },
                { label: 'Share Qty', value: shareQuantity !== '0.0000' ? shareQuantity : '-' },
                { label: 'Market Cap', value: form.marketCap ? fmtCur(parseNum(form.marketCap)) : '-' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-[12px]" style={{ color: '#8A8A93' }}>{item.label}</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}



// =============================================================================
// SUB-COMPONENT: Add Client Modal
// =============================================================================

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (allocation: ClientAllocation) => void;
  existingClientIds: string[];
  sharePrice: string;
  remaining: number;
  hasLead: boolean;
}

function AddClientModal({ isOpen, onClose, onAdd, existingClientIds, sharePrice, remaining, hasLead }: AddClientModalProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [usePercent, setUsePercent] = useState(false);
  const [percentOfTotal, setPercentOfTotal] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [entryPrice, setEntryPrice] = useState(sharePrice);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const totalVolume = parseNum(sharePrice) > 0 ? remaining + 0 : 0;

  const availableClients = useMemo(() =>
    clients.filter(c => c.status === 'active' && !existingClientIds.includes(c.id) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))),
    [existingClientIds, searchQuery]
  );

  // Selected client info (used for display in modal)
  const _selectedClient = clients.find(c => c.id === selectedClientId);
  void _selectedClient;

  const finalAmount = useMemo(() => {
    if (usePercent && percentOfTotal && totalVolume > 0) {
      return ((parseFloat(percentOfTotal) || 0) / 100 * totalVolume).toFixed(2);
    }
    return amount;
  }, [usePercent, percentOfTotal, amount, totalVolume]);

  const handleAdd = () => {
    setError('');
    if (!selectedClientId) { setError('Please select a client'); return; }
    const amt = parseFloat(finalAmount);
    if (!amt || amt <= 0) { setError('Amount must be greater than 0'); return; }
    if (amt > remaining + 0.01) { setError(`Amount exceeds remaining ${fmtCur(remaining)}`); return; }

    onAdd({ clientId: selectedClientId, amount: finalAmount, isLead, entryPrice });
    // Reset
    setSelectedClientId('');
    setAmount('');
    setPercentOfTotal('');
    setIsLead(false);
    setEntryPrice(sharePrice);
    setSearchQuery('');
    setUsePercent(false);
    onClose();
  };

  const handleUseRemaining = () => {
    setAmount(remaining.toFixed(2));
    setUsePercent(false);
  };

  useEffect(() => {
    if (isOpen) {
      setEntryPrice(sharePrice);
      setError('');
    }
  }, [isOpen, sharePrice]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="w-full max-w-md max-h-[85vh] overflow-y-auto"
          style={{ ...GLASS, background: '#12121A', padding: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
              Add Client
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#8A8A93' }} onMouseEnter={e => e.currentTarget.style.color = '#F5F5F0'} onMouseLeave={e => e.currentTarget.style.color = '#8A8A93'}>
              <X size={18} />
            </button>
          </div>

          {/* Client Selector */}
          <div className="mb-4">
            <label className="block text-[12px] font-medium mb-2" style={{ color: '#8A8A93' }}>Select Client</label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full text-[13px] pl-9 pr-4 py-2.5 outline-none"
                style={{ ...INPUT_STYLE }}
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
              {availableClients.length === 0 && (
                <p className="text-[12px] py-3 text-center" style={{ color: '#55555E' }}>No available clients</p>
              )}
              {availableClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 text-left"
                  style={{
                    background: selectedClientId === client.id ? 'rgba(184,161,78,0.12)' : 'transparent',
                    border: selectedClientId === client.id ? '1px solid rgba(184,161,78,0.3)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (selectedClientId !== client.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (selectedClientId !== client.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <img src={client.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: '#F5F5F0' }}>{client.name}</p>
                    <p className="text-[11px] truncate" style={{ color: '#55555E' }}>{client.email}</p>
                  </div>
                  {selectedClientId === client.id && <CheckCircle2 size={16} className="ml-auto flex-shrink-0" style={{ color: '#B8A14E' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-medium" style={{ color: '#8A8A93' }}>Position Amount</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUsePercent(!usePercent)}
                  className="text-[11px] px-2 py-1 rounded-lg transition-colors"
                  style={{ background: usePercent ? 'rgba(184,161,78,0.15)' : 'rgba(255,255,255,0.05)', color: usePercent ? '#B8A14E' : '#55555E' }}
                >
                  % Mode
                </button>
                <button
                  onClick={handleUseRemaining}
                  className="text-[11px] px-2 py-1 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#8A8A93' }}
                >
                  Use Remaining
                </button>
              </div>
            </div>
            {usePercent ? (
              <div className="relative">
                <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
                <input
                  type="number"
                  value={percentOfTotal}
                  onChange={e => setPercentOfTotal(e.target.value)}
                  placeholder="0"
                  min={0}
                  max={100}
                  step={0.1}
                  className="w-full text-[14px] pl-9 pr-4 py-3 outline-none"
                  style={{ ...INPUT_STYLE, fontFeatureSettings: '"tnum" 1' }}
                />
              </div>
            ) : (
              <CurrencyInput value={amount} onChange={setAmount} placeholder="0.00" />
            )}
            {finalAmount && parseFloat(finalAmount) > 0 && (
              <p className="mt-1.5 text-[11px]" style={{ color: '#55555E' }}>
                = {fmtCur(parseFloat(finalAmount) || 0)}
              </p>
            )}
          </div>

          {/* Entry Price */}
          <div className="mb-4">
            <label className="block text-[12px] font-medium mb-2" style={{ color: '#8A8A93' }}>Entry Price (override)</label>
            <CurrencyInput value={entryPrice} onChange={setEntryPrice} placeholder="0.00" />
          </div>

          {/* Lead Toggle */}
          <div className="mb-5 flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Crown size={15} style={{ color: isLead ? '#B8A14E' : '#55555E' }} />
              <span className="text-[13px] font-medium" style={{ color: '#F5F5F0' }}>Lead Investor</span>
              {hasLead && !isLead && <span className="text-[10px]" style={{ color: '#55555E' }}>(replaces current)</span>}
            </div>
            <button
              onClick={() => setIsLead(!isLead)}
              className="relative w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: isLead ? '#B8A14E' : 'rgba(255,255,255,0.1)' }}
            >
              <motion.div
                animate={{ x: isLead ? 20 : 2 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="absolute top-1 w-4 h-4 rounded-full"
                style={{ background: '#fff' }}
              />
            </button>
          </div>

          {error && (
            <p className="mb-3 text-[12px] font-medium flex items-center gap-1.5" style={{ color: '#EF4444' }}>
              <AlertTriangle size={13} /> {error}
            </p>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedClientId}
            className="w-full py-3 text-[14px] font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
          >
            Add Client
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// =============================================================================
// SUB-COMPONENT: Step 2 - Client Allocations
// =============================================================================

interface Step2Props {
  allocations: ClientAllocation[];
  setAllocations: React.Dispatch<React.SetStateAction<ClientAllocation[]>>;
  totalVolume: number;
  sharePrice: number;
}

function Step2ClientAllocations({ allocations, setAllocations, totalVolume, sharePrice }: Step2Props) {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalAllocated = useMemo(() =>
    allocations.reduce((sum, a) => sum + parseNum(a.amount), 0),
    [allocations]
  );

  const remaining = totalVolume - totalAllocated;
  const allocationPercent = totalVolume > 0 ? (totalAllocated / totalVolume) * 100 : 0;
  const leadClient = allocations.find(a => a.isLead);
  const leadName = leadClient ? clients.find(c => c.id === leadClient.clientId)?.name : 'None';

  const handleAdd = useCallback((allocation: ClientAllocation) => {
    setAllocations(prev => {
      let next = [...prev];
      if (allocation.isLead) {
        next = next.map(a => ({ ...a, isLead: false }));
      }
      next.push(allocation);
      return next;
    });
  }, [setAllocations]);

  const handleUpdate = useCallback((index: number, updated: ClientAllocation) => {
    setAllocations(prev => {
      let next = [...prev];
      if (updated.isLead) {
        next = next.map((a, i) => i === index ? a : { ...a, isLead: false });
      }
      next[index] = updated;
      return next;
    });
    setEditIndex(null);
  }, [setAllocations]);

  const handleRemove = useCallback((index: number) => {
    setAllocations(prev => prev.filter((_, i) => i !== index));
  }, [setAllocations]);

  const handleEqualSplit = useCallback(() => {
    if (allocations.length === 0 || remaining <= 0) return;
    const perClient = remaining / allocations.length;
    setAllocations(prev => prev.map(a => ({
      ...a,
      amount: (parseNum(a.amount) + perClient).toFixed(2),
    })));
  }, [allocations.length, remaining, setAllocations]);

  const handleClearAll = useCallback(() => {
    setAllocations([]);
    setShowClearConfirm(false);
  }, [setAllocations]);

  const barColor = allocationPercent > 100 ? '#EF4444' : allocationPercent === 100 ? '#10B981' : '#B8A14E';

  return (
    <div className="space-y-5">
      {/* Summary Bar */}
      <GlassCard style={{ padding: 20 }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
          <div>
            <p className="text-[11px] mb-1" style={{ color: '#8A8A93' }}>Total Volume</p>
            <p className="text-[15px] font-bold" style={{ color: '#B8A14E', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
              {fmtCur(totalVolume)}
            </p>
          </div>
          <div>
            <p className="text-[11px] mb-1" style={{ color: '#8A8A93' }}>Allocated</p>
            <p className="text-[15px] font-bold" style={{ color: barColor, fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
              {fmtCur(totalAllocated)}
            </p>
          </div>
          <div>
            <p className="text-[11px] mb-1" style={{ color: '#8A8A93' }}>Remaining</p>
            <p className="text-[15px] font-bold" style={{ color: remaining >= 0 ? '#10B981' : '#EF4444', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
              {fmtCur(remaining)}
            </p>
          </div>
          <div className="col-span-2">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px]" style={{ color: '#8A8A93' }}>Allocation</span>
              <span className="text-[11px] font-medium" style={{ color: barColor, fontFeatureSettings: '"tnum" 1' }}>{allocationPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                animate={{ width: `${Math.min(allocationPercent, 100)}%` }}
                transition={{ duration: 0.5, ease: EASE }}
                className="h-full rounded-full"
                style={{ background: barColor }}
              />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <Users size={12} style={{ color: '#8A8A93' }} />
              <span className="text-[12px]" style={{ color: '#F5F5F0' }}>{allocations.length} clients</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Crown size={12} style={{ color: '#B8A14E' }} />
              <span className="text-[12px] truncate max-w-[100px]" style={{ color: '#B8A14E' }}>{leadName}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Bulk Operations */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
        >
          <Plus size={15} /> Add Client
        </button>
        <button
          onClick={handleEqualSplit}
          disabled={allocations.length === 0 || remaining <= 0}
          className="px-4 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Equal size={14} /> Equal Split
        </button>
        {allocations.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {/* Allocations Table */}
      {allocations.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Users size={32} className="mx-auto mb-3" style={{ color: '#55555E' }} />
          <p className="text-[14px] font-medium mb-1" style={{ color: '#8A8A93' }}>No clients added yet</p>
          <p className="text-[12px] mb-4" style={{ color: '#55555E' }}>Add clients to allocate deal volume</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
          >
            <Plus size={15} /> Add First Client
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {allocations.map((alloc, index) => {
            const client = clients.find(c => c.id === alloc.clientId);
            if (!client) return null;
            const amt = parseNum(alloc.amount);
            const pct = totalVolume > 0 ? (amt / totalVolume) * 100 : 0;
            const shares = sharePrice > 0 ? (amt / sharePrice).toFixed(4) : '0.0000';

            return (
              <motion.div
                key={alloc.clientId + index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, ease: EASE }}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(24px) saturate(140%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: alloc.isLead ? '3px solid #B8A14E' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <img src={client.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold truncate" style={{ color: '#F5F5F0' }}>{client.name}</span>
                    {alloc.isLead && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,161,78,0.15)', color: '#B8A14E' }}>
                        <Crown size={10} /> LEAD
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[12px] font-medium" style={{ color: '#B8A14E', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
                      {fmtCur(amt)}
                    </span>
                    <span className="text-[11px]" style={{ color: '#55555E' }}>{pct.toFixed(1)}%</span>
                    <span className="text-[11px]" style={{ color: '#55555E' }}>{shares} sh @ ${parseNum(alloc.entryPrice).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!alloc.isLead && (
                    <button
                      onClick={() => setAllocations(prev => prev.map((a, i) => i === index ? { ...a, isLead: true } : { ...a, isLead: false }))}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: '#55555E' }}
                      title="Set as Lead"
                      onMouseEnter={e => e.currentTarget.style.color = '#B8A14E'}
                      onMouseLeave={e => e.currentTarget.style.color = '#55555E'}
                    >
                      <Crown size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => setEditIndex(index)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#55555E' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#B8A14E'}
                    onMouseLeave={e => e.currentTarget.style.color = '#55555E'}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#55555E' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#55555E'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editIndex !== null && allocations[editIndex] && (
        <EditAllocationModal
          allocation={allocations[editIndex]}
          client={clients.find(c => c.id === allocations[editIndex].clientId)!}
          onSave={(updated) => handleUpdate(editIndex, updated)}
          onClose={() => setEditIndex(null)}
          totalVolume={totalVolume}
          sharePrice={sharePrice}
          hasLead={!!leadClient && !allocations[editIndex].isLead}
        />
      )}

      {/* Add Modal */}
      <AddClientModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
        existingClientIds={allocations.map(a => a.clientId)}
        sharePrice={sharePrice.toString()}
        remaining={remaining}
        hasLead={!!leadClient}
      />

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <ConfirmModal
          title="Clear All Allocations?"
          message={`This will remove all ${allocations.length} client allocations. This action cannot be undone.`}
          confirmLabel="Clear All"
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm(false)}
          danger
        />
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: Edit Allocation Modal
// =============================================================================

function EditAllocationModal({ allocation, client, onSave, onClose, totalVolume, sharePrice: _sharePrice, hasLead }: {
  allocation: ClientAllocation;
  client: Client;
  onSave: (a: ClientAllocation) => void;
  onClose: () => void;
  totalVolume: number;
  sharePrice: number;
  hasLead: boolean;
}) {
  const [amount, setAmount] = useState(allocation.amount);
  const [isLead, setIsLead] = useState(allocation.isLead);
  const [entryPrice, setEntryPrice] = useState(allocation.entryPrice);
  const [error, setError] = useState('');

  const otherAllocated = totalVolume - parseNum(allocation.amount);
  const maxAllowed = totalVolume - otherAllocated;

  const handleSave = () => {
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Amount must be greater than 0'); return; }
    if (amt > maxAllowed + 0.01) { setError(`Amount exceeds remaining ${fmtCur(maxAllowed)}`); return; }

    onSave({ ...allocation, amount, isLead, entryPrice });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="w-full max-w-sm"
          style={{ ...GLASS, background: '#12121A', padding: 28 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Edit Allocation</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: '#8A8A93' }}><X size={18} /></button>
          </div>

          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <img src={client.avatar} alt="" className="w-10 h-10 rounded-full" />
            <div>
              <p className="text-[14px] font-semibold" style={{ color: '#F5F5F0' }}>{client.name}</p>
              <p className="text-[11px]" style={{ color: '#55555E' }}>{client.email}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[12px] font-medium mb-2" style={{ color: '#8A8A93' }}>Position Amount</label>
            <CurrencyInput value={amount} onChange={setAmount} placeholder="0.00" />
          </div>

          <div className="mb-4">
            <label className="block text-[12px] font-medium mb-2" style={{ color: '#8A8A93' }}>Entry Price</label>
            <CurrencyInput value={entryPrice} onChange={setEntryPrice} placeholder="0.00" />
          </div>

          <div className="mb-5 flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Crown size={15} style={{ color: isLead ? '#B8A14E' : '#55555E' }} />
              <span className="text-[13px] font-medium" style={{ color: '#F5F5F0' }}>Lead Investor</span>
              {hasLead && !isLead && <span className="text-[10px]" style={{ color: '#55555E' }}>(replaces current)</span>}
            </div>
            <button
              onClick={() => setIsLead(!isLead)}
              className="relative w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: isLead ? '#B8A14E' : 'rgba(255,255,255,0.1)' }}
            >
              <motion.div animate={{ x: isLead ? 20 : 2 }} transition={{ duration: 0.2, ease: EASE }} className="absolute top-1 w-4 h-4 rounded-full" style={{ background: '#fff' }} />
            </button>
          </div>

          {error && (
            <p className="mb-3 text-[12px] font-medium flex items-center gap-1.5" style={{ color: '#EF4444' }}>
              <AlertTriangle size={13} /> {error}
            </p>
          )}

          <button
            onClick={handleSave}
            className="w-full py-3 text-[14px] font-semibold rounded-xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
          >
            Save Changes
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// =============================================================================
// SUB-COMPONENT: Confirm Modal
// =============================================================================

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger }: {
  title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="w-full max-w-sm"
        style={{ ...GLASS, background: '#12121A', padding: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={20} style={{ color: danger ? '#EF4444' : '#B8A14E' }} />
          <h3 className="text-[16px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>{title}</h3>
        </div>
        <p className="text-[13px] mb-6" style={{ color: '#8A8A93' }}>{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200"
            style={{ background: danger ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: danger ? '#EF4444' : '#0A0A0F', border: danger ? '1px solid rgba(239,68,68,0.2)' : 'none' }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}



// =============================================================================
// SUB-COMPONENT: Step 3 - Review & Create
// =============================================================================

interface Step3Props {
  form: CompanyForm;
  allocations: ClientAllocation[];
  totalVolume: number;
  sharePrice: number;
}

function Step3Review({ form, allocations, totalVolume, sharePrice }: Step3Props) {
  const totalAllocated = useMemo(() => allocations.reduce((s, a) => s + parseNum(a.amount), 0), [allocations]);
  const allocationPercent = totalVolume > 0 ? (totalAllocated / totalVolume) * 100 : 0;
  const remaining = totalVolume - totalAllocated;
  const leadClient = allocations.find(a => a.isLead);
  const hasLead = !!leadClient;
  const managementFeeAmount = totalVolume * (parseFloat(form.managementFee) || 0) / 100;

  const logoUrl = form.logoPreview || (form.ticker ? getLogoFromTicker(form.ticker) : null);

  const checklist = [
    { label: 'Required fields filled', ok: !!(form.companyName && form.ticker && form.exchange && form.totalVolume && form.sharePrice) },
    { label: 'At least 1 client assigned', ok: allocations.length > 0, warn: allocations.length === 0 },
    { label: 'Lead investor assigned', ok: hasLead, warn: allocations.length > 0 && !hasLead },
    { label: 'Allocation within limit', ok: totalAllocated <= totalVolume, error: totalAllocated > totalVolume },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Deal + Clients */}
      <div className="lg:col-span-2 space-y-5">
        {/* Deal Summary Card */}
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <Building2 size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Deal Summary</h3>
          </div>

          <div className="flex items-start gap-4 mb-6">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Building2 size={28} style={{ color: '#55555E' }} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                {form.companyName || '—'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[13px] font-medium px-2.5 py-0.5 rounded-lg" style={{ background: 'rgba(184,161,78,0.12)', color: '#B8A14E', fontFamily: 'JetBrains Mono, monospace' }}>
                  {form.ticker || '—'}
                </span>
                {form.exchange && (
                  <span className="text-[12px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A93' }}>{form.exchange}</span>
                )}
                {form.sector && (
                  <span className="text-[12px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A93' }}>{form.sector}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Volume', value: fmtCur(totalVolume), icon: DollarSign },
              { label: 'Share Price', value: sharePrice > 0 ? `$${sharePrice.toFixed(2)}` : '—', icon: TrendingUp },
              { label: 'Share Qty', value: (sharePrice > 0 && totalVolume > 0) ? (totalVolume / sharePrice).toFixed(4) : '—', icon: Calculator },
              { label: 'Market Cap', value: form.marketCap ? fmtCur(parseNum(form.marketCap)) : '—', icon: Building2 },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <item.icon size={11} style={{ color: '#55555E' }} />
                  <span className="text-[11px]" style={{ color: '#55555E' }}>{item.label}</span>
                </div>
                <p className="text-[14px] font-semibold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {form.website && (
            <div className="flex items-center gap-2 mt-4">
              <Globe size={13} style={{ color: '#55555E' }} />
              <span className="text-[12px]" style={{ color: '#8A8A93' }}>{form.website}</span>
            </div>
          )}
          {form.founders && (
            <div className="flex items-center gap-2 mt-2">
              <Users size={13} style={{ color: '#55555E' }} />
              <span className="text-[12px]" style={{ color: '#8A8A93' }}>{form.founders}</span>
            </div>
          )}
          {form.description && (
            <p className="text-[12px] mt-3 leading-relaxed" style={{ color: '#8A8A93' }}>{form.description}</p>
          )}
        </GlassCard>

        {/* Client Allocations */}
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <Users size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
              Client Allocations ({allocations.length})
            </h3>
          </div>

          {allocations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[13px]" style={{ color: '#55555E' }}>No clients assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Lead Card */}
              {leadClient && (() => {
                const client = clients.find(c => c.id === leadClient.clientId);
                if (!client) return null;
                const amt = parseNum(leadClient.amount);
                const pct = totalVolume > 0 ? (amt / totalVolume) * 100 : 0;
                const shares = sharePrice > 0 ? (amt / sharePrice).toFixed(4) : '0.0000';
                return (
                  <div
                    key={client.id}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'rgba(184,161,78,0.06)', border: '1px solid rgba(184,161,78,0.2)' }}
                  >
                    <div className="relative">
                      <img src={client.avatar} alt="" className="w-12 h-12 rounded-full" style={{ border: '2px solid #B8A14E' }} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#B8A14E' }}>
                        <Crown size={11} color="#0A0A0F" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold" style={{ color: '#F5F5F0' }}>{client.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,161,78,0.2)', color: '#B8A14E' }}>LEAD</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[13px] font-semibold" style={{ color: '#B8A14E', fontFamily: 'JetBrains Mono, monospace' }}>{fmtCur(amt)}</span>
                        <span className="text-[11px]" style={{ color: '#8A8A93' }}>{pct.toFixed(1)}%</span>
                        <span className="text-[11px]" style={{ color: '#55555E' }}>{shares} shares @ ${parseNum(leadClient.entryPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Other Investors */}
              {allocations.filter(a => !a.isLead).map(alloc => {
                const client = clients.find(c => c.id === alloc.clientId);
                if (!client) return null;
                const amt = parseNum(alloc.amount);
                const pct = totalVolume > 0 ? (amt / totalVolume) * 100 : 0;
                const shares = sharePrice > 0 ? (amt / sharePrice).toFixed(4) : '0.0000';
                return (
                  <div key={client.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={client.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: '#F5F5F0' }}>{client.name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5">
                        <span className="text-[12px] font-medium" style={{ color: '#B8A14E', fontFamily: 'JetBrains Mono, monospace' }}>{fmtCur(amt)}</span>
                        <span className="text-[11px]" style={{ color: '#8A8A93' }}>{pct.toFixed(1)}%</span>
                        <span className="text-[11px]" style={{ color: '#55555E' }}>{shares} shares @ ${parseNum(alloc.entryPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Right Column: Validation + Summary */}
      <div className="lg:col-span-1 space-y-5">
        {/* Validation Checklist */}
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <CheckCircle2 size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Validation</h3>
          </div>
          <div className="space-y-3">
            {checklist.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                {item.error ? (
                  <XCircle size={16} style={{ color: '#EF4444' }} className="flex-shrink-0" />
                ) : item.warn ? (
                  <AlertTriangle size={16} style={{ color: '#F59E0B' }} className="flex-shrink-0" />
                ) : item.ok ? (
                  <CheckCircle2 size={16} style={{ color: '#10B981' }} className="flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ border: '2px solid #55555E' }} />
                )}
                <span className="text-[12px]" style={{ color: item.error ? '#EF4444' : item.warn ? '#F59E0B' : item.ok ? '#F5F5F0' : '#55555E' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Summary Footer */}
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <Calculator size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Summary</h3>
          </div>

          <div className="space-y-3">
            {hasLead && (
              <div className="flex justify-between items-center">
                <span className="text-[12px]" style={{ color: '#8A8A93' }}>Lead Investor</span>
                <span className="text-[12px] font-semibold flex items-center gap-1" style={{ color: '#B8A14E' }}>
                  <Crown size={11} /> {clients.find(c => c.id === leadClient.clientId)?.name}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[12px]" style={{ color: '#8A8A93' }}>Total Allocated</span>
              <span className="text-[13px] font-semibold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
                {fmtCur(totalAllocated)} ({allocationPercent.toFixed(1)}%)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[12px]" style={{ color: '#8A8A93' }}>Admin Reserve</span>
              <span className="text-[13px] font-semibold" style={{ color: remaining > 0 ? '#F59E0B' : '#10B981', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
                {remaining > 0 && <span className="mr-1">🟡</span>}{fmtCur(Math.abs(remaining))}
              </span>
            </div>

            {managementFeeAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[12px]" style={{ color: '#8A8A93' }}>Mgmt Fee ({form.managementFee}%)</span>
                <span className="text-[13px] font-semibold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace', fontFeatureSettings: '"tnum" 1' }}>
                  {fmtCur(managementFeeAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[12px]" style={{ color: '#8A8A93' }}>Clients</span>
              <span className="text-[13px] font-semibold" style={{ color: '#F5F5F0', fontFamily: 'JetBrains Mono, monospace' }}>
                {allocations.length}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}



// =============================================================================
// MAIN COMPONENT: DealEditor
// =============================================================================

export default function DealEditor() {
  const navigate = useNavigate();

  // ---- Form State ----
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for next
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sendEmail, setSendEmail] = useState(true);

  const [form, setForm] = useState<CompanyForm>({
    companyName: '',
    ticker: '',
    exchange: '',
    sector: '',
    description: '',
    totalVolume: '',
    sharePrice: '',
    marketCap: '',
    website: '',
    founders: '',
    logoPreview: null,
    managementFee: '',
    targetPrice: '',
    timeHorizon: '',
  });

  const [allocations, setAllocations] = useState<ClientAllocation[]>([]);

  // ---- Computed ----
  const totalVolumeNum = parseNum(form.totalVolume);
  const sharePriceNum = parseNum(form.sharePrice);

  // ---- Validation ----
  const validateStep1 = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    else if (form.companyName.trim().length < 2) e.companyName = 'Must be at least 2 characters';
    if (!form.ticker.trim()) e.ticker = 'Ticker symbol is required';
    if (!form.exchange) e.exchange = 'Exchange is required';
    if (!form.totalVolume) e.totalVolume = 'Total volume is required';
    else if (parseNum(form.totalVolume) <= 0) e.totalVolume = 'Must be greater than 0';
    if (!form.sharePrice) e.sharePrice = 'Share price is required';
    else if (parseNum(form.sharePrice) <= 0) e.sharePrice = 'Must be greater than 0';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const validateStep2 = useCallback((): boolean => {
    const totalAllocated = allocations.reduce((s, a) => s + parseNum(a.amount), 0);
    return totalAllocated <= totalVolumeNum + 0.01;
  }, [allocations, totalVolumeNum]);

  // ---- Navigation ----
  const handleNext = useCallback(() => {
    if (step === 0) {
      if (!validateStep1()) return;
    } else if (step === 1) {
      if (!validateStep2()) {
        setErrors({ _allocation: 'Total allocation exceeds deal volume' });
        return;
      }
    }
    setDirection(1);
    setErrors({});
    setStep(s => Math.min(s + 1, 2));
  }, [step, validateStep1, validateStep2]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
  }, []);

  // ---- Creation ----
  const handleCreate = useCallback((status: 'active' | 'draft') => {
    if (!validateStep1()) {
      setStep(0);
      return;
    }

    const totalAllocated = allocations.reduce((s, a) => s + parseNum(a.amount), 0);
    if (totalAllocated > totalVolumeNum + 0.01) {
      setStep(1);
      setErrors({ _allocation: 'Total allocation exceeds deal volume' });
      return;
    }

    // Generate a new deal ID
    const newId = `d${Date.now()}`;

    // Show toast
    setToast({ message: `Deal created as ${status === 'active' ? 'Active' : 'Draft'}`, type: 'success' });

    // Navigate after short delay
    setTimeout(() => {
      navigate(`/admin/deals/${newId}`);
    }, 1200);
  }, [validateStep1, allocations, totalVolumeNum, navigate, form]);

  // ---- Auto-dismiss toast ----
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ---- Step Animation Variants ----
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  // ---- Can proceed ----
  const canProceedStep2 = allocations.reduce((s, a) => s + parseNum(a.amount), 0) <= totalVolumeNum + 0.01;

  return (
    <div className="min-h-screen w-full" style={{ background: '#0A0A0F', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="w-full px-6 lg:px-10 pt-8 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184,161,78,0.12)', border: '1px solid rgba(184,161,78,0.2)' }}>
              <Building2 size={20} style={{ color: '#B8A14E' }} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>New Deal</h1>
              <p className="text-[12px]" style={{ color: '#8A8A93' }}>Create a new investment deal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="w-full px-6 lg:px-10 py-4">
        <div className="max-w-6xl mx-auto">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 lg:px-10 pb-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
            >
              {step === 0 && (
                <Step1CompanyInfo
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                />
              )}
              {step === 1 && (
                <Step2ClientAllocations
                  allocations={allocations}
                  setAllocations={setAllocations}
                  totalVolume={totalVolumeNum}
                  sharePrice={sharePriceNum}
                />
              )}
              {step === 2 && (
                <Step3Review
                  form={form}
                  allocations={allocations}
                  totalVolume={totalVolumeNum}
                  sharePrice={sharePriceNum}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Allocation error for step 2 */}
          {errors._allocation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertTriangle size={15} style={{ color: '#EF4444' }} />
              <span className="text-[12px] font-medium" style={{ color: '#EF4444' }}>{errors._allocation}</span>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <div>
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                  style={{ color: '#8A8A93', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 2 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 1 && !canProceedStep2}
                  className="px-6 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <>
                  {/* Send email checkbox */}
                  <label className="flex items-center gap-2 mr-2 cursor-pointer">
                    <button
                      onClick={() => setSendEmail(!sendEmail)}
                      className="w-4 h-4 rounded flex items-center justify-center transition-colors"
                      style={{
                        background: sendEmail ? '#B8A14E' : 'transparent',
                        border: sendEmail ? 'none' : '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {sendEmail && <CheckCircle2 size={12} color="#0A0A0F" />}
                    </button>
                    <Mail size={13} style={{ color: '#8A8A93' }} />
                    <span className="text-[12px]" style={{ color: '#8A8A93' }}>Send email notifications</span>
                  </label>

                  <button
                    onClick={() => handleCreate('draft')}
                    className="px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200"
                    style={{ color: '#F5F5F0', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  >
                    Create as Draft
                  </button>
                  <button
                    onClick={() => handleCreate('active')}
                    className="px-6 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                  >
                    <CheckCircle2 size={15} /> Create Deal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed bottom-8 left-1/2 z-50 px-5 py-3 rounded-xl flex items-center gap-2.5"
            style={{
              background: toast.type === 'success' ? '#10B981' : '#EF4444',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span className="text-[13px] font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
