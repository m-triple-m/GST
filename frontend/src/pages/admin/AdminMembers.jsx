import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search,
  CheckCircle2, XCircle, AlertCircle, Star, StarOff,
  ChevronLeft, ChevronRight, RefreshCw, Loader2, Trash2,
  ShieldAlert, ShieldCheck, ShieldOff, X, KeyRound, Copy, Eye
} from 'lucide-react';
import api from '../../api';

// ─────────────────────────────────────────────────────────
//  Confirm Modal
// ─────────────────────────────────────────────────────────
function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  if (!open) return null;

  const btnCls = {
    danger:  'bg-rose-600 hover:bg-rose-500 text-white',
    success: 'bg-teal-600 hover:bg-teal-500 text-white',
    warning: 'bg-amber-500 hover:bg-amber-400 text-white',
  }[variant] ?? 'bg-slate-800 hover:bg-slate-700 text-white';

  const iconCls = {
    danger:  'bg-rose-100 text-rose-600',
    success: 'bg-teal-100 text-teal-600',
    warning: 'bg-amber-100 text-amber-600',
  }[variant] ?? 'bg-slate-100 text-slate-600';

  const Icon = {
    danger:  ShieldAlert,
    success: ShieldCheck,
    warning: AlertCircle,
  }[variant] ?? ShieldAlert;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconCls}`}>
          <Icon className="w-6 h-6" />
        </div>

        {/* Content */}
        <h3 className="text-base font-black text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${btnCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Status badge
// ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    active:   { dot: 'bg-teal-500',  text: 'text-teal-600',  label: 'Active'   },
    pending:  { dot: 'bg-amber-500', text: 'text-amber-600', label: 'Pending'  },
    inactive: { dot: 'bg-slate-300', text: 'text-slate-400', label: 'Inactive' },
  }[status] ?? { dot: 'bg-slate-300', text: 'text-slate-400', label: status };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Tier badge
// ─────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const cfg = {
    corporate:    'bg-purple-100 text-purple-700',
    professional: 'bg-blue-100 text-blue-700',
    student:      'bg-teal-100 text-teal-700',
  }[tier] ?? 'bg-slate-100 text-slate-500';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg}`}>
      {tier}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
//  Action button
// ─────────────────────────────────────────────────────────
function ActionBtn({ onClick, disabled, title, children, variant = 'default' }) {
  const variants = {
    default: 'text-slate-400 hover:text-slate-900 hover:bg-slate-100',
    success: 'text-slate-400 hover:text-teal-600 hover:bg-teal-50',
    danger:  'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
    gold:    'text-slate-400 hover:text-amber-500 hover:bg-amber-50',
    warning: 'text-slate-400 hover:text-orange-500 hover:bg-orange-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────
export default function AdminMembers() {
  const [members, setMembers]             = useState([]);
  const [pagination, setPagination]       = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading]             = useState(true);
  const [acting, setActing]               = useState({});
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [tierFilter, setTierFilter]       = useState('');
  const [page, setPage]                   = useState(1);
  const [error, setError]                 = useState('');

  // ── Confirm modal state ──────────────────────────────
  const [modal, setModal] = useState({
    open: false, title: '', message: '', confirmLabel: '', variant: 'danger', onConfirm: null,
  });

  // ── Password reset reveal state ──────────────────────
  const [pwModal, setPwModal] = useState({ open: false, name: '', password: '' });
  const [copied, setCopied] = useState(false);

  const showConfirm = (opts) => setModal({ open: true, ...opts });
  const closeModal  = () => setModal((m) => ({ ...m, open: false }));

  // ── Fetch ────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search)       params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter)   params.set('tier',   tierFilter);
      const { data } = await api.get(`/members?${params}`);
      setMembers(data.data || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, tierFilter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { setPage(1); }, [search, statusFilter, tierFilter]);

  // ── Action helpers ───────────────────────────────────
  const setMemberActing = (id, val) => setActing((a) => ({ ...a, [id]: val }));

  const updateStatus = async (id, status) => {
    setMemberActing(id, true);
    try {
      await api.patch(`/members/${id}/status`, { status });
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const toggleExecutive = async (id, isExecutive) => {
    setMemberActing(id, true);
    try {
      await api.patch(`/members/${id}/executive`, { is_executive: isExecutive });
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_executive: isExecutive ? 1 : 0 } : m))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const deleteMember = async (id) => {
    setMemberActing(id, true);
    try {
      await api.delete(`/members/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setPagination((p) => ({ ...p, total: p.total - 1 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  const resetPassword = async (id, name) => {
    setMemberActing(id, true);
    try {
      const { data } = await api.patch(`/members/${id}/reset-password`);
      setPwModal({ open: true, name, password: data.data.newPassword });
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setMemberActing(id, false);
    }
  };

  // ── Confirm wrappers (open modal, execute on confirm) ─
  const confirmApprove = (m) =>
    showConfirm({
      title:        'Approve Membership',
      message:      `Approve ${m.first_name} ${m.last_name}'s membership application? They will become an active member.`,
      confirmLabel: 'Approve',
      variant:      'success',
      onConfirm:    () => updateStatus(m.id, 'active'),
    });

  const confirmDeactivate = (m) =>
    showConfirm({
      title:        'Deactivate Member',
      message:      `Deactivate ${m.first_name} ${m.last_name}? Their account will be suspended.`,
      confirmLabel: 'Deactivate',
      variant:      'danger',
      onConfirm:    () => updateStatus(m.id, 'inactive'),
    });

  const confirmSetPending = (m) =>
    showConfirm({
      title:        'Reset to Pending',
      message:      `Move ${m.first_name} ${m.last_name} back to pending status? This will require a new review.`,
      confirmLabel: 'Reset',
      variant:      'warning',
      onConfirm:    () => updateStatus(m.id, 'pending'),
    });

  const confirmMakeExecutive = (m) =>
    showConfirm({
      title:        'Promote to Executive',
      message:      `Promote ${m.first_name} ${m.last_name} to executive member? They will appear on the Executive Board page.`,
      confirmLabel: 'Promote',
      variant:      'success',
      onConfirm:    () => toggleExecutive(m.id, true),
    });

  const confirmRemoveExecutive = (m) =>
    showConfirm({
      title:        'Remove Executive Status',
      message:      `Remove executive status from ${m.first_name} ${m.last_name}? They will no longer appear on the Executive Board.`,
      confirmLabel: 'Remove',
      variant:      'warning',
      onConfirm:    () => toggleExecutive(m.id, false),
    });

  const confirmDelete = (m) =>
    showConfirm({
      title:        'Delete Member',
      message:      `Permanently delete ${m.first_name} ${m.last_name}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant:      'danger',
      onConfirm:    () => deleteMember(m.id),
    });

  const confirmResetPassword = (m) =>
    showConfirm({
      title:        'Reset Password',
      message:      `Reset ${m.first_name} ${m.last_name}'s password to the default formula (GST@YEAR+Name)? They will need to use the new password on their next login.`,
      confirmLabel: 'Reset Password',
      variant:      'warning',
      onConfirm:    () => resetPassword(m.id, `${m.first_name} ${m.last_name}`),
    });

  const pendingCount = members.filter((m) => m.status === 'pending').length;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Confirm modal */}
      <ConfirmModal
        open={modal.open}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        variant={modal.variant}
      />

      {/* Password Reset Success Modal */}
      {pwModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPwModal({ open: false, name: '', password: '' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <button
              onClick={() => setPwModal({ open: false, name: '', password: '' })}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-teal-100 text-teal-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Password Reset</h3>
            <p className="text-sm text-slate-500 mb-5">
              The password for <strong>{pwModal.name}</strong> has been reset to the default. Share this with the member securely.
            </p>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
              <Eye className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <code className="text-sm font-black text-teal-600 tracking-widest flex-1 select-all">{pwModal.password}</code>
              <button
                onClick={() => copyToClipboard(pwModal.password)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-all"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {copied && (
              <p className="text-xs text-teal-600 font-bold text-center mb-3">✓ Copied to clipboard!</p>
            )}

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4">
              Formula: <code className="font-mono">GST@&lt;YEAR&gt;&lt;FIRST3CHARS&gt;</code>. This password is not stored anywhere — share it with the member directly.
            </p>

            <button
              onClick={() => setPwModal({ open: false, name: '', password: '' })}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span className="mx-2">/</span>
            <span className="text-slate-900">Member Directory</span>
          </div>
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <div className="p-8 space-y-6 animate-fade-in">

          {/* Title + filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Members</h1>
              <p className="text-sm text-slate-400 mt-1">
                {pagination.total} total ·{' '}
                {pendingCount > 0 && (
                  <span className="text-amber-600 font-bold">{pendingCount} pending review</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, company…"
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-60"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              >
                <option value="">All tiers</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-4 text-rose-400 hover:text-rose-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-500 mx-auto" />
                      </td>
                    </tr>
                  )}
                  {!loading && members.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                        No members found.
                      </td>
                    </tr>
                  )}
                  {!loading && members.map((m) => {
                    const isActing = !!acting[m.id];
                    const initials = `${m.first_name?.[0] ?? ''}${m.last_name?.[0] ?? ''}`.toUpperCase();
                    const joined   = m.joined_at
                      ? new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : '—';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-teal-500 group-hover:text-white transition-all duration-200 flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-slate-900">{m.first_name} {m.last_name}</span>
                                {m.is_executive === 1 && (
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Executive" />
                                )}
                              </div>
                              <div className="text-xs text-slate-400">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                          {m.company || <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4"><TierBadge tier={m.tier} /></td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">{joined}</td>
                        <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isActing
                              ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                              : (
                                <>
                                  {/* Approve */}
                                  {m.status !== 'active' && (
                                    <ActionBtn variant="success" title="Approve membership" onClick={() => confirmApprove(m)}>
                                      <CheckCircle2 className="w-4 h-4" />
                                    </ActionBtn>
                                  )}
                                  {/* Deactivate */}
                                  {m.status === 'active' && (
                                    <ActionBtn variant="danger" title="Deactivate membership" onClick={() => confirmDeactivate(m)}>
                                      <XCircle className="w-4 h-4" />
                                    </ActionBtn>
                                  )}
                                  {/* Set pending */}
                                  {m.status === 'active' && (
                                    <ActionBtn title="Reset to pending" onClick={() => confirmSetPending(m)}>
                                      <AlertCircle className="w-4 h-4" />
                                    </ActionBtn>
                                  )}
                                  {/* Executive toggle */}
                                  {m.status === 'active' && (m.is_executive
                                    ? (
                                      <ActionBtn variant="gold" title="Remove executive status" onClick={() => confirmRemoveExecutive(m)}>
                                        <StarOff className="w-4 h-4" />
                                      </ActionBtn>
                                    ) : (
                                      <ActionBtn variant="gold" title="Make executive member" onClick={() => confirmMakeExecutive(m)}>
                                        <Star className="w-4 h-4" />
                                      </ActionBtn>
                                    )
                                  )}
                                  {/* Reset Password */}
                                  <ActionBtn variant="warning" title="Reset password to default" onClick={() => confirmResetPassword(m)}>
                                    <KeyRound className="w-4 h-4" />
                                  </ActionBtn>
                                  {/* Delete */}
                                  <ActionBtn variant="danger" title="Delete member" onClick={() => confirmDelete(m)}>
                                    <Trash2 className="w-4 h-4" />
                                  </ActionBtn>
                                </>
                              )
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">
                  Showing <span className="text-slate-900 font-bold">{members.length}</span> of{' '}
                  <span className="text-slate-900 font-bold">{pagination.total}</span> members
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-teal-600 rounded-2xl p-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] text-teal-200 font-bold uppercase tracking-widest mb-1">Active</p>
                <p className="text-2xl font-black">{members.filter((m) => m.status === 'active').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-teal-300" />
            </div>
            <div className="bg-amber-500 rounded-2xl p-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest mb-1">Pending</p>
                <p className="text-2xl font-black">{members.filter((m) => m.status === 'pending').length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-300" />
            </div>
            <div className="bg-slate-800 rounded-2xl p-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Executives</p>
                <p className="text-2xl font-black">{members.filter((m) => m.is_executive).length}</p>
              </div>
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
