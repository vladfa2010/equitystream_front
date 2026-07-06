import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Send, FileText, Image, Shield,
  ChevronRight, ChevronLeft, CheckCircle2, XCircle,
  AlertTriangle, Eye, EyeOff, X, Loader2,
  UserPlus, CalendarDays, Lock, AtSign, StickyNote, ArrowLeft, Crown,
} from 'lucide-react';
import StepIndicator from '../../components/deals/StepIndicator';
import { clientsApi } from '../../api';
import type { CreateClientRequest } from '../../api';

// =============================================================================
// CONSTANTS
// =============================================================================

const STEPS = ['Personal Info', 'Contact Info', 'Documents', 'Review & Create'];

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
// TYPES
// =============================================================================

interface WizardState {
  // Step 1
  fullName: string;
  dateOfBirth: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'admin' | 'superadmin';
  showPassword: boolean;
  // Step 2
  email: string;
  phone: string;
  telegram: string;
  notes: string;
  // Step 3
  contractFile: File | null;
  contractBase64: string;
  avatarFile: File | null;
  avatarBase64: string;
  idDocumentFile: File | null;
  idDocumentBase64: string;
}

interface FormErrors {
  [key: string]: string;
}

interface FileUploadState {
  isUploading: boolean;
  progress: number;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getInitials(fullName: string): string {
  if (!fullName.trim()) return '?';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPasswordStrength(password: string): { label: string; color: string; width: number } {
  if (!password) return { label: '', color: '#55555E', width: 0 };
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const mixedCase = hasLower && hasUpper;

  if (password.length < 8 || !(mixedCase || hasNumber)) {
    return { label: 'Weak', color: '#EF4444', width: 33 };
  }
  if (password.length >= 10 && mixedCase && hasNumber && hasSymbol) {
    return { label: 'Strong', color: '#10B981', width: 100 };
  }
  return { label: 'Medium', color: '#F59E0B', width: 66 };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
// SUB-COMPONENT: Step 1 - Personal Information
// =============================================================================

interface Step1Props {
  form: WizardState;
  setForm: React.Dispatch<React.SetStateAction<WizardState>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

function Step1PersonalInfo({ form, setForm, errors, setErrors }: Step1Props) {
  const updateField = useCallback((field: keyof WizardState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, [setForm, errors, setErrors]);

  const strength = getPasswordStrength(form.password);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Fields */}
      <div className="lg:col-span-2 space-y-5">
        {/* Full Name + DOB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.fullName}>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
              <input
                type="text"
                value={form.fullName}
                onChange={e => updateField('fullName', e.target.value)}
                placeholder="e.g. Alexei Volkov"
                maxLength={100}
                className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
                style={{
                  ...INPUT_STYLE,
                  borderColor: errors.fullName ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
                  boxShadow: errors.fullName ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
                }}
                onFocus={e => { if (!errors.fullName) { e.target.style.borderColor = '#B8A14E'; e.target.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)'; } }}
                onBlur={e => { e.target.style.borderColor = errors.fullName ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </FormField>

          <FormField label="Date of Birth">
            <div className="relative">
              <CalendarDays size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={e => updateField('dateOfBirth', e.target.value)}
                className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
                style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>
          </FormField>
        </div>

        {/* Nickname + Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nickname / Username" required error={errors.nickname} hint="3-30 chars, alphanumeric + underscore">
            <div className="relative">
              <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
              <input
                type="text"
                value={form.nickname}
                onChange={e => updateField('nickname', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="e.g. alexei_v"
                maxLength={30}
                className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
                style={{
                  ...INPUT_STYLE,
                  fontFamily: 'JetBrains Mono, monospace',
                  borderColor: errors.nickname ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
                  boxShadow: errors.nickname ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
                }}
                onFocus={e => { if (!errors.nickname) { e.target.style.borderColor = '#B8A14E'; e.target.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)'; } }}
                onBlur={e => { e.target.style.borderColor = errors.nickname ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </FormField>

          <FormField label="Role" required error={errors.role}>
            <select
              value={form.role}
              onChange={e => updateField('role', e.target.value as 'user' | 'admin' | 'superadmin')}
              className="w-full text-[14px] px-4 py-3 outline-none transition-all duration-200 appearance-none cursor-pointer"
              style={{
                ...INPUT_STYLE,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A93' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
                paddingRight: 40,
                borderColor: errors.role ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
              }}
              onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
              onBlur={e => { e.target.style.borderColor = errors.role ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; }}
            >
              <option value="user" style={{ background: '#14141C' }}>User</option>
              <option value="admin" style={{ background: '#14141C' }}>Admin</option>
              <option value="superadmin" style={{ background: '#14141C' }}>Superadmin</option>
            </select>
          </FormField>
        </div>

        {/* Password */}
        <FormField label="Password" required error={errors.password}>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
            <input
              type={form.showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => updateField('password', e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              className="w-full text-[14px] pl-9 pr-10 py-3 outline-none transition-all duration-200"
              style={{
                ...INPUT_STYLE,
                borderColor: errors.password ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
                boxShadow: errors.password ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
              }}
              onFocus={e => { if (!errors.password) { e.target.style.borderColor = '#B8A14E'; e.target.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)'; } }}
              onBlur={e => { e.target.style.borderColor = errors.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
              style={{ color: '#8A8A93' }}
            >
              {form.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Strength Indicator */}
          {form.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium" style={{ color: strength.color }}>{strength.label}</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.width}%` }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="h-full rounded-full"
                  style={{ background: strength.color }}
                />
              </div>
            </div>
          )}
        </FormField>

        {/* Confirm Password */}
        <FormField label="Confirm Password" required error={errors.confirmPassword}>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
            <input
              type={form.showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => updateField('confirmPassword', e.target.value)}
              placeholder="Repeat password"
              className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
              style={{
                ...INPUT_STYLE,
                borderColor: errors.confirmPassword ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
                boxShadow: errors.confirmPassword ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
              }}
              onFocus={e => { if (!errors.confirmPassword) { e.target.style.borderColor = '#B8A14E'; e.target.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)'; } }}
              onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </FormField>
      </div>

      {/* Live Preview Card */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-5">
              <User size={16} style={{ color: '#B8A14E' }} />
              <h3 className="text-[14px] font-semibold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                Live Preview
              </h3>
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-[22px] font-bold mb-4"
                style={{
                  background: form.avatarBase64 ? 'transparent' : 'linear-gradient(135deg, #B8A14E, #C9B25F)',
                  color: '#0A0A0F',
                  border: form.avatarBase64 ? '2px solid rgba(184,161,78,0.4)' : 'none',
                }}
              >
                {form.avatarBase64 ? (
                  <img src={form.avatarBase64} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(form.fullName)
                )}
              </div>

              {/* Name */}
              <h4 className="text-[16px] font-bold mb-1" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                {form.fullName || 'Full Name'}
              </h4>

              {/* Nickname */}
              {form.nickname && (
                <p className="text-[13px] font-medium mb-2" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}>
                  @{form.nickname}
                </p>
              )}

              {/* Role Badge */}
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full mb-4 uppercase"
                style={{
                  background: form.role === 'superadmin' ? 'rgba(239,68,68,0.15)' : form.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(79,110,247,0.15)',
                  color: form.role === 'superadmin' ? '#EF4444' : form.role === 'admin' ? '#8B5CF6' : '#4F6EF7',
                  border: `1px solid ${form.role === 'superadmin' ? 'rgba(239,68,68,0.3)' : form.role === 'admin' ? 'rgba(139,92,246,0.3)' : 'rgba(79,110,247,0.3)'}`,
                }}
              >
                {form.role === 'superadmin' ? <Crown size={11} /> : form.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                {form.role === 'superadmin' ? 'SUPERADMIN' : form.role === 'admin' ? 'ADMIN' : 'USER'}
              </span>

              {/* DOB */}
              {form.dateOfBirth && (
                <div className="flex items-center gap-2 text-[12px]" style={{ color: '#8A8A93' }}>
                  <CalendarDays size={12} />
                  {new Date(form.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: Step 2 - Contact Information
// =============================================================================

interface Step2Props {
  form: WizardState;
  setForm: React.Dispatch<React.SetStateAction<WizardState>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

function Step2ContactInfo({ form, setForm, errors, setErrors }: Step2Props) {
  const updateField = useCallback((field: keyof WizardState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, [setForm, errors, setErrors]);

  return (
    <div className="max-w-2xl space-y-5">
      {/* Email */}
      <FormField label="Email" required error={errors.email}>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
          <input
            type="email"
            value={form.email}
            onChange={e => updateField('email', e.target.value)}
            placeholder="e.g. alexei@example.com"
            className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
            style={{
              ...INPUT_STYLE,
              borderColor: errors.email ? 'rgba(239,68,68,0.5)' : INPUT_STYLE.border,
              boxShadow: errors.email ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
            }}
            onFocus={e => { if (!errors.email) { e.target.style.borderColor = '#B8A14E'; e.target.style.boxShadow = '0 0 0 3px rgba(184,161,78,0.15)'; } }}
            onBlur={e => { e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </FormField>

      {/* Phone */}
      <FormField label="Phone" hint="Format: +7-XXX-XXX-XXXX">
        <div className="relative">
          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
          <input
            type="tel"
            value={form.phone}
            onChange={e => updateField('phone', e.target.value)}
            placeholder="+7-999-123-4567"
            className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
            style={{ ...INPUT_STYLE }}
            onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>
      </FormField>

      {/* Telegram */}
      <FormField label="Telegram" hint="@username will be auto-prefixed if missing">
        <div className="relative">
          <Send size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8A8A93' }} />
          <input
            type="text"
            value={form.telegram}
            onChange={e => updateField('telegram', e.target.value)}
            placeholder="@username"
            className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200"
            style={{ ...INPUT_STYLE, fontFamily: 'JetBrains Mono, monospace' }}
            onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>
      </FormField>

      {/* Notes */}
      <FormField label="Notes" hint={`${form.notes.length}/500 characters`}>
        <div className="relative">
          <StickyNote size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8A8A93' }} />
          <textarea
            value={form.notes}
            onChange={e => updateField('notes', e.target.value.slice(0, 500))}
            placeholder="Additional notes about the client..."
            rows={4}
            maxLength={500}
            className="w-full text-[14px] pl-9 pr-4 py-3 outline-none transition-all duration-200 resize-none"
            style={{ ...INPUT_STYLE }}
            onFocus={e => { e.target.style.borderColor = '#B8A14E'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>
      </FormField>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: DragDropZone
// =============================================================================

interface DragDropZoneProps {
  accept: string;
  maxSizeMB: number;
  file: File | null;
  previewUrl: string;
  icon: React.ReactNode;
  onFileSelect: (file: File, base64: string) => void;
  onRemove: () => void;
  uploadState: FileUploadState;
}

function DragDropZone({ accept, maxSizeMB, file, previewUrl, icon, onFileSelect, onRemove, uploadState }: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileSelect(f, result);
    };
    reader.readAsDataURL(f);
  }, [maxSizeMB, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  }, [handleFile]);

  if (file && previewUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="flex-shrink-0">
            {file.type.startsWith('image/') ? (
              <img src={previewUrl} alt="" className="w-14 h-14 rounded-lg object-cover" style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
            ) : (
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,161,78,0.1)' }}>
                <FileText size={24} style={{ color: '#B8A14E' }} />
              </div>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: '#F5F5F0' }}>{file.name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}>
              {formatFileSize(file.size)}
            </p>
            {uploadState.isUploading && (
              <div className="mt-2 w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadState.progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: '#B8A14E' }}
                />
              </div>
            )}
            {!uploadState.isUploading && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} style={{ color: '#10B981' }} />
                <span className="text-[11px]" style={{ color: '#10B981' }}>Ready</span>
              </div>
            )}
          </div>
          {/* Remove */}
          <button
            onClick={onRemove}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: '#8A8A93' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#8A8A93'}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="p-6 rounded-xl text-center cursor-pointer transition-all duration-200"
      style={{
        background: isDragOver ? 'rgba(184,161,78,0.06)' : 'rgba(255,255,255,0.02)',
        border: isDragOver ? '2px dashed rgba(184,161,78,0.4)' : '2px dashed rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: isDragOver ? 'rgba(184,161,78,0.12)' : 'rgba(255,255,255,0.04)' }}
        >
          {icon}
        </div>
        <p className="text-[13px] font-medium" style={{ color: isDragOver ? '#B8A14E' : '#8A8A93' }}>
          {isDragOver ? 'Drop file here' : `Drag & drop or click to upload`}
        </p>
        <p className="text-[11px]" style={{ color: '#55555E' }}>
          {accept.split(',').join(', ')} &middot; Max {maxSizeMB}MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: Step 3 - Documents
// =============================================================================

interface Step3Props {
  form: WizardState;
  setForm: React.Dispatch<React.SetStateAction<WizardState>>;
}

function Step3Documents({ form, setForm }: Step3Props) {
  const [uploadStates, setUploadStates] = useState<Record<string, FileUploadState>>({
    contract: { isUploading: false, progress: 0 },
    avatar: { isUploading: false, progress: 0 },
    idDocument: { isUploading: false, progress: 0 },
  });

  const simulateUpload = useCallback((key: string) => {
    setUploadStates(prev => ({ ...prev, [key]: { isUploading: true, progress: 0 } }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setUploadStates(prev => ({ ...prev, [key]: { isUploading: false, progress: 100 } }));
        }, 200);
      }
      setUploadStates(prev => ({ ...prev, [key]: { isUploading: true, progress: Math.min(progress, 100) } }));
    }, 200);
  }, []);

  const handleContract = useCallback((file: File, base64: string) => {
    setForm(prev => ({ ...prev, contractFile: file, contractBase64: base64 }));
    simulateUpload('contract');
  }, [setForm, simulateUpload]);

  const handleAvatar = useCallback((file: File, base64: string) => {
    setForm(prev => ({ ...prev, avatarFile: file, avatarBase64: base64 }));
    simulateUpload('avatar');
  }, [setForm, simulateUpload]);

  const handleIdDocument = useCallback((file: File, base64: string) => {
    setForm(prev => ({ ...prev, idDocumentFile: file, idDocumentBase64: base64 }));
    simulateUpload('idDocument');
  }, [setForm, simulateUpload]);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Contract PDF */}
      <div>
        <label className="block text-[13px] font-medium mb-3" style={{ color: '#8A8A93' }}>
          <div className="flex items-center gap-2">
            <FileText size={14} />
            Contract PDF
          </div>
        </label>
        <DragDropZone
          accept=".pdf"
          maxSizeMB={10}
          file={form.contractFile}
          previewUrl={form.contractBase64}
          icon={<FileText size={20} style={{ color: '#8A8A93' }} />}
          onFileSelect={handleContract}
          onRemove={() => setForm(prev => ({ ...prev, contractFile: null, contractBase64: '' }))}
          uploadState={uploadStates.contract}
        />
      </div>

      {/* Avatar Photo */}
      <div>
        <label className="block text-[13px] font-medium mb-3" style={{ color: '#8A8A93' }}>
          <div className="flex items-center gap-2">
            <Image size={14} />
            Avatar Photo
          </div>
        </label>
        <DragDropZone
          accept="image/*"
          maxSizeMB={5}
          file={form.avatarFile}
          previewUrl={form.avatarBase64}
          icon={<Image size={20} style={{ color: '#8A8A93' }} />}
          onFileSelect={handleAvatar}
          onRemove={() => setForm(prev => ({ ...prev, avatarFile: null, avatarBase64: '' }))}
          uploadState={uploadStates.avatar}
        />
      </div>

      {/* ID Document */}
      <div>
        <label className="block text-[13px] font-medium mb-3" style={{ color: '#8A8A93' }}>
          <div className="flex items-center gap-2">
            <Shield size={14} />
            ID Document
          </div>
        </label>
        <DragDropZone
          accept=".pdf,image/*"
          maxSizeMB={10}
          file={form.idDocumentFile}
          previewUrl={form.idDocumentBase64}
          icon={<Shield size={20} style={{ color: '#8A8A93' }} />}
          onFileSelect={handleIdDocument}
          onRemove={() => setForm(prev => ({ ...prev, idDocumentFile: null, idDocumentBase64: '' }))}
          uploadState={uploadStates.idDocument}
        />
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: Step 4 - Review & Create
// =============================================================================

interface Step4Props {
  form: WizardState;
}

function Step4Review({ form }: Step4Props) {
  const strength = getPasswordStrength(form.password);

  const checklist = [
    { label: 'Full name provided', ok: form.fullName.trim().length >= 2 },
    { label: 'Valid nickname (3-30 chars)', ok: form.nickname.length >= 3 && form.nickname.length <= 30 },
    { label: 'Password is strong', ok: strength.label === 'Strong' || strength.label === 'Medium' },
    { label: 'Passwords match', ok: !!form.password && form.password === form.confirmPassword },
    { label: 'Role selected', ok: !!form.role },
    { label: 'Valid email address', ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) },
  ];

  const allOk = checklist.every(item => item.ok);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Details */}
      <div className="lg:col-span-2 space-y-5">
        {/* Personal Card */}
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <User size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Personal Information</h3>
          </div>

          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-[18px] font-bold flex-shrink-0"
              style={{
                background: form.avatarBase64 ? 'transparent' : 'linear-gradient(135deg, #B8A14E, #C9B25F)',
                color: '#0A0A0F',
                border: form.avatarBase64 ? '2px solid rgba(184,161,78,0.4)' : 'none',
              }}
            >
              {form.avatarBase64 ? (
                <img src={form.avatarBase64} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(form.fullName)
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-[16px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>
                {form.fullName || '—'}
              </h4>
              <p className="text-[13px] font-medium mt-0.5" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}>
                @{form.nickname || '—'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase"
                  style={{
                    background: form.role === 'superadmin' ? 'rgba(239,68,68,0.15)' : form.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(79,110,247,0.15)',
                    color: form.role === 'superadmin' ? '#EF4444' : form.role === 'admin' ? '#8B5CF6' : '#4F6EF7',
                  }}
                >
                  {form.role === 'superadmin' ? 'SUPERADMIN' : form.role === 'admin' ? 'ADMIN' : 'USER'}
                </span>
                {form.dateOfBirth && (
                  <span className="text-[11px] px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A93' }}>
                    {new Date(form.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Contact Card */}
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <Mail size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Email', value: form.email || '—', icon: Mail },
              { label: 'Phone', value: form.phone || '—', icon: Phone },
              { label: 'Telegram', value: form.telegram ? (form.telegram.startsWith('@') ? form.telegram : `@${form.telegram}`) : '—', icon: Send },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <item.icon size={14} style={{ color: '#55555E' }} />
                <div>
                  <p className="text-[11px]" style={{ color: '#55555E' }}>{item.label}</p>
                  <p className="text-[13px] font-medium" style={{ color: '#F5F5F0' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {form.notes && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[11px] mb-1" style={{ color: '#55555E' }}>Notes</p>
              <p className="text-[13px] leading-relaxed" style={{ color: '#8A8A93' }}>{form.notes}</p>
            </div>
          )}
        </GlassCard>

        {/* Documents Card */}
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <FileText size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Documents</h3>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Contract PDF', file: form.contractFile, icon: FileText },
              { label: 'Avatar Photo', file: form.avatarFile, icon: Image },
              { label: 'ID Document', file: form.idDocumentFile, icon: Shield },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <item.icon size={16} style={{ color: item.file ? '#10B981' : '#55555E' }} />
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{ color: '#F5F5F0' }}>{item.label}</p>
                  {item.file && (
                    <p className="text-[11px]" style={{ color: '#8A8A93', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.file.name} &middot; {formatFileSize(item.file.size)}
                    </p>
                  )}
                </div>
                {item.file ? (
                  <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#55555E' }}>Optional</span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Validation */}
      <div className="lg:col-span-1 space-y-5">
        <GlassCard>
          <div className="flex items-center gap-2.5 mb-5">
            <CheckCircle2 size={16} style={{ color: '#B8A14E' }} />
            <h3 className="text-[14px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>Validation</h3>
          </div>
          <div className="space-y-3">
            {checklist.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                {item.ok ? (
                  <CheckCircle2 size={16} style={{ color: '#10B981' }} className="flex-shrink-0" />
                ) : (
                  <XCircle size={16} style={{ color: '#EF4444' }} className="flex-shrink-0" />
                )}
                <span className="text-[12px]" style={{ color: item.ok ? '#F5F5F0' : '#EF4444' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {!allOk && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertTriangle size={14} style={{ color: '#EF4444' }} />
              <span className="text-[11px]" style={{ color: '#EF4444' }}>Please fix all required fields</span>
            </div>
          )}
          {allOk && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <CheckCircle2 size={14} style={{ color: '#10B981' }} />
              <span className="text-[11px]" style={{ color: '#10B981' }}>All validations passed</span>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT: CreateClient
// =============================================================================

export default function CreateClient() {
  const navigate = useNavigate();

  // ---- Form State ----
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [form, setForm] = useState<WizardState>({
    fullName: '',
    dateOfBirth: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    showPassword: false,
    email: '',
    phone: '',
    telegram: '',
    notes: '',
    contractFile: null,
    contractBase64: '',
    avatarFile: null,
    avatarBase64: '',
    idDocumentFile: null,
    idDocumentBase64: '',
  });

  // ---- Validation ----
  const validateStep1 = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) e.fullName = 'Must be at least 2 characters';
    else if (form.fullName.trim().length > 100) e.fullName = 'Must be at most 100 characters';

    if (!form.nickname.trim()) e.nickname = 'Nickname is required';
    else if (form.nickname.length < 3) e.nickname = 'Must be at least 3 characters';
    else if (form.nickname.length > 30) e.nickname = 'Must be at most 30 characters';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Must be at least 8 characters';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (!form.role) e.role = 'Role is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const validateStep2 = useCallback((): boolean => {
    const e: FormErrors = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  // ---- Navigation ----
  const handleNext = useCallback(() => {
    if (step === 0) {
      if (!validateStep1()) return;
    } else if (step === 1) {
      if (!validateStep2()) return;
    }
    setDirection(1);
    setErrors({});
    setStep(s => Math.min(s + 1, 3));
  }, [step, validateStep1, validateStep2]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
  }, []);

  // ---- Creation ----
  const handleCreate = useCallback(async () => {
    // Final validation
    if (!validateStep1() || !validateStep2()) {
      setStep(0);
      return;
    }

    setIsCreating(true);

    try {
      const payload: CreateClientRequest = {
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        nickname: form.nickname.trim(),
        password: form.password,
        role: form.role,
        email: form.email.trim(),
        phone: form.phone || undefined,
        telegram: form.telegram || undefined,
        notes: form.notes || undefined,
        contractFile: form.contractBase64 || undefined,
        avatarFile: form.avatarBase64 || undefined,
        idDocumentFile: form.idDocumentBase64 || undefined,
      };

      await clientsApi.create(payload);

      setToast({ message: 'Client created successfully', type: 'success' });
      setTimeout(() => navigate('/admin/clients'), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setToast({ message: `Failed to create client: ${msg}`, type: 'error' });
    } finally {
      setIsCreating(false);
    }
  }, [form, validateStep1, validateStep2, navigate]);

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

  return (
    <div className="min-h-screen w-full" style={{ background: '#0A0A0F', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="w-full px-6 lg:px-10 pt-8 pb-4">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate('/admin/clients')}
            className="flex items-center gap-2 mb-4 text-[12px] font-medium transition-all duration-200 rounded-lg px-2 py-1 -ml-2"
            style={{ color: '#8A8A93', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
          >
            <ArrowLeft size={14} /> Back to Clients
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184,161,78,0.12)', border: '1px solid rgba(184,161,78,0.2)' }}>
              <UserPlus size={20} style={{ color: '#B8A14E' }} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold" style={{ color: '#F5F5F0', fontFamily: 'Clash Display, sans-serif' }}>New Client</h1>
              <p className="text-[12px]" style={{ color: '#8A8A93' }}>Create a new client account</p>
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
                <Step1PersonalInfo
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                />
              )}
              {step === 1 && (
                <Step2ContactInfo
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                />
              )}
              {step === 2 && (
                <Step3Documents
                  form={form}
                  setForm={setForm}
                />
              )}
              {step === 3 && (
                <Step4Review
                  form={form}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Cancel — always visible */}
              <button
                onClick={() => navigate('/admin/clients')}
                className="px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                style={{ color: '#8A8A93', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                Cancel
              </button>
              {step > 0 && (
                <button
                  onClick={handleBack}
                  disabled={isCreating}
                  className="px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: '#8A8A93', background: 'transparent' }}
                  onMouseEnter={e => { if (!isCreating) { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#8A8A93'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="px-5 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: '#F5F5F0', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)' }}
                    onMouseEnter={e => { if (!isCreating) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  >
                    {isCreating ? <Loader2 size={15} className="animate-spin" /> : null}
                    Create &amp; Send Invite
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="px-6 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #B8A14E, #C9B25F)', color: '#0A0A0F' }}
                  >
                    {isCreating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    {isCreating ? 'Creating...' : 'Create Client'}
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
