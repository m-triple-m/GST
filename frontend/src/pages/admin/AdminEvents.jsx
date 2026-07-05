import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Plus, MoreVertical, MapPin, Clock,
  AlertCircle, ArrowUpRight, Filter, ShieldAlert,
  Edit2, Trash2, Loader2, Search, RefreshCw, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

/* ── Helpers ─────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return { day: '—', month: '—' };
  // mysql2 may return a JS Date object or a YYYY-MM-DD string.
  // Treat plain date strings as UTC to avoid timezone-shift off-by-one.
  let d;
  if (dateStr instanceof Date) {
    d = dateStr;
  } else {
    // "2024-10-24" → parse as UTC midnight to avoid local-tz shifting the day
    const s = String(dateStr).trim();
    d = /^\d{4}-\d{2}-\d{2}$/.test(s)
      ? new Date(`${s}T00:00:00Z`)
      : new Date(s);
  }
  if (isNaN(d.getTime())) return { day: '—', month: '—' };
  return {
    day:   d.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' }),
    month: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
  };
}

function statusStyle(status) {
  switch ((status || '').toLowerCase()) {
    case 'upcoming':           return 'text-teal-600';
    case 'past':               return 'text-slate-400';
    case 'cancelled':          return 'text-rose-500';
    case 'registration open':  return 'text-blue-600';
    default:                   return 'text-slate-500';
  }
}

function statusDot(status) {
  switch ((status || '').toLowerCase()) {
    case 'upcoming':          return 'bg-teal-500';
    case 'past':              return 'bg-slate-300';
    case 'cancelled':         return 'bg-rose-500';
    case 'registration open': return 'bg-blue-500';
    default:                  return 'bg-slate-400';
  }
}

const STATUS_FILTERS = ['All', 'upcoming', 'past', 'cancelled'];

/* ── Component ───────────────────────────────────────────── */
export default function AdminEvents() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setFilter]   = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId]   = useState(null); // id waiting for delete confirmation
  const [regCounts, setRegCounts]   = useState({});   // { eventId: count }

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

      // Fetch registration counts for each event in parallel
      const counts = {};
      await Promise.all(
        list.map(async (ev) => {
          try {
            const r = await api.get(`/events/${ev.id}/registrations`);
            counts[ev.id] = (r.data.data || []).length;
          } catch {
            counts[ev.id] = 0;
          }
        })
      );
      setRegCounts(counts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /* ── Delete ── */
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <main className="flex-1 min-w-0 flex flex-col">

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
            to="/dashboard/events/new"
            className="btn-teal px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-2"
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
              {loading ? 'Loading…' : `${events.length} event${events.length !== 1 ? 's' : ''} found`}
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
              to="/dashboard/events/new"
              className="btn-teal px-5 py-2.5 rounded-xl text-white text-xs font-black flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Create the first event
            </Link>
          </div>
        )}

        {/* ── Events List ── */}
        {!loading && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event) => {
              const { day, month } = formatDate(event.event_date);
              const attendees = regCounts[event.id] ?? 0;
              const pct = event.capacity ? Math.min(100, Math.round((attendees / event.capacity) * 100)) : 0;
              const isConfirming = confirmId === event.id;

              const isPastEvent = (event.status || '').toLowerCase() === 'past';

              return (
                <div
                  key={event.id}
                  className={`rounded-[2rem] border shadow-sm overflow-hidden group transition-all duration-200 ${
                    isPastEvent
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
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
                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded">
                            {event.event_type || 'Event'}
                          </span>
                          {event.category && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded">
                              {event.category}
                            </span>
                          )}
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${statusStyle(event.status)}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot(event.status)}`} />
                            {event.status || 'Unknown'}
                          </div>
                        </div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight">{event.title}</h2>
                        <div className="flex flex-wrap gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                          {event.location_name && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location_name}
                            </span>
                          )}
                          {event.start_time && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side: stats + actions */}
                      <div className="flex items-center gap-8 flex-shrink-0">

                        {/* Attendees */}
                        {event.capacity > 0 && (
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Attendees</div>
                            <div className="text-lg font-black text-slate-900">{attendees} / {event.capacity}</div>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isConfirming ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-rose-600">Delete?</span>
                              <button
                                onClick={() => handleDelete(event.id)}
                                disabled={deletingId === event.id}
                                className="px-3 py-1.5 bg-rose-500 text-white text-xs font-black rounded-lg hover:bg-rose-600 transition-all flex items-center gap-1"
                              >
                                {deletingId === event.id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : 'Yes'
                                }
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-black rounded-lg hover:bg-slate-200 transition-all"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <>
                              <Link
                                to={`/dashboard/events/${event.id}/edit`}
                                className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                                title="Edit event"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setConfirmId(event.id)}
                                className="p-2.5 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                title="Delete event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <Link
                                to={`/events/${event.id}`}
                                className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-500 shadow-lg shadow-teal-500/20 transition-all"
                                title="View event"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Stats Summary (bottom) ── */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Events',    value: events.length },
              { label: 'Upcoming',        value: events.filter(e => e.status === 'upcoming').length },
              { label: 'Past',            value: events.filter(e => e.status === 'past').length },
              { label: 'Total Registrations', value: Object.values(regCounts).reduce((a, b) => a + b, 0) },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
