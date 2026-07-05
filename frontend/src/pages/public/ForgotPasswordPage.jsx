import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';
import api from '../../api';

/**
 * ForgotPasswordPage — 3-step OTP-based password reset.
 * Step 1: Enter email address → sends OTP
 * Step 2: Enter 6-digit OTP from email
 * Step 3: Set new password
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // ── step: 'email' | 'otp' | 'password' | 'done'
  const [step, setStep] = useState('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // ── Step 1: Request OTP ──────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────
  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ───────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = { email: 1, otp: 2, password: 3, done: 3 };
  const current = stepIndex[step];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 seismic-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-md w-full mx-auto">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg mb-4 hover:scale-105 transition-transform duration-200">
              <Globe className="w-8 h-8 text-white" strokeWidth={2.5} />
            </Link>
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-slate-400 text-sm mt-1">GST Member Portal</p>
          </div>

          {/* Step indicator */}
          {step !== 'done' && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    s < current ? 'bg-teal-500 text-white' :
                    s === current ? 'bg-teal-500 text-white ring-4 ring-teal-500/20' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {s < current ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-0.5 rounded transition-all duration-300 ${s < current ? 'bg-teal-500' : 'bg-slate-800'}`} />}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-7 h-7 text-teal-400" />
                </div>
                <p className="text-slate-300 text-sm">Enter your registered email address and we'll send you a one-time code.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                    placeholder="jane.smith@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-teal w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Send OTP</span> <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7 text-teal-400" />
                </div>
                <p className="text-slate-300 text-sm">
                  We sent a 6-digit code to <span className="text-teal-400 font-semibold">{email}</span>. Enter it below.
                </p>
                <p className="text-slate-500 text-xs mt-1">Check your spam folder if you don't see it. Code expires in 5 min.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">6-Digit OTP</label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  placeholder="――――――"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-teal w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Verify Code</span> <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || timer > 0}
                  className="text-xs text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Resending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7 text-teal-400" />
                </div>
                <p className="text-slate-300 text-sm">OTP verified! Now set your new password.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-800/50 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                    placeholder="Minimum 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-11 pr-12 py-3.5 bg-slate-800/50 border rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all ${
                      confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-teal-500'
                    }`}
                    placeholder="Re-enter new password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-400 mt-1 ml-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-teal w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Reset Password</span> <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-teal-500/10 border-2 border-teal-500 flex items-center justify-center mx-auto animate-fade-in">
                <CheckCircle className="w-10 h-10 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-2">Password Reset!</h2>
                <p className="text-slate-400 text-sm">Your password has been updated. All other sessions have been logged out for security.</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="btn-teal w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <span>Go to Login</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Back to login */}
          {step !== 'done' && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-xs text-slate-500 hover:text-teal-400 transition-colors">
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
