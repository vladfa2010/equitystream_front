import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/services/authApi';
import { ShieldCheck, Copy, Check, ArrowLeft } from 'lucide-react';

type Step = 'loading' | 'setup' | 'codes' | 'done';

/**
 * ТЗ-6 Задача 3.2/3.3: экран привязки 2FA.
 * - QR-код + ручной секрет + подтверждение кодом.
 * - Backup-коды показываются ОДИН раз, с явным подтверждением «сохранил».
 * - Для admin без 2FA этот экран принудительный (роут-гарды в App.tsx
 *   не пускают дальше до включения); для клиентов — опционально (Задача 2.2).
 */
export default function TwoFactorSetup() {
  const navigate = useNavigate();
  const { user, isAdmin, logout, markTotpEnabled } = useAuth();
  const [step, setStep] = useState<Step>('loading');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedConfirmed, setSavedConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.twoFactorSetup()
      .then((data) => {
        setSecret(data.secret);
        setQrCode(data.qrCodeDataUrl);
        setStep('setup');
      })
      .catch((err) => setError(err.message || 'Failed to start 2FA setup'));
  }, []);

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authApi.twoFactorEnable(code.trim());
      setBackupCodes(result.backupCodes);
      markTotpEnabled();
      setStep('codes');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setStep('done');
    // Принудительный режим (admin) отправляем в админку; опциональный — назад
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен — пользователь скопирует вручную
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(10, 10, 15, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: 'clamp(24px, 6vw, 48px)',
    maxWidth: 'min(480px, calc(100vw - 32px))',
    width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    color: '#F5F5F0',
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4" style={{ background: '#0A0A0F' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <ShieldCheck size={28} style={{ color: '#B8A14E' }} />
          <h1
            className="text-[24px] font-bold"
            style={{ color: '#F5F5F0', fontFamily: "'Clash Display', system-ui, sans-serif" }}
          >
            {isAdmin ? 'Two-Factor Authentication Required' : 'Enable Two-Factor Authentication'}
          </h1>
        </div>
        <p className="text-[14px] mb-8 text-center" style={{ color: '#8A8A93' }}>
          {isAdmin
            ? 'Admin access requires 2FA. Scan the QR code with Google Authenticator, Authy or a similar app.'
            : 'Add an extra layer of security to your account.'}
        </p>

        <div style={cardStyle}>
          {error && (
            <div
              className="text-[13px] mb-4"
              style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                borderRadius: '12px',
                padding: '12px 16px',
              }}
            >
              {error}
            </div>
          )}

          {step === 'loading' && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/20 border-t-[#B8A14E] rounded-full animate-spin" />
            </div>
          )}

          {step === 'setup' && (
            <form onSubmit={handleEnable} className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="p-3 rounded-2xl"
                  style={{ background: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <img src={qrCode} alt="2FA QR code" className="w-[180px] h-[180px]" />
                </div>
                <div className="w-full">
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Manual secret (if you cannot scan the QR)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(secret).catch(() => {});
                    }}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left"
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' }}
                    title="Click to copy"
                  >
                    <span>{secret}</span>
                    <Copy size={14} style={{ color: '#55555E', flexShrink: 0 }} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                  Confirmation code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="6-digit code from the app"
                  className="w-full px-4 py-3 text-[14px] placeholder:text-[#55555E] tracking-[0.3em] text-center"
                  style={inputStyle}
                  required
                  maxLength={6}
                  autoFocus
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading || code.length !== 6}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 disabled:opacity-60 h-12 btn-primary"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Enable 2FA
                  </>
                )}
              </motion.button>
            </form>
          )}

          {step === 'codes' && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-[16px] font-semibold mb-1" style={{ color: '#F5F5F0' }}>
                  Save your backup codes
                </h2>
                <p className="text-[13px]" style={{ color: '#8A8A93' }}>
                  Each code works once if you lose your device. They are shown only this one time.
                </p>
              </div>

              <div
                className="grid grid-cols-2 gap-2 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {backupCodes.map((c) => (
                  <span key={c} className="text-[13px] font-mono" style={{ color: '#C9B25F' }}>
                    {c}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={copyCodes}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium"
                style={{ border: '1px solid rgba(184,161,78,0.3)', color: '#C9B25F' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy all codes'}
              </button>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={savedConfirmed}
                  onChange={(e) => setSavedConfirmed(e.target.checked)}
                  className="mt-0.5 accent-[#B8A14E]"
                />
                <span className="text-[13px]" style={{ color: '#8A8A93' }}>
                  I have saved the backup codes in a safe place
                </span>
              </label>

              <motion.button
                type="button"
                disabled={!savedConfirmed}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 disabled:opacity-50 h-12 btn-primary"
              >
                <ShieldCheck size={18} />
                Continue
              </motion.button>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Check size={40} style={{ color: '#10B981' }} />
              <p className="text-[15px]" style={{ color: '#F5F5F0' }}>
                Two-factor authentication is enabled
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-6">
          {step !== 'codes' && (
            <button
              type="button"
              onClick={() => (isAdmin && user && !user.totpEnabled ? logout() : navigate(-1))}
              className="flex items-center gap-1.5 text-[13px]"
              style={{ color: '#55555E' }}
            >
              <ArrowLeft size={14} />
              {isAdmin && user && !user.totpEnabled ? 'Sign out' : 'Back'}
            </button>
          )}
          <p className="text-[12px]" style={{ color: '#55555E' }}>
            EquityStream &copy; 2025
          </p>
        </div>
      </motion.div>
    </div>
  );
}
