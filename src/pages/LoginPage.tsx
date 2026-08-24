import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/services/authApi';
import SpotlightCard from '@/components/react-bits/SpotlightCard';
import ShinyText from '@/components/react-bits/ShinyText';
import {
  LogIn, Eye, EyeOff, UserPlus, ArrowLeft, KeyRound,
  Mail, User, Lock, CheckCircle, Shield, ArrowRight
} from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot' | 'code' | 'reset';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated and verified
  useEffect(() => {
    if (isAuthenticated && user?.isVerified) {
      navigate('/dashboard', { replace: true });
    }
    if (isAuthenticated && !user?.isVerified) {
      navigate('/pending', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext will update user state; useEffect above handles redirect
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, username, password);
      setSuccess('Registration successful! Your account is pending approval.');
      // AuthContext will update user state; useEffect above handles redirect to /pending
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess('Check your email for a 6-digit code.');
      setMode('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await authApi.verifyCode(email, code);
      setResetToken(data.resetToken);
      setSuccess('Code verified. Set a new password.');
      setMode('reset');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      setSuccess('Password reset successful! Please sign in.');
      setMode('login');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    clearMessages();
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setNewPassword('');
  };

  const titles: Record<Mode, { title: string; subtitle: string }> = {
    login: { title: 'Welcome Back', subtitle: 'Sign in to your account' },
    register: { title: 'Create Account', subtitle: 'Register for access' },
    forgot: { title: 'Reset Password', subtitle: 'Enter your email to receive a code' },
    code: { title: 'Verify Code', subtitle: 'Enter the 6-digit code from your email' },
    reset: { title: 'New Password', subtitle: 'Set a new secure password' },
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-4"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(224, 144, 64, 0.08), transparent), linear-gradient(180deg, #0F0A06, #1A120B)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,117,58,0.1)' }}>
            <Shield size={20} style={{ color: '#C9753A' }} />
          </div>
          <ShinyText text="EQUITYSTREAM" speed={4} />
        </div>

        {/* Card */}
        <SpotlightCard>
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,117,58,0.12)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Tabs */}
            {mode === 'login' && (
              <div className="flex gap-2 mb-8">
                <button
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={{
                    background: 'rgba(201,117,58,0.1)',
                    color: '#C9753A',
                    border: '1px solid rgba(201,117,58,0.15)',
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all hover:bg-white/5"
                  style={{ color: '#C9A882' }}
                >
                  Register
                </button>
              </div>
            )}
            {mode === 'register' && (
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => switchMode('login')}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all hover:bg-white/5"
                  style={{ color: '#C9A882' }}
                >
                  Sign In
                </button>
                <button
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={{
                    background: 'rgba(201,117,58,0.1)',
                    color: '#C9753A',
                    border: '1px solid rgba(201,117,58,0.15)',
                  }}
                >
                  Register
                </button>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-[24px] font-bold mb-1 text-center"
              style={{ color: '#FDF4E3', fontFamily: "'Clash Display', system-ui, sans-serif" }}
            >
              {titles[mode].title}
            </h1>
            <p className="text-[14px] text-center mb-6" style={{ color: '#C9A882' }}>
              {titles[mode].subtitle}
            </p>

            {/* Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[13px] rounded-xl px-4 py-2.5 mb-4"
                  style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[13px] rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2"
                  style={{ color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                >
                  <CheckCircle size={14} />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-12 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#7A5E44' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[12px] text-right transition-colors hover:opacity-80"
                    style={{ color: '#C9753A' }}
                  >
                    Forgot password?
                  </button>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #C9753A, #D98E5A)',
                      color: '#0A0A0F',
                    }}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn size={18} />
                        Sign In
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}

              {mode === 'register' && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      Username
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                        minLength={3}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full pl-10 pr-12 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#7A5E44' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #C9753A, #D98E5A)',
                      color: '#0A0A0F',
                    }}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Create Account
                      </>
                    )}
                  </motion.button>

                  <p className="text-[12px] text-center" style={{ color: '#7A5E44' }}>
                    Your account will require admin approval before full access.
                  </p>
                </motion.form>
              )}

              {mode === 'forgot' && (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleForgot}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #C9753A, #D98E5A)',
                      color: '#0A0A0F',
                    }}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Send Code
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[13px] flex items-center justify-center gap-1.5 transition-colors hover:opacity-80"
                    style={{ color: '#C9A882' }}
                  >
                    <ArrowLeft size={14} />
                    Back to sign in
                  </button>
                </motion.form>
              )}

              {mode === 'code' && (
                <motion.form
                  key="code"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyCode}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      6-Digit Code
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44] tracking-[0.3em] font-mono text-center"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #C9753A, #D98E5A)',
                      color: '#0A0A0F',
                    }}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    ) : (
                      <>
                        <ArrowRight size={18} />
                        Verify
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[13px] flex items-center justify-center gap-1.5 transition-colors hover:opacity-80"
                    style={{ color: '#C9A882' }}
                  >
                    <ArrowLeft size={14} />
                    Back to sign in
                  </button>
                </motion.form>
              )}

              {mode === 'reset' && (
                <motion.form
                  key="reset"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleReset}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#C9A882' }}>
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#7A5E44' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full pl-10 pr-12 py-3 rounded-xl text-[14px] outline-none focus:border-[#C9753A] transition-colors text-[#FDF4E3] placeholder:text-[#7A5E44]"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: '#7A5E44' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #C9753A, #D98E5A)',
                      color: '#0A0A0F',
                    }}
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Reset Password
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[13px] flex items-center justify-center gap-1.5 transition-colors hover:opacity-80"
                    style={{ color: '#C9A882' }}
                  >
                    <ArrowLeft size={14} />
                    Back to sign in
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </SpotlightCard>

        <p className="mt-6 text-center text-[12px]" style={{ color: '#7A5E44' }}>
          EquityStream &copy; 2025. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
