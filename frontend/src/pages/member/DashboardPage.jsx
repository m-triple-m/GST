import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Search, BookOpen, HandHeart, MessageSquare, LifeBuoy,
  MoreHorizontal, RefreshCcw, Globe, ArrowUpRight, Clock,
  Calendar, MapPin, CheckCircle2, Loader2, Ticket
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

/* ── Helpers ─────────────────────────────────────────────── */
function safeDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const s = String(val).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : new Date(s);
}

function formatEventDate(val) {
  const d = safeDate(val);
  if (!d || isNaN(d.getTime())) return { day: '—', month: '—' };
  return {
    day:   d.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' }),
    month: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
  };
}

function isPast(ev) {
  const d = safeDate(ev.event_date);
  if (!d) return false;
  return d < new Date(new Date().toDateString()); // compare date-only
}

const statusChip = {
  upcoming:   'bg-teal-50 text-teal-700 border-teal-200',
  past:       'bg-slate-100 text-slate-500 border-slate-200',
  cancelled:  'bg-rose-50 text-rose-600 border-rose-200',
};

const paymentChip = {
  pending:    'bg-amber-50 text-amber-700',
  paid:       'bg-teal-50 text-teal-700',
  refunded:   'bg-slate-100 text-slate-500',
  waived:     'bg-blue-50 text-blue-700',
};

/* ── Static data ─────────────────────────────────────────── */
const quickLinks = [
  { name: 'Guidelines', icon: BookOpen,       color: 'text-blue-500' },
  { name: 'Volunteer',  icon: HandHeart,       color: 'text-rose-500' },
  { name: 'Discussions',icon: MessageSquare,   color: 'text-teal-500' },
  { name: 'Support',    icon: LifeBuoy,        color: 'text-amber-500' },
];

/* ── My Events widget ─────────────────────────────────────── */
function MyEventsSection() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('upcoming'); // 'upcoming' | 'past'

  useEffect(() => {
    api.get('/members/me/events')
      .then(({ data }) => setEvents(data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter(e => !isPast(e));
  const past     = events.filter(e => isPast(e));
  const list     = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800">My Events</h2>
          {!loading && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {upcoming.length} upcoming · {past.length} past
            </p>
          )}
        </div>
        <Link
          to="/events"
          className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-teal-600 transition-colors border-b-2 border-transparent hover:border-teal-500 pb-1"
        >
          Browse All
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6 w-fit">
        {[['upcoming', 'Upcoming'], ['past', 'Past']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              tab === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-black ${tab === val ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-400'}`}>
              {val === 'upcoming' ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Loading…</span>
        </div>
      ) : list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
          <Calendar className="w-12 h-12 text-slate-200" />
          <p className="text-sm font-bold text-slate-400">
            {tab === 'upcoming' ? 'No upcoming events registered' : 'No past events'}
          </p>
          {tab === 'upcoming' && (
            <Link
              to="/events"
              className="mt-1 px-4 py-2 bg-teal-600 text-white text-xs font-black rounded-xl hover:bg-teal-500 transition-all"
            >
              Browse Events
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {list.map((ev) => {
            const { day, month } = formatEventDate(ev.event_date);
            const eventPast = isPast(ev);
            return (
              <Link
                to={`/events/${ev.event_id}`}
                key={ev.registration_id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group hover:shadow-md ${
                  eventPast
                    ? 'bg-slate-50 border-slate-100 hover:border-slate-200'
                    : 'bg-white border-slate-100 hover:border-teal-400/30'
                }`}
              >
                {/* Date badge */}
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${
                  eventPast ? 'bg-slate-100' : 'bg-teal-50 group-hover:bg-teal-100'
                } transition-colors`}>
                  <span className={`text-lg font-black leading-none ${eventPast ? 'text-slate-400' : 'text-teal-700'}`}>{day}</span>
                  <span className={`text-[9px] font-black mt-0.5 ${eventPast ? 'text-slate-400' : 'text-teal-500'}`}>{month}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {ev.event_type && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-slate-900 text-white rounded">
                        {ev.event_type}
                      </span>
                    )}
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${statusChip[ev.status] || statusChip.past}`}>
                      {ev.status}
                    </span>
                    {ev.payment_status && (
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${paymentChip[ev.payment_status] || ''}`}>
                        {ev.payment_status}
                      </span>
                    )}
                  </div>
                  <p className={`font-bold text-sm truncate ${eventPast ? 'text-slate-500' : 'text-slate-800'}`}>{ev.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {ev.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.start_time}
                        {ev.end_time ? ` – ${ev.end_time}` : ''}
                      </span>
                    )}
                    {(ev.location_name || ev.location_address) && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {ev.location_name || ev.location_address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ArrowUpRight className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${eventPast ? 'text-slate-300' : 'text-teal-400'}`} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="px-10 py-8 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Overview</p>
          <h1 className="text-3xl font-black text-slate-900">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all shadow-sm">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-10 pb-16 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Left Col: My Events (live) */}
          <div className="xl:col-span-2">
            <MyEventsSection />
          </div>

          {/* Right Col: Quick Links & Status */}
          <div className="space-y-8">
            {/* Quick Links */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-800 mb-6">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <button key={link.name} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-50 hover:border-teal-500/20 hover:bg-teal-50 group transition-all">
                    <link.icon className={`w-6 h-6 mb-3 ${link.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-teal-700">{link.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Register for Event CTA */}
            <Link
              to="/events"
              className="block bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-900/20 relative overflow-hidden group hover:shadow-2xl transition-all"
            >
              <div className="absolute inset-0 seismic-pattern opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Ticket className="w-8 h-8 text-teal-400" />
                  <ArrowUpRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
                <h2 className="text-lg font-black text-white mb-1">Browse Events</h2>
                <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">Register for upcoming meetings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Footer */}
      <footer className="px-10 py-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 GEOPHYSICAL SOCIETY OF TULSA</p>
        <div className="flex items-center gap-6">
          {['Terms', 'Privacy', 'Support', 'Contact'].map((link) => (
            <button key={link} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-teal-600 transition-colors">
              {link}
            </button>
          ))}
        </div>
      </footer>
    </main>
  );
}
