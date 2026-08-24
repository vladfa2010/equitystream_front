import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/services/authApi';
import WebThreads from '@/components/react-bits/WebThreads';
import ShinyText from '@/components/react-bits/ShinyText';
import GlassSurface from '@/components/react-bits/GlassSurface';
import {
  LogIn, Eye, EyeOff, UserPlus, ArrowLeft, KeyRound,
  Mail, User, Lock, CheckCircle, ArrowRight
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

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(10, 10, 15, 0.7)',
    borderRadius: '24px',
    padding: 'clamp(24px, 6vw, 48px) clamp(20px, 5vw, 40px)',
    maxWidth: 'min(420px, calc(100vw - 32px))',
    width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    color: '#F5F5F0',
    transition: 'all 0.2s ease',
  };

  const inputFocusStyle = {
    outline: 'none',
    borderColor: 'rgba(184, 161, 78, 0.4)',
    boxShadow: '0 0 0 3px rgba(184, 161, 78, 0.08)',
  };

  const primaryButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #B8A14E 0%, #C9B25F 100%)',
    color: '#0A0A0F',
    borderRadius: '12px',
    height: '48px',
    fontWeight: 600,
  };

  const tabContainerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '4px',
  };

  const activeTabStyle: React.CSSProperties = {
    background: 'rgba(184, 161, 78, 0.12)',
    color: '#B8A14E',
    border: '1px solid rgba(184, 161, 78, 0.2)',
    borderRadius: '10px',
  };

  const inactiveTabStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#55555E',
    border: '1px solid transparent',
    borderRadius: '10px',
  };

  const errorStyle: React.CSSProperties = {
    background: 'rgba(239, 68, 68, 0.06)',
    border: '1px solid rgba(239, 68, 68, 0.12)',
    color: '#EF4444',
    borderRadius: '12px',
    padding: '12px 16px',
  };

  const successStyle: React.CSSProperties = {
    background: 'rgba(16, 185, 129, 0.06)',
    border: '1px solid rgba(16, 185, 129, 0.12)',
    color: '#10B981',
    borderRadius: '12px',
    padding: '12px 16px',
  };

  const linkStyle: React.CSSProperties = {
    color: '#C9B25F',
    fontSize: '13px',
    textDecoration: 'none',
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0A0A0F' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <WebThreads
          color1="#B8A14E"
          color2="#C9B25F"
          color3="#F5F5F0"
          speed={0.1}
          threadCount={4}
          frequency={8.5}
          spread={0.18}
          taper={0.4}
          position={0.5}
          fanMode="center"
          glow={0.02}
          falloff={0.63}
          thickness={0.85}
          brightness={0.5}
          opacity={0.7}
          mirror={true}
          shimmer={true}
          grain={true}
          grainIntensity={0.05}
          mouseInteraction={true}
          mouseStrength={0.27}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col items-center z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184, 161, 78, 0.1)' }}>

          </div>
          <ShinyText text="EQUITYSTREAM" speed={4} color="#B8A14E" />
        </div>

        {/* Divider */}
        <div
          className="mb-8"
          style={{ width: '120px', height: '1px', background: 'rgba(184, 161, 78, 0.15)' }}
        />

        {/* Card */}
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={24}
          borderWidth={0.01}
          backgroundOpacity={0.7}
          saturation={1.4}
          displace={0.5}
          blur={1}
          distortionScale={-180}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          mixBlendMode="difference"
          style={cardStyle}
          className="w-full"
        >
          {/* Tabs */}
          {mode === 'login' && (
            <div className="flex gap-1 mb-8" style={tabContainerStyle}>
              <button
                className="flex-1 py-2 text-[13px] font-medium transition-all"
                style={activeTabStyle}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('register')}
                className="flex-1 py-2 text-[13px] font-medium transition-all hover:opacity-80"
                style={inactiveTabStyle}
              >
                Register
              </button>
            </div>
          )}
          {mode === 'register' && (
            <div className="flex gap-1 mb-8" style={tabContainerStyle}>
              <button
                onClick={() => switchMode('login')}
                className="flex-1 py-2 text-[13px] font-medium transition-all hover:opacity-80"
                style={inactiveTabStyle}
              >
                Sign In
              </button>
              <button
                className="flex-1 py-2 text-[13px] font-medium transition-all"
                style={activeTabStyle}
              >
                Register
              </button>
            </div>
          )}

          {/* Title */}
          <h1
            className="text-[24px] font-bold mb-1 text-center"
            style={{ color: '#F5F5F0', fontFamily: "'Clash Display', system-ui, sans-serif" }}
          >
            {titles[mode].title}
          </h1>
          <p className="text-[14px] text-center mb-6" style={{ color: '#8A8A93' }}>
            {titles[mode].subtitle}
          </p>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[13px] mb-4"
                style={errorStyle}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[13px] mb-4 flex items-center gap-2"
                style={successStyle}
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
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-12 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: '#55555E' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-right transition-all duration-200 hover:underline"
                  style={linkStyle}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#B8A14E'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#C9B25F'; }}
                >
                  Forgot password?
                </button>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 text-[15px]"
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1.1)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(184, 161, 78, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
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
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Username
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-4 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                      minLength={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-10 pr-12 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: '#55555E' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 text-[15px]"
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1.1)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(184, 161, 78, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
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

                <p className="text-[12px] text-center" style={{ color: '#55555E' }}>
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
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 text-[15px]"
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1.1)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(184, 161, 78, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
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
                  className="flex items-center justify-center gap-1.5 transition-all duration-200 hover:underline"
                  style={linkStyle}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#B8A14E'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#C9B25F'; }}
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
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    6-Digit Code
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3 text-[14px] placeholder:text-[#55555E] tracking-[0.3em] font-mono text-center"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 text-[15px]"
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1.1)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(184, 161, 78, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
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
                  className="flex items-center justify-center gap-1.5 transition-all duration-200 hover:underline"
                  style={linkStyle}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#B8A14E'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#C9B25F'; }}
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
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: '#8A8A93' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#55555E' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-10 pr-12 py-3 text-[14px] placeholder:text-[#55555E]"
                      style={inputStyle}
                      onFocus={(e) => {
                        Object.assign(e.target.style, inputFocusStyle);
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: '#55555E' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 text-[15px]"
                  style={primaryButtonStyle}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1.1)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(184, 161, 78, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.filter = 'brightness(1)';
                    (e.target as HTMLElement).style.boxShadow = 'none';
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
                  className="flex items-center justify-center gap-1.5 transition-all duration-200 hover:underline"
                  style={linkStyle}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#B8A14E'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#C9B25F'; }}
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </GlassSurface>

        <p className="mt-6 text-center text-[12px]" style={{ color: '#55555E' }}>
          EquityStream &copy; 2025. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
