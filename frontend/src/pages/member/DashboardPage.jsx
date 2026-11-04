import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Search, BookOpen, HandHeart, MessageSquare, LifeBuoy,
  MoreHorizontal, RefreshCcw, Globe, ArrowUpRight, Clock,
  Calendar, MapPin, CheckCircle2, Loader2, Ticket, ShieldAlert,
  RefreshCw, X, Award, FileText
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { gstToast } from '../../utils/toast';
import MembershipCertificateModal from '../../components/modals/MembershipCertificateModal';

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

/* ── Membership Status & Renewal Components ────────────────── */
function MembershipStatusCard({ profile, loading, onRenewClick, onViewCert }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-center justify-center gap-3 py-10 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
        <span className="text-xs font-bold uppercase tracking-widest">Loading membership…</span>
      </div>
    );
  }

  const tierLabel = {
    student: 'Student Member',
    professional: 'Professional Member',
    corporate: 'Corporate Member',
  }[profile?.tier] || 'Member';

  const isExpired = profile?.status === 'expired';
  const isActive = profile?.status === 'active';

  const expiresDate = profile?.expires_at ? new Date(profile.expires_at) : null;
  const now = new Date();
  const diffDays = expiresDate ? Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Membership</span>
            {(profile?.member_id || profile?.id) && (
              <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Member ID: #{profile?.member_id || profile?.id}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-0.5">{tierLabel}</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          isExpired
            ? 'bg-rose-50 text-rose-600 border border-rose-200'
            : isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {isExpired ? 'Expired' : isActive ? 'Active' : profile?.status || 'Pending'}
        </span>
      </div>

      <div className="space-y-3 py-3 border-y border-slate-100 my-4 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">Joined Date:</span>
          <span className="text-slate-700 font-bold">
            {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">Expiration Date:</span>
          <span className={`font-black ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
            {expiresDate ? expiresDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Expiry Set'}
          </span>
        </div>
        {expiresDate && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Standing:</span>
            <span className={`font-bold text-[11px] ${
              isExpired
                ? 'text-rose-600 font-black'
                : diffDays <= 30
                  ? 'text-amber-600 font-black'
                  : 'text-teal-600'
            }`}>
              {isExpired
                ? `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`
                : `${diffDays} days remaining`}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onRenewClick}
        className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
          isExpired
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 shadow-md'
            : 'btn-teal text-white shadow-teal-500/20'
        }`}
      >
        <RefreshCw className="w-4 h-4" />
        {isExpired ? 'Renew Membership (+1 Year)' : 'Renew / Extend (+1 Year)'}
      </button>

      {isActive && (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onViewCert?.('certificate')}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>Certificate</span>
          </button>
          <button
            type="button"
            onClick={() => onViewCert?.('receipt')}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Tax Receipt</span>
          </button>
        </div>
      )}
    </div>
  );
}

function RenewModal({ open, onClose, profile, onSuccess }) {
  if (!open) return null;
  const [loading, setLoading] = useState(false);

  const tierPrices = {
    student: '$80',
    professional: '$110',
    corporate: '$150',
  };

  const price = tierPrices[profile?.tier] || '$110';

  const handleRenew = async () => {
    setLoading(true);
    try {
      await api.post('/members/me/renew', { months: 12 });
      gstToast.success('Membership successfully renewed for 1 year!');
      window.dispatchEvent(new Event('profileUpdated'));
      onSuccess?.();
      onClose();
    } catch (err) {
      gstToast.error(err.response?.data?.message || 'Failed to renew membership.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5 text-teal-600">
          <RefreshCw className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">Renew GST Membership</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Maintain your active standing with the Geophysical Society of Tulsa. Your renewal extends your membership by 12 months from your expiration date.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 mb-6 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tier</span>
            <span className="font-black text-slate-900 capitalize">{profile?.tier || 'Professional'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Annual Fee</span>
            <span className="font-black text-teal-600 text-sm">{price} / year</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Extension Period</span>
            <span className="font-bold text-slate-800">+12 Months</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleRenew}
            className="flex-1 py-3 rounded-xl btn-teal text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Renewal'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen]   = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/members/me');
      setProfile(data.data || null);
    } catch (err) {
      console.error('Failed to load profile for dashboard', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, [fetchProfile]);

  const isExpired = profile?.status === 'expired';
  const expiresDate = profile?.expires_at ? new Date(profile.expires_at) : null;
  const now = new Date();
  const diffDays = expiresDate ? Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24)) : null;
  const isExpiringSoon = !isExpired && diffDays !== null && diffDays <= 30 && diffDays > 0;

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="px-10 py-8 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Overview</p>
          <h1 className="text-3xl font-black text-slate-900">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : (user?.email ? `, ${user.email.split('@')[0]}` : '')}
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
        {/* Expiration Alert Banner */}
        {isExpired && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-950">Your GST Membership has Expired</h3>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed max-w-2xl">
                  Your membership expired on {expiresDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Renew your membership now to continue enjoying discounted technical luncheons, voting privileges, and full resource access.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRenewModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-all shadow-lg shadow-rose-600/20"
            >
              Renew Membership
            </button>
          </div>
        )}

        {isExpiringSoon && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950">Membership Expiring Soon</h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed max-w-2xl">
                  Your membership expires in <strong>{diffDays} days</strong> on {expiresDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Renew early to avoid any interruption in membership perks and luncheon discounts.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRenewModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 transition-all shadow-lg shadow-amber-600/20"
            >
              Renew Early
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Col: My Events (live) */}
          <div className="xl:col-span-2">
            <MyEventsSection />
          </div>

          {/* Right Col: Membership Standing, Quick Links & CTA */}
          <div className="space-y-8">
            {/* Membership Standing Card */}
            <MembershipStatusCard
              profile={profile}
              loading={loadingProfile}
              onRenewClick={() => setRenewModalOpen(true)}
              onViewCert={() => setCertModalOpen(true)}
            />

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

      {/* Membership Certificate & Tax Receipt Modal */}
      <MembershipCertificateModal
        open={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        member={profile}
      />

      {/* Renewal Modal */}
      <RenewModal
        open={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        profile={profile}
        onSuccess={fetchProfile}
      />

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
