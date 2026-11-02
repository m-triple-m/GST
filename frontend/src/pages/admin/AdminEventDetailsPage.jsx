import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, DollarSign, Download, CheckCircle2,
  Clock3, AlertTriangle, CreditCard, ArrowLeft, Edit2, Trash2,
  ExternalLink, Search, RefreshCw, AlertCircle, Loader2, Tag,
  Building2, UserCheck, ShieldCheck, Mail, ChevronRight, Lock, RotateCcw
} from 'lucide-react';
import api from '../../api';
import { gstToast } from '../../utils/toast';
import PaymentConfirmationModal from '../../components/modals/PaymentConfirmationModal';
import RefundConfirmationModal from '../../components/modals/RefundConfirmationModal';

/* ── Helpers ─────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return { day: '—', month: '—', full: '—' };
  let d;
  if (dateStr instanceof Date) {
    d = dateStr;
  } else {
    const s = String(dateStr).trim();
    d = /^\d{4}-\d{2}-\d{2}$/.test(s)
      ? new Date(`${s}T00:00:00Z`)
      : new Date(s);
  }
  if (isNaN(d.getTime())) return { day: '—', month: '—', full: '—' };
  return {
    day:   d.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' }),
    month: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
    full:  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
  };
}

function formatTime(timeStr) {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = ((h % 12) || 12);
  return `${hour}:${m} ${period}`;
}

function statusStyle(status) {
  switch ((status || '').toLowerCase()) {
    case 'upcoming':           return 'text-teal-600 bg-teal-50 border-teal-200';
    case 'past':               return 'text-slate-500 bg-slate-100 border-slate-200';
    case 'cancelled':          return 'text-rose-600 bg-rose-50 border-rose-200';
    case 'registration open':  return 'text-blue-600 bg-blue-50 border-blue-200';
    default:                   return 'text-slate-500 bg-slate-50 border-slate-200';
  }
}

function statusDot(status) {
  switch ((status || '').toLowerCase()) {
    case 'upcoming':          return 'bg-teal-500';
    case 'past':              return 'bg-slate-400';
    case 'cancelled':         return 'bg-rose-500';
    case 'registration open': return 'bg-blue-500';
    default:                  return 'bg-slate-400';
  }
}

function paymentBadge(status) {
  switch ((status || '').toLowerCase()) {
    case 'paid':      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 };
    case 'pending':   return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: Clock3 };
    case 'refunded':  return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: RefreshCw };
    case 'failed':    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', icon: AlertTriangle };
    default:          return { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', icon: Clock3 };
  }
}

/* ── CSV Export Helper ──────────────────────────────────── */
function exportParticipantsCSV(event, registrations) {
  if (!registrations || !registrations.length) {
    gstToast.error('No participants to export.');
    return;
  }
  const headers = ['Attendee Name', 'Email', 'Company', 'Attendee Type', 'Guests Count', 'Guest Names', 'Payment Method', 'Payment Status', 'Amount Paid ($)', 'Dietary Notes', 'Registered At'];
  const rows = registrations.map(r => {
    const guests = Array.isArray(r.guests) ? r.guests : [];
    const guestNames = guests.map(g => typeof g === 'string' ? g : (g.name || '')).filter(Boolean).join('; ');
    return [
      `"${(r.attendee_name || '').replace(/"/g, '""')}"`,
      `"${(r.attendee_email || '').replace(/"/g, '""')}"`,
      `"${(r.company || '').replace(/"/g, '""')}"`,
      `"${r.attendee_type || 'member'}"`,
      guests.length,
      `"${guestNames.replace(/"/g, '""')}"`,
      `"${r.payment_method || 'card'}"`,
      `"${r.payment_status || 'pending'}"`,
      `"${Number(r.amount_paid || 0).toFixed(2)}"`,
      `"${(r.dietary_notes || '').replace(/"/g, '""')}"`,
      `"${r.registered_at ? new Date(r.registered_at).toLocaleString() : ''}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${(event?.title || 'event').replace(/[^a-zA-Z0-9]/g, '_')}_participants.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  gstToast.success('Participant list exported to CSV.');
}

/* ── Delete Confirmation Modal ──────────────────────────── */
function DeleteEventModal({ event, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your admin password.');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await api.delete(`/events/${event.id}`, {
        data: { password }
      });
      gstToast.success(`Event "${event.title}" has been deleted.`);
      onSuccess(event.id);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to delete event. Please check your password.';
      setError(msg);
      gstToast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Confirm Event Deletion
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Are you sure you want to delete <strong className="text-slate-800 font-bold">"{event.title}"</strong>? This will permanently remove the event, its registrations, and its media. This action cannot be undone.
        </p>

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
              Admin Password Confirmation *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your admin password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleting || !password.trim()}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? 'Verifying…' : 'Delete Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main AdminEventDetailsPage Component ─────────────────── */
export default function AdminEventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [attendeeFilter, setAttendeeFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPaymentReg, setSelectedPaymentReg] = useState(null);
  const [selectedRefundReg, setSelectedRefundReg] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await api.get(`/events/${id}/registrations`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to load event details and registrations.';
      setFetchError(msg);
      gstToast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleConfirmPayment = async (regId, newStatus, paymentMethod, note) => {
    try {
      setUpdatingId(regId);
      const payload = { payment_status: newStatus };
      if (paymentMethod) payload.payment_method = paymentMethod;
      if (note) payload.notes = note;
      await api.patch(`/events/registrations/${regId}/status`, payload);
      const methodLabel = paymentMethod === 'at_door' ? 'Cash' : (paymentMethod === 'card' ? 'Card' : (paymentMethod === 'comp' ? 'Complimentary' : paymentMethod));
      gstToast.success(`Payment confirmed (${methodLabel}).`);
      await fetchDetails();
    } catch (err) {
      console.error(err);
      gstToast.error(err.response?.data?.message || 'Failed to update payment status.');
      throw err;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefund = async (regId) => {
    try {
      setUpdatingId(regId);
      await api.patch(`/events/registrations/${regId}/status`, { payment_status: 'refunded' });
      gstToast.success('Registration marked as refunded.');
      await fetchDetails();
    } catch (err) {
      console.error(err);
      gstToast.error(err.response?.data?.message || 'Failed to process refund.');
      throw err;
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Loading Event Details &amp; Participations…</p>
      </main>
    );
  }

  if (fetchError || !data || !data.event) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Unable to Load Details</h3>
            <p className="text-xs text-slate-500 mt-1">
              {fetchError || 'Event details could not be retrieved from the server.'}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/admin/events')}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Back to Events
            </button>
            <button
              onClick={fetchDetails}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { event, registrations = [], analytics = {} } = data;
  const { day, month, full: dateFull } = formatDate(event.event_date);
  const timeFormatted = formatTime(event.start_time);
  const endTimeFormatted = formatTime(event.end_time);

  // Compute pending metrics with fallback calculations to handle at-door orders
  const pendingList = registrations.filter(r => (r.payment_status || 'pending').toLowerCase() === 'pending');
  const pendingOrdersCount = analytics.pending_registrations ?? analytics.payment_status_counts?.pending ?? pendingList.length;
  const pendingAttendeesCount = analytics.pending_attendees_count ?? pendingList.reduce((acc, r) => acc + 1 + (Array.isArray(r.guests) ? r.guests.length : 0), 0);

  const fallbackPendingAmount = pendingList.reduce((acc, r) => {
    const partySize = 1 + (Array.isArray(r.guests) ? r.guests.length : 0);
    const unitPrice = r.attendee_type === 'guest'
      ? (Number(event?.non_member_ticket_cost) || Number(event?.ticket_cost) || 0)
      : (Number(event?.member_ticket_cost) || Number(event?.ticket_cost) || 0);
    const cost = Number(r.amount_paid) > 0 ? Number(r.amount_paid) : (Number(r.expected_amount || r.effective_amount) || (unitPrice * partySize));
    return acc + cost;
  }, 0);

  const pendingAmount = Number(analytics.pending_revenue ?? analytics.pending_amount ?? 0) > 0
    ? Number(analytics.pending_revenue ?? analytics.pending_amount ?? 0)
    : fallbackPendingAmount;

  const filteredRegistrations = registrations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.attendee_name || '').toLowerCase().includes(q) ||
      (r.attendee_email || '').toLowerCase().includes(q) ||
      (r.company || '').toLowerCase().includes(q) ||
      (Array.isArray(r.guests) && r.guests.some(g => (typeof g === 'string' ? g : g.name || '').toLowerCase().includes(q)));

    const matchPayment = paymentFilter === 'all' || (r.payment_status || 'pending').toLowerCase() === paymentFilter.toLowerCase();
    const matchAttendee = attendeeFilter === 'all' || (r.attendee_type || 'member').toLowerCase() === attendeeFilter.toLowerCase();

    return matchSearch && matchPayment && matchAttendee;
  });

  const capacityPct = event.capacity > 0
    ? Math.min(100, Math.round(((analytics.total_participants || 0) / event.capacity) * 100))
    : null;

  return (
    <main className="flex-1 min-w-0 flex flex-col pb-16 bg-slate-50/50">

      {/* ── Top Bar / Header ── */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-6 sm:px-10 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link to="/admin" className="hover:text-teal-400 transition-colors">Admin</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link to="/admin/events" className="hover:text-teal-400 transition-colors">Events</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-teal-300 truncate max-w-xs">{event.title}</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => exportParticipantsCSV(event, registrations)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 shadow-sm"
                title="Export attendee list to CSV"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <Link
                to={`/admin/events/${event.id}/edit`}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Event
              </Link>
              <Link
                to={`/events/${event.id}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Public Page
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Event Title and Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {event.event_type || 'Event'}
              </span>
              {event.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {event.category}
                </span>
              )}
              {event.featured === 1 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ★ Featured Event
                </span>
              )}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusStyle(event.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusDot(event.status)}`} />
                <span className="capitalize">{event.status || 'Upcoming'}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
              {event.title}
            </h1>

            {/* Meta Row */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-300 flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" /> {dateFull}
              </span>
              {timeFormatted && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-400" /> {timeFormatted}{endTimeFormatted ? ` – ${endTimeFormatted}` : ''}
                </span>
              )}
              {(event.location_name || event.location_address || event.location_type) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  {event.location_name || (event.location_type === 'online' ? 'Online Webinar' : (event.location_address || 'In Person'))}
                  {event.location_address && event.location_name && (
                    <span className="text-slate-400 font-normal">({event.location_address})</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 w-full space-y-8">

        {/* ── Analytics Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-900">
                ${Number(analytics.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                {analytics.paid_registrations ?? analytics.payment_status_counts?.paid ?? 0} paid order{(analytics.paid_registrations ?? analytics.payment_status_counts?.paid ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex-1 pr-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Attendees</p>
              <h3 className="text-2xl font-black text-slate-900">
                {analytics.total_participants || 0}
                {event.capacity > 0 && <span className="text-sm font-normal text-slate-400"> / {event.capacity}</span>}
              </h3>
              {event.capacity > 0 ? (
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all ${capacityPct >= 90 ? 'bg-rose-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              ) : (
                <p className="text-[11px] font-semibold text-slate-400 mt-1">Unlimited capacity</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Members vs Guests */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendee Breakdown</p>
              <h3 className="text-2xl font-black text-slate-900">
                {analytics.members_count ?? analytics.member_count ?? 0} <span className="text-xs font-bold text-slate-400">Members</span>
              </h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-1">
                {analytics.guests_count ?? analytics.guest_count ?? 0} Guest{(analytics.guests_count ?? analytics.guest_count ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Pending / Unpaid */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setPaymentFilter(prev => prev === 'pending' ? 'all' : 'pending')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setPaymentFilter(prev => prev === 'pending' ? 'all' : 'pending'); } }}
            className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex items-center justify-between select-none ${
              paymentFilter === 'pending'
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500 shadow-md scale-[1.01]'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'
            }`}
            title={paymentFilter === 'pending' ? 'Clear pending filter' : 'Click to filter participant list by pending payments'}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Payments</p>
                {paymentFilter === 'pending' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-800">
                    Filtered
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                ${Number(pendingAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] font-semibold text-amber-600 mt-1">
                {pendingOrdersCount > 0
                  ? `${pendingOrdersCount} pending order${pendingOrdersCount !== 1 ? 's' : ''}${pendingAttendeesCount > pendingOrdersCount ? ` (${pendingAttendeesCount} attendee${pendingAttendeesCount !== 1 ? 's' : ''})` : ''}`
                  : 'All payments collected'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              paymentFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-600'
            }`}>
              <Clock3 className="w-6 h-6" />
            </div>
          </div>

          {/* Refunded Amount */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Refunded Amount</p>
              <h3 className="text-2xl font-black text-slate-900">
                ${Number(analytics.refunded_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] font-semibold text-purple-600 mt-1">
                {analytics.refunded_registrations ?? analytics.payment_status_counts?.refunded ?? 0} refunded order{(analytics.refunded_registrations ?? analytics.payment_status_counts?.refunded ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ── Participations & Attendees Table Section ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Registered Participants
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  {filteredRegistrations.length} of {registrations.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage attendee payments, guest counts, and status.</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search participants…"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              {/* Payment status filter */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="all">Payment: All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>

              {/* Attendee type filter */}
              <select
                value={attendeeFilter}
                onChange={(e) => setAttendeeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="all">Type: All</option>
                <option value="member">Members</option>
                <option value="guest">Guests</option>
              </select>
            </div>
          </div>

          {/* Table Content */}
          {filteredRegistrations.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Users className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">No participants match the selected criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or status filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Attendee / Contact</th>
                    <th className="px-6 py-3.5">Company / Affiliation</th>
                    <th className="px-6 py-3.5">Type &amp; Guests</th>
                    <th className="px-6 py-3.5">Amount / Method</th>
                    <th className="px-6 py-3.5">Payment Status</th>
                    <th className="px-6 py-3.5">Registered Date</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((r) => {
                    const badge = paymentBadge(r.payment_status);
                    const guests = Array.isArray(r.guests) ? r.guests : [];
                    const isUpdating = updatingId === r.id;
                    const isPending = (r.payment_status || 'pending').toLowerCase() === 'pending';
                    const partySize = 1 + guests.length;
                    const unitPrice = r.attendee_type === 'guest'
                      ? (Number(event?.non_member_ticket_cost) || Number(event?.ticket_cost) || 0)
                      : (Number(event?.member_ticket_cost) || Number(event?.ticket_cost) || 0);
                    const effectiveAmount = Number(r.amount_paid) > 0
                      ? Number(r.amount_paid)
                      : (Number(r.expected_amount || r.effective_amount) || (unitPrice * partySize));

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Attendee */}
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900 text-sm">
                            {r.attendee_name || (r.first_name ? `${r.first_name} ${r.last_name || ''}` : 'Unnamed Attendee')}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{r.attendee_email || r.user_email || '—'}</span>
                          </div>
                          {r.dietary_notes && (
                            <div className="mt-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block">
                              <span className="font-bold">Diet:</span> {r.dietary_notes}
                            </div>
                          )}
                        </td>

                        {/* Company */}
                        <td className="px-6 py-4 text-slate-600 font-semibold">
                          {r.company ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {r.company}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal">—</span>
                          )}
                        </td>

                        {/* Attendee Type & Guests */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              r.attendee_type === 'guest' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}>
                              {r.attendee_type || 'member'}
                            </span>
                            {r.tier && (
                              <span className="text-[10px] font-bold text-slate-400">({r.tier})</span>
                            )}
                          </div>
                          {guests.length > 0 && (
                            <div className="mt-1 text-[11px] text-slate-500">
                              <span className="font-bold text-slate-700">+{guests.length} Guest{guests.length !== 1 ? 's' : ''}:</span>{' '}
                              <span className="text-slate-400">{guests.map(g => typeof g === 'string' ? g : g.name).filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                        </td>

                        {/* Amount / Method */}
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900 flex items-center gap-1.5">
                            <span>${Number(effectiveAmount).toFixed(2)}</span>
                            {isPending && Number(effectiveAmount) > 0 && Number(r.amount_paid || 0) === 0 && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Due
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <CreditCard className="w-3 h-3" />
                            {r.payment_method === 'at_door' ? 'Pay at Door' : (r.payment_method || 'Card')}
                          </div>
                        </td>

                        {/* Payment Status */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${badge.bg}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span className="capitalize">{r.payment_status || 'Pending'}</span>
                          </div>
                        </td>

                        {/* Registered Date */}
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {r.registered_at ? new Date(r.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.payment_status !== 'paid' && (
                              <button
                                onClick={() => setSelectedPaymentReg({
                                  ...r,
                                  amount_paid: effectiveAmount,
                                  amount: effectiveAmount,
                                  expected_amount: effectiveAmount,
                                  event_title: event?.title,
                                  event_date: event?.event_date
                                })}
                                disabled={isUpdating}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:shadow"
                                title="Open Payment Confirmation Modal"
                              >
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isUpdating ? 'Updating…' : 'Confirm Payment'}</span>
                              </button>
                            )}
                            {r.payment_status === 'paid' && (
                              <button
                                onClick={() => setSelectedRefundReg({ ...r, event_title: data.event?.title })}
                                disabled={isUpdating}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                                title="Refund / Void Payment"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                                <span>{isUpdating ? 'Updating…' : 'Refund'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* ── Event Details & Speaker Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Description & Speaker */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600" />
                Event Description &amp; Abstract
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {event.description || 'No description provided.'}
              </p>
            </div>

            {/* Speaker Information */}
            {event.speaker_name && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  Keynote Speaker
                </h3>
                <div className="flex items-start gap-4">
                  {event.speaker_image_url ? (
                    <img
                      src={event.speaker_image_url}
                      alt={event.speaker_name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-black text-slate-900">{event.speaker_name}</h4>
                    {event.speaker_org && (
                      <p className="text-xs font-bold text-teal-600 mt-0.5">{event.speaker_org}</p>
                    )}
                    {event.speaker_bio && (
                      <p className="text-xs text-slate-500 leading-relaxed mt-2 whitespace-pre-line">
                        {event.speaker_bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Images (if any) */}
            {Array.isArray(event.gallery) && event.gallery.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Event Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.gallery.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="rounded-2xl overflow-hidden border border-slate-100 aspect-video hover:opacity-90 transition-opacity">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Col: Logistics & Pricing Info */}
          <div className="space-y-6">
            
            {/* Logistics Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Logistics &amp; Access</h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Date</span>
                    <span className="text-slate-500">{dateFull}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Time</span>
                    <span className="text-slate-500">
                      {timeFormatted || 'TBD'}{endTimeFormatted ? ` – ${endTimeFormatted}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 block">Location</span>
                    <span className="text-slate-800 font-semibold block">{event.location_name || (event.location_type === 'online' ? 'Online' : 'In Person')}</span>
                    {event.location_address && (
                      <span className="text-slate-500 text-[11px] block mt-0.5">{event.location_address}</span>
                    )}
                  </div>
                </div>

                {event.location_url && (
                  <div className="flex items-start gap-3 pt-1">
                    <ExternalLink className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Meeting URL</span>
                      <a href={event.location_url} target="_blank" rel="noreferrer" className="text-teal-600 font-semibold hover:underline break-all">
                        {event.location_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Ticket Pricing</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/50 border border-teal-100">
                  <span className="text-xs font-bold text-slate-700">Member Ticket</span>
                  <span className="text-sm font-black text-teal-700">
                    ${Number(event.member_ticket_cost || event.ticket_cost || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-xs font-bold text-slate-700">Non-Member / Guest</span>
                  <span className="text-sm font-black text-blue-700">
                    ${Number(event.non_member_ticket_cost || event.ticket_cost || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <DeleteEventModal
          event={event}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            setShowDeleteModal(false);
            navigate('/admin/events');
          }}
        />
      )}

      {/* ── Payment Confirmation Modal ── */}
      {selectedPaymentReg && (
        <PaymentConfirmationModal
          isOpen={!!selectedPaymentReg}
          registration={selectedPaymentReg}
          onClose={() => setSelectedPaymentReg(null)}
          onConfirm={handleConfirmPayment}
        />
      )}

      {/* ── Refund Confirmation Modal ── */}
      {selectedRefundReg && (
        <RefundConfirmationModal
          isOpen={!!selectedRefundReg}
          registration={selectedRefundReg}
          onClose={() => setSelectedRefundReg(null)}
          onConfirm={handleRefund}
        />
      )}

    </main>
  );
}
