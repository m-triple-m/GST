import { useState, useEffect, useRef } from 'react';
import {
  Plus, Mail, Lock, Eye, EyeOff, Check,
  AlertTriangle, Loader2, UserCog, RefreshCw, X,
  KeyRound, ChevronRight, Shield
} from 'lucide-react';
import api from '../../api';

// ── Password Wall Modal ───────────────────────────────────────────────────────
function PasswordWall({ onVerified, onClose }) {
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError('Please enter your password.'); return; }
    try {
      setLoading(true);
      setError('');
      await api.post('/admin/verify-password', { password });
      onVerified();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
          <KeyRound className="w-7 h-7 text-amber-500" />
        </div>

        <h2 className="text-xl font-black text-slate-900 text-center">Confirm Your Identity</h2>
        <p className="text-sm text-slate-500 text-center mt-1 mb-6 leading-relaxed">
          Enter your current password to access admin account management.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              id="wall-password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Your current password"
              className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ChevronRight className="w-4 h-4" />}
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Add Admin Form ────────────────────────────────────────────────────────────
function AddAdminForm({ onSuccess, onClose }) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    try {
      setSubmitting(true);
      setError('');
      await api.post('/admin/accounts', { email, password, role: 'admin' });
      onSuccess(email);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">New Admin Account</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="acc-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="acc-email"
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="newadmin@example.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="acc-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Temporary Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="acc-password"
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Min. 8 characters"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">The new admin should update this on first login.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-sm font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? 'Creating…' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminAccounts() {
  const [accounts, setAccounts]       = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Password-wall: must be passed once per session before the form opens
  const [wallOpen, setWallOpen] = useState(false);
  const [verified, setVerified] = useState(false);

  const [showForm, setShowForm]   = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoadingList(true);
      const { data } = await api.get('/admin/accounts');
      setAccounts(data.data ?? []);
    } catch (err) {
      console.error('Failed to load admin accounts', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleAddClick = () => {
    if (verified) {
      setShowForm(true);
    } else {
      setWallOpen(true);
    }
  };

  const handleWallVerified = () => {
    setVerified(true);
    setWallOpen(false);
    setShowForm(true);
  };

  const handleFormSuccess = (email) => {
    setSuccessMsg(`Admin account for ${email} created successfully.`);
    setShowForm(false);
    fetchAccounts();
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  return (
    <main className="flex-1 min-w-0 flex flex-col">

      {/* Password Wall Modal */}
      {wallOpen && (
        <PasswordWall
          onVerified={handleWallVerified}
          onClose={() => setWallOpen(false)}
        />
      )}

      {/* Top bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <UserCog className="w-4 h-4" />
          <span className="mx-1">/</span>
          <span className="text-slate-900">Admin Accounts</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAccounts}
            title="Refresh"
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition-all border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Title + lock indicator */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Accounts</h1>
            <p className="text-slate-500 text-sm mt-1">
              Create and manage administrator accounts. Your password is required to add a new admin.
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            verified
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {verified
              ? <><Check className="w-3.5 h-3.5" /> Session Unlocked</>
              : <><KeyRound className="w-3.5 h-3.5" /> Password Required</>
            }
          </div>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl text-teal-700 text-sm font-semibold">
            <Check className="w-5 h-5 text-teal-500 shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Add Admin Form (shown after password wall is passed) */}
        {showForm && (
          <AddAdminForm
            onSuccess={handleFormSuccess}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Accounts table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">All Admin Accounts</h2>
            <span className="text-xs text-slate-400 font-bold">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loadingList ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No admin accounts found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center font-black text-sm text-teal-700 shrink-0">
                      {(acc.first_name?.[0] ?? acc.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {acc.first_name
                          ? `${acc.first_name} ${acc.last_name ?? ''}`.trim()
                          : <span className="text-slate-400 italic font-normal">No profile</span>}
                      </p>
                      <p className="text-xs text-slate-400">{acc.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-teal-100 text-teal-700 border-teal-200">
                      Admin
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      acc.is_active
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-red-100 text-red-600 border-red-200'
                    }`}>
                      {acc.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:block">
                      {new Date(acc.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
