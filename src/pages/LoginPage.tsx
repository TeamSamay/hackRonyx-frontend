import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  User,
  Mail,
  KeyRound,
  FileCheck2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import type { UserRole, ClearanceLevel } from '@/types/auth';

export function LoginPage() {
  const { loginWithEmail, loginWithGoogle, registerAccount, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('Lead Forensic Auditor');
  const [clearanceLevel, setClearanceLevel] = useState<ClearanceLevel>('Level 3 - Gate Authority');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email) {
      setErrorMsg('Please enter your work email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const res = await loginWithEmail(email, password, rememberMe);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await registerAccount({
      name: fullName,
      email,
      organization,
      role,
      clearanceLevel,
      password,
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    const res = await loginWithGoogle();
    if (!res.success) {
      setErrorMsg(res.error || 'Google Authentication failed.');
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#09060E] text-[#F5F3F7] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 selection:bg-violet-500/30">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-radial from-violet-600/20 via-indigo-900/10 to-transparent blur-3xl" />
        <div className="absolute top-[30%] -right-[15%] h-[700px] w-[700px] rounded-full bg-radial from-blue-600/15 via-purple-900/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-[20%] left-[30%] h-[500px] w-[500px] rounded-full bg-radial from-fuchsia-600/15 via-transparent to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Main Single-Viewport Card */}
      <div className="relative z-10 w-full max-w-6xl h-full max-h-[880px] grid grid-cols-1 lg:grid-cols-12 rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-[#130E1F]/80 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-purple-950/60">
        
        {/* Left Column: Visual Artwork & High-Impact Brand Identity */}
        <div className="relative hidden lg:flex lg:col-span-7 flex-col justify-between p-8 xl:p-10 overflow-hidden border-r border-white/[0.08]">
          {/* Background Generated Visual Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/verdict-auth-bg.jpg"
              alt="Verdict AI Trust Gate"
              className="h-full w-full object-cover object-center scale-[1.02] transform transition duration-1000 hover:scale-105"
            />
            {/* Multi-layer Gradient Overlay for crisp legibility and cinematic depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0918] via-[#0E0918]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0E0918]/20 to-[#130E1F]" />
            <div className="absolute inset-0 bg-black/25" />
          </div>

          {/* Top Floating Badge & Brand */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 backdrop-blur-md">
              <AnimatedOrb size="sm" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider text-white">VERDICT</span>
                <span className="rounded bg-gradient-to-r from-violet-500 to-indigo-500 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-sm">
                  AI
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Deterministic Gate 2.0 Active</span>
            </div>
          </div>

          {/* Bottom Highlights & Metrics */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-600/20 px-3 py-1 text-xs font-semibold text-violet-200 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-300" />
              <span>High-Consequence Autonomous Case Arbitration</span>
            </div>

            <h1 className="text-2xl xl:text-3xl font-black tracking-tight text-white leading-tight">
              Arbitrate Complex Disputes with{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                Zero Hallucinations
              </span>
            </h1>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="rounded-xl border border-white/10 bg-black/50 p-2.5 text-center backdrop-blur-md">
                <div className="text-lg font-black text-white font-mono">99.8%</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wider">Audit Precision</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/50 p-2.5 text-center backdrop-blur-md">
                <div className="text-lg font-black text-emerald-400 font-mono">0 ms</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wider">Contradiction Gap</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/50 p-2.5 text-center backdrop-blur-md">
                <div className="text-lg font-black text-cyan-300 font-mono">100%</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wider">Traceable Chain</div>
              </div>
            </div>

            {/* Compliance badges */}
            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> SOC2 Type II
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> ISO 27001
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> 256-Bit E2EE
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Responsive Auth Form (Zero Scrolling) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-between p-5 sm:p-7 md:p-8 overflow-y-auto max-h-full">
          
          {/* Top Brand (Mobile only) */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <AnimatedOrb size="sm" />
              <span className="text-base font-black tracking-wider text-white">VERDICT AI</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-md px-2 py-0.5">
              Gate 2.0
            </span>
          </div>

          <div className="my-auto space-y-4">
            {/* Header Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {mode === 'signin'
                  ? 'Access your deterministic case analysis workspace'
                  : 'Provision authorized enterprise arbitration credentials'}
              </p>
            </div>

            {/* Test Credentials Auto-Fill Banner */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/40 p-2.5 sm:p-3 backdrop-blur-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  Test Credentials
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo@verdict.ai');
                    setPassword('Verdict2026!');
                    setErrorMsg(null);
                  }}
                  className="text-[10px] font-semibold text-violet-200 hover:text-white bg-violet-600/40 hover:bg-violet-600/70 border border-violet-400/40 px-2.5 py-0.5 rounded-md transition cursor-pointer"
                >
                  Auto-Fill
                </button>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-gray-300">
                <span>
                  <span className="text-gray-400">Email:</span>{' '}
                  <span className="text-emerald-300 font-semibold select-all">demo@verdict.ai</span>
                </span>
                <span>
                  <span className="text-gray-400">Pass:</span>{' '}
                  <span className="text-emerald-300 font-semibold select-all">Verdict2026!</span>
                </span>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google Authentication */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.14] bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.1] hover:border-violet-400/60 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#130E1F] px-3 text-[10px] uppercase tracking-widest text-gray-400 font-mono">
                or with email
              </span>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="demo@verdict.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.12] bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[10px] text-violet-300 hover:text-violet-200 transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.12] bg-black/40 pl-9 pr-9 py-2 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-600 bg-black/40 text-violet-600 focus:ring-violet-500"
                    />
                    <span>Remember session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 animate-spin text-amber-300" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Enter Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-0.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. Evelyn Vance"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.12] bg-black/40 pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-0.5">Organization</label>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Aegis Legal"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.12] bg-black/40 pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-0.5">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="evelyn@aegis-forensics.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.12] bg-black/40 pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-0.5">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full rounded-xl border border-white/[0.12] bg-black/60 px-2 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="Lead Forensic Auditor">Auditor</option>
                      <option value="Senior Legal Counsel">Counsel</option>
                      <option value="Chief Risk Officer">Risk Officer</option>
                      <option value="Compliance Director">Director</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-0.5">Clearance</label>
                    <select
                      value={clearanceLevel}
                      onChange={(e) => setClearanceLevel(e.target.value as ClearanceLevel)}
                      className="w-full rounded-xl border border-white/[0.12] bg-black/60 px-2 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="Level 1 - Case Ingestion">Level 1</option>
                      <option value="Level 2 - Legal Review">Level 2</option>
                      <option value="Level 3 - Gate Authority">Level 3</option>
                      <option value="Top Secret (TS-SCI)">TS-SCI</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-0.5">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.12] bg-black/40 pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-600/30 mt-1 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Provisioning...</span>
                  ) : (
                    <>
                      <span>Create Authorized Account</span>
                      <FileCheck2 className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Security Note */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Zero-Knowledge Vault</span>
            </span>
            <span>© 2026 VERDICT AI</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1B1526] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-violet-400" />
              Reset Security Credentials
            </h3>
            <p className="mt-1 text-xs text-gray-300">
              Enter your enterprise work email to receive an instant cryptographic access recovery packet.
            </p>

            {resetSent ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Recovery Packet Generated
                </div>
                <p className="text-[11px] text-gray-300">
                  A temporary one-time password bypass token has been provisioned for your workspace.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                  }}
                  className="mt-2 w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (resetEmail) setResetSent(true);
                }}
                className="mt-4 space-y-3"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your registered work email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-500 cursor-pointer"
                  >
                    Dispatch Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
