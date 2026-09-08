import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Plus, MapPin, Clock,
  AlertCircle, ArrowUpRight,
  Edit2, Trash2, Loader2, Search, RefreshCw, X,
  Users, DollarSign, Download, CheckCircle2,
  Clock3, AlertTriangle, CreditCard, Eye,
  Building2, UserCheck, ShieldCheck, Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { gstToast } from '../../utils/toast';

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

const STATUS_FILTERS = ['All', 'upcoming', 'past', 'cancelled'];

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

/* ── Password-Protected Delete Event Modal ─────────────────── */
function DeleteEventModal({ event, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }

    try {
      setDeleting(true);
      setError('');
      await api.delete(`/events/${event.id}`, {
        data: { password: password.trim() }
      });
      gstToast.success(`Event "${event.title}" deleted.`);
      onSuccess(event.id);
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Incorrect password or deletion failed.';
      setError(msg);
      gstToast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-8 space-y-6">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Delete Event</h3>
            <p className="text-xs text-slate-500 mt-0.5">Admin reconfirmation required</p>
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-4 text-xs text-rose-900 space-y-1">
          <p className="font-bold">Are you sure you want to permanently delete:</p>
          <p className="font-black text-slate-900 line-clamp-2">"{event.title}"?</p>
          <p className="text-[11px] text-rose-700 mt-1">
            This will permanently remove the event, registrations, and all participant records. This action cannot be undone.
          </p>
        </div>

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Admin Password Confirmation
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your admin password"
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                tabIndex={-1}
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-40" />}
              </button>
            </div>
            {error && (
              <p className="flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
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

/* ── Main AdminEvents Component ───────────────────────────── */
export default function AdminEvents() {
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [statusFilter, setFilter]     = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null); // Event object to delete
  const [regCounts, setRegCounts]     = useState({});     // { eventId: count }
  const [revenues, setRevenues]       = useState({});     // { eventId: revenue }

  /* ── Fetch events ── */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 100, page: 1, sort: 'event_date', order: 'desc' };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim())          params.search = search.trim();
      const { data } = await api.get('/events', { params });
      const list = data.data || [];
      setEvents(list);

      // Fetch registration details & revenues for each event in parallel
      const counts = {};
      const revs = {};
      await Promise.all(
        list.map(async (ev) => {
          try {
            const r = await api.get(`/events/${ev.id}/registrations`);
            const payload = r.data.data || {};
            counts[ev.id] = payload.analytics?.total_participants ?? (payload.registrations || []).length;
            revs[ev.id] = payload.analytics?.total_revenue ?? 0;
          } catch {
            counts[ev.id] = 0;
            revs[ev.id] = 0;
          }
        })
      );
      setRegCounts(counts);
      setRevenues(revs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDeleteSuccess = (deletedId) => {
    setEvents(prev => prev.filter(e => e.id !== deletedId));
  };

  const totalCollectedAllEvents = Object.values(revenues).reduce((a, b) => a + Number(b || 0), 0);
  const totalAttendeesAllEvents = Object.values(regCounts).reduce((a, b) => a + Number(b || 0), 0);

  return (
    <main className="flex-1 min-w-0 flex flex-col">

      {/* ── Delete Confirmation Password Modal ── */}
      {deleteTarget && (
        <DeleteEventModal
          event={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Calendar className="w-4 h-4" />
          <span className="mx-2">/</span>
          <span className="text-slate-900">Event Management</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/admin/events/new"
            className="btn-teal px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Create Event
          </Link>
        </div>
      </header>

      <div className="p-8 space-y-8 animate-fade-in">

        {/* ── Title + Search/Filter Row ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Events</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${events.length} event${events.length !== 1 ? 's' : ''} found — click any event to view participations and revenue details.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchEvents()}
                placeholder="Search events…"
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all w-48"
              />
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700 font-medium flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading events…</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-[2.5rem] border border-slate-200">
            <Calendar className="w-16 h-16 text-slate-200" />
            <p className="text-slate-400 font-bold">No events found</p>
            <Link
              to="/admin/events/new"
              className="btn-teal px-5 py-2.5 rounded-xl text-white text-xs font-black flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Create the first event
            </Link>
          </div>
        )}

        {/* ── Stats Summary (top) ── */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Events',         value: events.length },
              { label: 'Upcoming',             value: events.filter(e => e.status === 'upcoming').length },
              { label: 'Total Registrations',  value: totalAttendeesAllEvents },
              { label: 'Total Revenue',        value: `$${totalCollectedAllEvents.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Events List ── */}
        {!loading && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => {
              const { day, month } = formatDate(event.event_date);
              const attendees = regCounts[event.id] ?? 0;
              const revenue = revenues[event.id] ?? 0;
              const pct = event.capacity ? Math.min(100, Math.round((attendees / event.capacity) * 100)) : 0;

              const isPastEvent = (event.status || '').toLowerCase() === 'past';

              return (
                <div
                  key={event.id}
                  className={`rounded-[2rem] border shadow-sm overflow-hidden group transition-all duration-200 ${
                    isPastEvent
                      ? 'bg-slate-50/70 border-slate-200/60'
                      : 'bg-white border-slate-200 hover:border-teal-400/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row">

                    {/* Date badge */}
                    <div className={`w-full md:w-36 flex flex-col items-center justify-center py-7 border-b md:border-b-0 md:border-r border-slate-100 transition-colors flex-shrink-0 ${
                      isPastEvent
                        ? 'bg-slate-100/60'
                        : 'bg-slate-50 group-hover:bg-teal-50'
                    }`}>
                      <span className={`text-3xl font-black transition-colors ${
                        isPastEvent
                          ? 'text-slate-400'
                          : 'text-slate-900 group-hover:text-teal-600'
                      }`}>{day}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{month}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded">
                            {event.event_type || 'Event'}
                          </span>
                          {event.category && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded">
                              {event.category}
                            </span>
                          )}
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${statusStyle(event.status).split(' ')[0]}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot(event.status)}`} />
                            {event.status || 'Unknown'}
                          </div>
                        </div>
                        <Link to={`/admin/events/${event.id}`} className="hover:text-teal-600 transition-colors">
                          <h2 className="text-lg font-black text-slate-900 leading-tight truncate">{event.title}</h2>
                        </Link>
                        <div className="flex flex-wrap gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                          {(event.location_name || event.location_address || event.location_type) && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location_name || (event.location_type === 'online' ? 'Online' : (event.location_address || 'In Person'))}
                            </span>
                          )}
                          {event.start_time && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: stats + actions */}
                      <div className="flex items-center gap-6 flex-wrap lg:flex-nowrap shrink-0">

                        {/* Revenue Metric */}
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Revenue</div>
                          <div className="text-base font-black text-emerald-700">
                            ${Number(revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        {/* Attendees */}
                        <div className="text-right min-w-[90px]">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Participants</div>
                          <div className="text-base font-black text-slate-900">
                            {attendees} {event.capacity ? `/ ${event.capacity}` : ''}
                          </div>
                          {event.capacity > 0 && (
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 ml-auto">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* View Details & Participations Button */}
                        <Link
                          to={`/admin/events/${event.id}`}
                          className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          title="View attendee list, participations and revenue details"
                        >
                          <Eye className="w-4 h-4 text-teal-600" />
                          Details
                        </Link>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                            title="Edit event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(event)}
                            className="p-2.5 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                            title="Delete event (requires password)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/events/${event.id}`}
                            className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 shadow-sm transition-all"
                            title="Public event page"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

