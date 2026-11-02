import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Bell,
  Search, DollarSign, Activity,
  CheckCircle2, XCircle, UserPlus,
  Mail, Tag, CreditCard, Banknote,
  TrendingUp, BarChart3, Filter, ArrowUpRight,
  ExternalLink, Layers, RefreshCw, Eye, X, CheckCircle,
  Building2, Phone, Sparkles,
  Clock3, ChevronLeft, ChevronRight, CalendarDays, Trash2,
  ShieldCheck, UserCheck, RotateCcw, SlidersHorizontal
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { gstToast } from '../../utils/toast';
import PaymentConfirmationModal from '../../components/modals/PaymentConfirmationModal';

const CONTACT_SUBJECTS = {
  membership: 'Membership Inquiry',
  events: 'Events & Sponsorship',
  speaking: 'Speaking Opportunity',
  scholarship: 'Student Scholarships',
  other: 'General Inquiry',
};

const SPONSOR_TIER_STYLES = {
  platinum: { label: 'Platinum', bg: 'bg-teal-100 text-teal-700 border-teal-200' },
  gold:     { label: 'Gold',     bg: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  silver:   { label: 'Silver',   bg: 'bg-slate-100 text-slate-700 border-slate-300' },
  bronze:   { label: 'Bronze',   bg: 'bg-amber-100 text-amber-700 border-amber-200' },
  custom:   { label: 'Custom',   bg: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const SPONSOR_STATUS_STYLES = {
  new:       { label: 'New',       bg: 'bg-rose-100 text-rose-700' },
  read:      { label: 'Read',      bg: 'bg-slate-100 text-slate-600' },
  in_review: { label: 'In Review', bg: 'bg-amber-100 text-amber-700' },
  approved:  { label: 'Approved',  bg: 'bg-emerald-100 text-emerald-700' },
  declined:  { label: 'Declined',  bg: 'bg-slate-100 text-slate-500' },
};

// ── Action label & icon mappings for Activity Log ─────────────────
const ACTION_DISPLAY = {
  MEMBER_STATUS_CHANGE:           { label: 'Member Status Changed',    color: 'text-teal-600',   bg: 'bg-teal-50 border-teal-100' },
  MEMBER_RENEWED:                 { label: 'Membership Renewed',       color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
  MEMBER_EXPIRATION_UPDATED:      { label: 'Expiration Updated',       color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
  MEMBER_EXECUTIVE_TOGGLED:       { label: 'Executive Status',         color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  MEMBER_PASSWORD_RESET:          { label: 'Password Reset',           color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  MEMBER_PROFILE_UPDATED:         { label: 'Profile Updated',          color: 'text-teal-600',   bg: 'bg-teal-50 border-teal-100' },
  MEMBER_DELETED:                 { label: 'Member Deleted',           color: 'text-rose-600',   bg: 'bg-rose-50 border-rose-100' },
  EVENT_CREATED:                  { label: 'Event Created',            color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-100' },
  EVENT_UPDATED:                  { label: 'Event Updated',            color: 'text-teal-600',   bg: 'bg-teal-50 border-teal-100' },
  EVENT_DELETED:                  { label: 'Event Deleted',            color: 'text-rose-600',   bg: 'bg-rose-50 border-rose-100' },
  PAYMENT_STATUS_UPDATED:         { label: 'Payment Confirmed',        color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-100' },
  SPONSOR_CREATED:                { label: 'Sponsor Added',            color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  SPONSOR_UPDATED:                { label: 'Sponsor Updated',          color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  SPONSOR_DELETED:                { label: 'Sponsor Removed',          color: 'text-rose-600',   bg: 'bg-rose-50 border-rose-100' },
  SPONSOR_REORDERED:              { label: 'Sponsors Reordered',       color: 'text-slate-600',  bg: 'bg-slate-100 border-slate-200' },
  SPONSOR_ENQUIRY_STATUS_UPDATED: { label: 'Enquiry Status Updated',   color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
  ADMIN_ACCOUNT_CREATED:          { label: 'Admin Account Created',    color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
};

function getActionDisplay(action) {
  return ACTION_DISPLAY[action] || { label: action.replace(/_/g, ' '), color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' };
}

function buildActivityDescription(log) {
  const meta = typeof log.meta === 'string' ? JSON.parse(log.meta || '{}') : (log.meta || {});
  switch (log.action) {
    case 'MEMBER_STATUS_CHANGE':
      return `Changed member #${meta.member_id || log.target?.replace('member:', '')} status to "${meta.new_status || '?'}"${meta.expires_at ? ` — expires ${meta.expires_at}` : ''}`;
    case 'MEMBER_RENEWED':
      return `Renewed membership for member #${meta.member_id || log.target?.replace('member:', '')} (${meta.months || 12} months)`;
    case 'MEMBER_EXPIRATION_UPDATED':
      return `Updated expiry for member #${meta.member_id || log.target?.replace('member:', '')} → ${meta.expires_at || '?'}`;
    case 'MEMBER_EXECUTIVE_TOGGLED':
      return meta.is_executive ? `Promoted member #${meta.member_id || log.target?.replace('member:', '')} to Executive` : `Removed Executive status from member #${meta.member_id || log.target?.replace('member:', '')}`;
    case 'MEMBER_PASSWORD_RESET':
      return `Reset password for member #${meta.member_id || log.target?.replace('member:', '')}`;
    case 'MEMBER_PROFILE_UPDATED':
      return `Updated profile for member #${meta.member_id || log.target?.replace('member:', '')}${meta.name ? ` (${meta.name})` : ''}`;
    case 'MEMBER_DELETED':
      return `Permanently deleted member #${meta.member_id || log.target?.replace('member:', '')}`;
    case 'EVENT_CREATED':
      return `Created event "${meta.title || '?'}"${meta.event_date ? ` — ${meta.event_date}` : ''}`;
    case 'EVENT_UPDATED':
      return `Updated event #${meta.event_id || log.target?.replace('event:', '')}${meta.title ? ` — "${meta.title}"` : ''}`;
    case 'EVENT_DELETED':
      return `Deleted event #${meta.event_id || log.target?.replace('event:', '')}`;
    case 'PAYMENT_STATUS_UPDATED':
      return `Marked registration #${meta.registration_id || log.target?.replace('registration:', '')} as "${meta.payment_status || '?'}"${meta.payment_method ? ` via ${meta.payment_method.replace('_', ' ')}` : ''}`;
    case 'SPONSOR_CREATED':
      return `Added sponsor "${meta.name || '?'}" (${meta.tier || 'bronze'} tier)`;
    case 'SPONSOR_UPDATED':
      return `Updated sponsor #${meta.sponsor_id || log.target?.replace('sponsor:', '')}${meta.name ? ` — "${meta.name}"` : ''}`;
    case 'SPONSOR_DELETED':
      return `Removed sponsor #${meta.sponsor_id || log.target?.replace('sponsor:', '')}`;
    case 'SPONSOR_ENQUIRY_STATUS_UPDATED':
      return `Updated sponsor enquiry #${meta.enquiry_id || log.target?.replace('sponsor_enquiry:', '')} → "${meta.status || '?'}"`;
    case 'SPONSOR_REORDERED':
      return 'Reordered sponsor display list';
    case 'ADMIN_ACCOUNT_CREATED':
      return `Created admin account for ${meta.email || '?'} (${meta.role || 'admin'})`;
    default:
      return log.action.replace(/_/g, ' ').toLowerCase();
  }
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [contactInquiries, setContactInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [markingInquiryId, setMarkingInquiryId] = useState(null);
  const [sponsorEnquiries, setSponsorEnquiries] = useState([]);
  const [selectedSponsorEnquiry, setSelectedSponsorEnquiry] = useState(null);
  const [updatingSponsorStatusId, setUpdatingSponsorStatusId] = useState(null);
  const [selectedPaymentReg, setSelectedPaymentReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id of member being actioned

  // ── Activity Log state ───────────────────────────────────
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPagination, setActivityPagination] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const [activityFilter, setActivityFilter] = useState('');
  const ACTIVITY_LIMIT = 15;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/members/me');
        setProfile(data.data);
      } catch (err) {
        console.error('Error fetching admin profile:', err);
      }
    };
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : (user?.name || 'Admin');
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=14b8a6`;

  const [revenueData, setRevenueData] = useState(null);
  const [revenueTimeframe, setRevenueTimeframe] = useState('all');
  const [revenueTab, setRevenueTab] = useState('events'); // 'events' | 'members' | 'transactions'
  const [revenueLoading, setRevenueLoading] = useState(false);

  const fetchRevenueData = useCallback(async (timeframe) => {
    try {
      setRevenueLoading(true);
      const tf = timeframe || revenueTimeframe;
      const res = await api.get(`/admin/revenue-analytics?timeframe=${tf}`);
      setRevenueData(res.data.data);
    } catch (err) {
      console.error('Error fetching revenue analytics:', err.response?.data || err.message);
    } finally {
      setRevenueLoading(false);
    }
  }, [revenueTimeframe]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: statsRes } = await api.get('/admin/stats');
      console.log('[AdminDashboard] raw stats response:', statsRes);
      setStatsData(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err.response?.data || err.message);
    }

    try {
      const { data: membersRes } = await api.get('/members?status=pending&limit=5');
      setPendingApps(membersRes.data || []);
    } catch (err) {
      console.error('Error fetching pending members:', err.response?.data || err.message);
    }

    try {
      const { data: contactRes } = await api.get('/contact/inquiries?limit=5');
      setContactInquiries(contactRes.data || []);
    } catch (err) {
      console.error('Error fetching contact inquiries:', err.response?.data || err.message);
    }

    try {
      const { data: sponsorRes } = await api.get('/sponsors/enquiries?limit=5');
      setSponsorEnquiries(sponsorRes.data || []);
    } catch (err) {
      console.error('Error fetching sponsor enquiries:', err.response?.data || err.message);
    }

    setLoading(false);
  };

  const fetchActivityLogs = useCallback(async (page = 1, filter = '') => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: ACTIVITY_LIMIT,
      });
      if (filter) params.append('action_filter', filter);
      const { data: res } = await api.get(`/admin/audit?${params}`);
      setActivityLogs(res.data || []);
      setActivityPagination(res.pagination || null);
    } catch (err) {
      console.error('Error fetching activity logs:', err.response?.data || err.message);
    } finally {
      setActivityLoading(false);
    }
  }, [ACTIVITY_LIMIT]);

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  useEffect(() => {
    fetchRevenueData(revenueTimeframe);
  }, [revenueTimeframe, fetchRevenueData]);

  useEffect(() => {
    fetchActivityLogs(activityPage, activityFilter);
  }, [activityPage, activityFilter, fetchActivityLogs]);

  const handleStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/members/${id}/status`, { status });
      // Remove from pending list immediately
      setPendingApps(prev => prev.filter(a => a.id !== id));
      // Refresh stats to reflect updated pending count
      const { data: statsRes } = await api.get('/admin/stats');
      setStatsData(statsRes.data);
      fetchActivityLogs(activityPage, activityFilter);
    } catch (err) {
      console.error(`Failed to ${status} member:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkInquiryAsRead = async (inquiry, e) => {
    if (e) e.stopPropagation();
    if (inquiry.is_read) return;
    setMarkingInquiryId(inquiry.id);
    try {
      await api.patch(`/contact/inquiries/${inquiry.id}/read`);
      setContactInquiries(prev => prev.map(item => item.id === inquiry.id ? { ...item, is_read: 1 } : item));
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry(prev => ({ ...prev, is_read: 1 }));
      }
      setStatsData(prev => prev ? { ...prev, unread_inquiries: Math.max(0, (prev.unread_inquiries || 1) - 1) } : prev);
    } catch (err) {
      console.error('Failed to mark inquiry as read:', err);
    } finally {
      setMarkingInquiryId(null);
    }
  };

  const handleUpdateSponsorStatus = async (id, status) => {
    setUpdatingSponsorStatusId(id);
    try {
      await api.patch(`/sponsors/enquiries/${id}/status`, { status });
      setSponsorEnquiries(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      if (selectedSponsorEnquiry?.id === id) {
        setSelectedSponsorEnquiry(prev => ({ ...prev, status }));
      }
      const { data: statsRes } = await api.get('/admin/stats');
      setStatsData(statsRes.data);
      fetchActivityLogs(activityPage, activityFilter);
    } catch (err) {
      console.error('Failed to update sponsor status:', err);
    } finally {
      setUpdatingSponsorStatusId(null);
    }
  };

  const handleOpenSponsorEnquiry = async (enquiry) => {
    setSelectedSponsorEnquiry(enquiry);
    if (enquiry.status === 'new') {
      // Optimistically update to read
      setSponsorEnquiries(prev => prev.map(item => item.id === enquiry.id ? { ...item, status: 'read' } : item));
      setSelectedSponsorEnquiry(prev => prev && prev.id === enquiry.id ? { ...prev, status: 'read' } : prev);
      setStatsData(prev => prev ? { ...prev, new_sponsor_enquiries: Math.max(0, (prev.new_sponsor_enquiries || 1) - 1) } : prev);

      try {
        await api.patch(`/sponsors/enquiries/${enquiry.id}/status`, { status: 'read' });
        fetchActivityLogs(activityPage, activityFilter);
      } catch (err) {
        console.error('Failed to update sponsor enquiry status to read:', err);
      }
    }
  };

  const handleConfirmAttendeePayment = async (regId, newStatus, paymentMethod, note) => {
    try {
      const payload = { payment_status: newStatus };
      if (paymentMethod) payload.payment_method = paymentMethod;
      if (note) payload.notes = note;
      await api.patch(`/events/registrations/${regId}/status`, payload);
      const methodLabel = paymentMethod === 'at_door' ? 'Cash' : (paymentMethod === 'card' ? 'Card' : (paymentMethod === 'comp' ? 'Complimentary' : paymentMethod));
      gstToast.success(`Payment confirmed (${methodLabel}).`);
      await fetchRevenueData(revenueTimeframe);
      await fetchDashboardData();
      fetchActivityLogs(activityPage, activityFilter);
    } catch (err) {
      console.error('Failed to confirm attendee payment:', err);
      gstToast.error(err.response?.data?.message || 'Failed to update payment status.');
      throw err;
    }
  };

  const stats = [
    { label: 'Total Members',  value: statsData?.total_members || 0,       change: '+12%', icon: Users,    color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'Total Donations', value: `$${statsData?.total_donations || 0}`, change: '+8%',  icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Events',  value: statsData?.active_events || 0,       change: '0%',   icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Pending Apps',   value: statsData?.pending_applications || pendingApps.length, change: `${pendingApps.length > 0 ? '+' : ''}${pendingApps.length}`, icon: UserPlus, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  return (
    <main className="flex-1 min-w-0 flex flex-col">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search members, transactions, or resources..." 
              className="bg-transparent border-none text-sm focus:ring-0 w-full text-slate-600 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Bell className="w-5 h-5" />
              {pendingApps.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <Link to="/admin/profile" className="flex items-center gap-3 group hover:opacity-85 transition-opacity">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-slate-900 group-hover:text-teal-600 transition-colors">{displayName}</div>
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Super Admin</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src={defaultAvatar} alt="avatar" className="w-full h-full object-cover" />
                )}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-8 space-y-8 animate-fade-in">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-slate-500 text-sm mt-1">Welcome back, here's what's happening with GST today.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-slate-400 transition-all">Download Report</button>
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg">System Update</button>
            </div>
          </div>

          {/* Stats Grid — Primary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Members',    value: statsData?.total_members || 0,           icon: Users,      color: 'text-teal-500',   bg: 'bg-teal-50',   badge: null, link: '/admin/members' },
              { label: 'Active Events',    value: statsData?.active_events || 0,           icon: Calendar,   color: 'text-amber-500',  bg: 'bg-amber-50',  badge: null, link: '/admin/events' },
              { label: 'Total Donations',  value: `${statsData?.total_donations || 0}`,   icon: DollarSign, color: 'text-blue-500',   bg: 'bg-blue-50',   badge: null },
              { label: 'Pending Apps',     value: statsData?.pending_applications ?? pendingApps.length, icon: UserPlus, color: 'text-rose-500', bg: 'bg-rose-50', badge: (statsData?.pending_applications || pendingApps.length) > 0 ? 'rose' : null, link: '/admin/members?status=pending' },
            ].map((stat) => {
              const cardInner = (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {stat.badge === 'rose' && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider">Action needed</span>
                      )}
                      {stat.link && (
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                  <p className="text-3xl font-black text-slate-900">{loading ? '—' : stat.value}</p>
                </div>
              );

              return stat.link ? (
                <Link key={stat.label} to={stat.link} className="block transition-transform active:scale-[0.98]">
                  {cardInner}
                </Link>
              ) : (
                <div key={stat.label}>{cardInner}</div>
              );
            })}
          </div>

          {/* Stats Grid — Secondary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Event Registrations', value: statsData?.total_registrations || 0, icon: Users,     color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Total sign-ups across all events' },
              { label: 'Unread Inquiries',    value: statsData?.unread_inquiries || 0,    icon: Mail,      color: 'text-teal-500',   bg: 'bg-teal-50',   desc: 'Contact messages awaiting review' },
              { label: 'Sponsor Enquiries',   value: statsData?.new_sponsor_enquiries || 0, icon: Tag,   color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'New sponsorship requests' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{loading ? '—' : stat.value}</p>
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Revenue Analytics & Financial Monitoring Section ── */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Header with Title & Timeframe Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      Revenue &amp; Cash Monitoring
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        Live Analytics
                      </span>
                    </h2>
                  </div>
                </div>
                <p className="text-xs text-slate-500 pl-11">
                  Track revenue streams, cash vs card collections, member tier monetization, and event performance.
                </p>
              </div>

              {/* Timeframe selector & Refresh */}
              <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                  {[
                    { id: '30d', label: '30 Days' },
                    { id: '90d', label: '90 Days' },
                    { id: '6m',  label: '6 Months' },
                    { id: '1y',  label: '1 Year' },
                    { id: 'all', label: 'All Time' },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => setRevenueTimeframe(tf.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        revenueTimeframe === tf.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => fetchRevenueData(revenueTimeframe)}
                  disabled={revenueLoading}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                  title="Refresh revenue data"
                >
                  <RefreshCw className={`w-4 h-4 ${revenueLoading ? 'animate-spin text-teal-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Revenue KPI Cards */}
            {(() => {
              const summary = revenueData?.summary || {};
              const totalRev = Number(summary.total_revenue || 0);
              const cashRev = Number(summary.cash_revenue || 0);
              const cardRev = Number(summary.card_revenue || 0);
              const eventRev = Number(summary.events_revenue || summary.event_revenue || 0);
              const donationRev = Number(summary.donations_revenue || summary.donation_revenue || 0);
              const pendingAmount = Number(summary.pending_amount || summary.pending_revenue || 0);

              const cashPct = totalRev > 0 ? Math.round((cashRev / totalRev) * 100) : 0;
              const cardPct = totalRev > 0 ? Math.round((cardRev / totalRev) * 100) : 0;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Gross Total Revenue */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-widest">Total Gross Revenue</span>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      ${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium pt-1">
                      <span className="text-emerald-400 font-bold">${eventRev.toFixed(0)}</span> events ·{' '}
                      <span className="text-blue-400 font-bold">${donationRev.toFixed(0)}</span> donations
                    </div>
                  </div>

                  {/* Cash / At-Door Revenue */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between text-emerald-800">
                      <span className="text-[10px] font-black uppercase tracking-widest">Cash / Pay at Door</span>
                      <Banknote className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                      ${cashRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 pt-1">
                      <span>{cashPct}% of total revenue</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-black">
                        {summary.cash_transactions_count || summary.paid_bookings_count || 0} orders
                      </span>
                    </div>
                  </div>

                  {/* Card / Online Revenue */}
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between text-blue-800">
                      <span className="text-[10px] font-black uppercase tracking-widest">Online / Card</span>
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-950">
                      ${cardRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-blue-700 pt-1">
                      <span>{cardPct}% of total revenue</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800 text-[10px] font-black">
                        {summary.card_transactions_count || summary.completed_donations_count || 0} orders
                      </span>
                    </div>
                  </div>

                  {/* Pending Receivables */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center justify-between text-amber-800">
                      <span className="text-[10px] font-black uppercase tracking-widest">Pending Receivables</span>
                      <DollarSign className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-950">
                      ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] font-semibold text-amber-700 pt-1 flex items-center justify-between">
                      <span>Awaiting collection / mark paid</span>
                      <span className="text-amber-800 font-black">Unpaid</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Monthly Trend Timeline Visual */}
            {(() => {
              const timeline = revenueData?.timeline || [];
              const maxVal = Math.max(...timeline.map(t => Number(t.total_revenue || t.total || 0)), 50);

              return (
                <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        Monthly Revenue Velocity &amp; Cash / Card Mix
                      </h3>
                      <p className="text-[11px] text-slate-400">Monthly breakdown of gross revenue generated</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Cash / Door
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Card / Online
                      </span>
                    </div>
                  </div>

                  {timeline.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                      No revenue data recorded for this timeframe.
                    </div>
                  ) : (
                    <div className="pt-4">
                      <div className="flex items-end justify-between h-36 gap-2 sm:gap-4 px-2">
                        {timeline.map((item, idx) => {
                          const tot = Number(item.total_revenue || item.total || 0);
                          const cash = Number(item.cash_revenue || item.cash || 0);
                          const card = Number(item.card_revenue || item.card || 0);
                          const heightPct = Math.max((tot / maxVal) * 100, 4);
                          const cashPctOfBar = tot > 0 ? (cash / tot) * 100 : 0;
                          const cardPctOfBar = tot > 0 ? (card / tot) * 100 : 0;

                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                              {/* Hover tooltip */}
                              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                                <div className="text-emerald-300 font-black">${tot.toFixed(2)} Total</div>
                                <div className="text-slate-300 text-[9px]">
                                  Cash: ${cash.toFixed(0)} | Card: ${card.toFixed(0)}
                                </div>
                              </div>

                              {/* Stacked / Gradient Bar */}
                              <div
                                className="w-full max-w-[40px] rounded-t-lg overflow-hidden flex flex-col-reverse transition-all group-hover:scale-105"
                                style={{ height: `${heightPct}%` }}
                              >
                                <div className="bg-emerald-400 transition-all" style={{ height: `${cashPctOfBar}%` }} />
                                <div className="bg-blue-400 transition-all" style={{ height: `${cardPctOfBar}%` }} />
                              </div>

                              {/* Month Label */}
                              <span className="text-[10px] font-bold text-slate-400 mt-2 block text-center truncate w-full">
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Drilldown Sub-Views: Tabs */}
            <div className="space-y-4 pt-2">
              
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRevenueTab('events')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      revenueTab === 'events'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Revenue by Event ({revenueData?.events_breakdown?.length || revenueData?.events?.length || 0})
                  </button>

                  <button
                    onClick={() => setRevenueTab('members')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      revenueTab === 'members'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Revenue by Member Tier ({revenueData?.member_tiers?.length || revenueData?.members?.length || 0})
                  </button>

                  <button
                    onClick={() => setRevenueTab('transactions')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      revenueTab === 'transactions'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Recent Transactions ({revenueData?.recent_transactions?.length || 0})
                  </button>

                  <button
                    onClick={() => setRevenueTab('pending_payments')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      revenueTab === 'pending_payments'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    Pending Attendee Payments ({revenueData?.pending_registrations?.length || 0})
                    {(revenueData?.pending_registrations?.length || 0) > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content: Revenue By Events */}
              {revenueTab === 'events' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5">Event Name</th>
                        <th className="px-5 py-3.5">Event Date</th>
                        <th className="px-5 py-3.5">Paid Orders</th>
                        <th className="px-5 py-3.5">Cash / Door</th>
                        <th className="px-5 py-3.5">Card / Online</th>
                        <th className="px-5 py-3.5">Total Revenue</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(revenueData?.events_breakdown || revenueData?.events || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                            No event revenue recorded yet.
                          </td>
                        </tr>
                      ) : (
                        (revenueData?.events_breakdown || revenueData?.events || []).map((ev) => (
                          <tr key={ev.event_id || ev.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-900">{ev.event_title || ev.title}</div>
                              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                ev.status === 'past' ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-700'
                              }`}>
                                {ev.status || 'Upcoming'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 font-medium">
                              {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-700">
                              {ev.paid_orders || ev.paid_count || 0} tickets
                            </td>
                            <td className="px-5 py-3.5 text-emerald-700 font-bold">
                              ${Number(ev.cash_revenue || 0).toFixed(2)}
                            </td>
                            <td className="px-5 py-3.5 text-blue-700 font-bold">
                              ${Number(ev.card_revenue || 0).toFixed(2)}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-black text-slate-900 text-sm">
                                ${Number(ev.total_revenue || 0).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Link
                                to={`/admin/events/${ev.event_id || ev.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] transition-all"
                              >
                                Details <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab Content: Revenue By Member Tier */}
              {revenueTab === 'members' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(revenueData?.member_tiers || revenueData?.members || []).length === 0 ? (
                    <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                      No member tier revenue recorded yet.
                    </div>
                  ) : (
                    (revenueData?.member_tiers || revenueData?.members || []).map((m, idx) => {
                      const tierList = revenueData?.member_tiers || revenueData?.members || [];
                      const totalMemberRev = tierList.reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0);
                      const pct = totalMemberRev > 0 ? Math.round((Number(m.total_revenue || 0) / totalMemberRev) * 100) : 0;

                      return (
                        <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-800">
                              {m.tier || m.display_name || 'Unknown'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {m.paid_count} order{m.paid_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div>
                            <div className="text-2xl font-black text-slate-900">
                              ${Number(m.total_revenue || 0).toFixed(2)}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {pct}% of member event revenue
                            </p>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab Content: Recent Transactions */}
              {revenueTab === 'transactions' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5">Payer / Contact</th>
                        <th className="px-5 py-3.5">Source / Purpose</th>
                        <th className="px-5 py-3.5">Payment Method</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Date / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(revenueData?.recent_transactions || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                            No recent transactions found.
                          </td>
                        </tr>
                      ) : (
                        (revenueData?.recent_transactions || []).map((t, idx) => {
                          const isCash = t.payment_method === 'cash' || t.payment_method === 'at_door';
                          const isPending = t.payment_status === 'pending';
                          return (
                            <tr key={t.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{t.attendee_name || t.name || 'Anonymous'}</div>
                                <div className="text-[11px] text-slate-400">{t.attendee_email || t.email || '—'}</div>
                              </td>
                              <td className="px-5 py-3.5">
                                {t.type === 'event_registration' || t.type === 'event_ticket' ? (
                                  <div>
                                    <span className="font-semibold text-slate-800">{t.source_title || t.event_title || 'Event Registration'}</span>
                                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Event Ticket</span>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-semibold text-blue-700">GST Donation</span>
                                    {t.note && <span className="block text-[10px] text-slate-400 truncate max-w-xs">{t.note}</span>}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isCash
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {isCash ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                  {isCash ? 'Cash / Door' : (t.payment_method || 'Card')}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 font-black text-slate-900 text-sm">
                                ${Number(t.amount_paid || t.amount || 0).toFixed(2)}
                              </td>
                              <td className="px-5 py-3.5">
                                {isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    <Clock3 className="w-3 h-3" /> Pending
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                {isPending ? (
                                  <button
                                    onClick={() => setSelectedPaymentReg({
                                      id: t.id,
                                      attendee_name: t.attendee_name || t.name,
                                      attendee_email: t.attendee_email || t.email,
                                      event_title: t.source_title || t.event_title,
                                      amount_paid: t.amount_paid || t.amount,
                                      payment_method: t.payment_method,
                                      attendee_type: t.attendee_type,
                                    })}
                                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                                  >
                                    <DollarSign className="w-3 h-3 text-emerald-600" />
                                    Confirm
                                  </button>
                                ) : (
                                  <span className="text-slate-500 font-medium">
                                    {t.transaction_date || t.date ? new Date(t.transaction_date || t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab Content: Pending Attendee Payments */}
              {revenueTab === 'pending_payments' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5">Attendee / Contact</th>
                        <th className="px-5 py-3.5">Event Name</th>
                        <th className="px-5 py-3.5">Attendee Type</th>
                        <th className="px-5 py-3.5">Amount Due</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(revenueData?.pending_registrations || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                            <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700 text-sm">All caught up! No pending attendee payments.</p>
                            <p className="text-xs text-slate-400 mt-0.5">All event tickets and participant fees have been collected.</p>
                          </td>
                        </tr>
                      ) : (
                        (revenueData?.pending_registrations || []).map((r) => {
                          const guests = Array.isArray(r.guests) ? r.guests : [];
                          return (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{r.attendee_name}</div>
                                <div className="text-[11px] text-slate-400">{r.attendee_email || '—'}</div>
                                {r.company && <div className="text-[10px] text-slate-500 font-semibold">{r.company}</div>}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-800">{r.event_title}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {r.event_date ? new Date(r.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                                  {r.attendee_type || 'Member'}
                                </span>
                                {guests.length > 0 && (
                                  <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                                    +{guests.length} Guest{guests.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5 font-black text-slate-900 text-sm">
                                ${Number(r.amount_paid || 0).toFixed(2)}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                  <Clock3 className="w-3 h-3" /> Pending
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => setSelectedPaymentReg(r)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>Confirm Payment</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left: Pending Applications + Chart */}
            <div className="lg:col-span-2 space-y-6">

              {/* Pending Applications */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-slate-900">Pending Applications</h2>
                    {pendingApps.length > 0 && (
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-600 rounded-full text-xs font-black">
                        {pendingApps.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to="/admin/members?status=pending" className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors">
                      Review Pending →
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link to="/admin/members" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">
                      View All Members →
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {loading ? (
                    /* Skeleton */
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-8 py-5 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-3.5 bg-slate-200 rounded w-32" />
                            <div className="h-3 bg-slate-200 rounded w-20" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                        </div>
                      </div>
                    ))
                  ) : pendingApps.length === 0 ? (
                    <div className="px-8 py-10 text-center">
                      <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm font-medium">All caught up! No pending applications.</p>
                    </div>
                  ) : (
                    pendingApps.map((app) => (
                      <div key={app.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-all text-sm">
                            {app.first_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{app.first_name} {app.last_name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {app.member_type || 'Standard'} · {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className="text-xs font-semibold text-slate-500 truncate max-w-[140px]">{app.email}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusChange(app.id, 'active')}
                              disabled={actionLoading === app.id}
                              title="Approve"
                              className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              disabled={actionLoading === app.id}
                              title="Reject"
                              className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Contact Inquiries */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        Recent Contact Inquiries
                        {contactInquiries.filter(i => !i.is_read).length > 0 && (
                          <span className="px-2.5 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-black">
                            {contactInquiries.filter(i => !i.is_read).length} new
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>
                  <Link to="/admin/contact-inquiries" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 group">
                    View All Inquiries <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-8 py-5 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-3.5 bg-slate-200 rounded w-32" />
                            <div className="h-3 bg-slate-200 rounded w-48" />
                          </div>
                        </div>
                        <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                      </div>
                    ))
                  ) : contactInquiries.length === 0 ? (
                    <div className="px-8 py-10 text-center">
                      <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm font-medium">No contact inquiries yet.</p>
                    </div>
                  ) : (
                    contactInquiries.map((inquiry) => (
                      <div 
                        key={inquiry.id} 
                        onClick={() => {
                          setSelectedInquiry(inquiry);
                          if (!inquiry.is_read) handleMarkInquiryAsRead(inquiry);
                        }}
                        className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-all text-sm ${
                            !inquiry.is_read 
                              ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20' 
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}>
                            {inquiry.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${!inquiry.is_read ? 'text-slate-900 font-extrabold' : 'text-slate-700 font-bold'}`}>
                                {inquiry.name}
                              </span>
                              {!inquiry.is_read && (
                                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                              )}
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                {CONTACT_SUBJECTS[inquiry.subject] || inquiry.subject || 'Inquiry'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {inquiry.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
                            {new Date(inquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInquiry(inquiry);
                              if (!inquiry.is_read) handleMarkInquiryAsRead(inquiry);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Sponsor Enquiries */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        Recent Sponsor Enquiries
                        {sponsorEnquiries.filter(s => s.status === 'new').length > 0 && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-black">
                            {sponsorEnquiries.filter(s => s.status === 'new').length} new
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>
                  <Link to="/admin/sponsors" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 group">
                    Manage Sponsors &amp; Enquiries <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-8 py-5 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-3.5 bg-slate-200 rounded w-32" />
                            <div className="h-3 bg-slate-200 rounded w-48" />
                          </div>
                        </div>
                        <div className="h-8 w-20 bg-slate-200 rounded-lg" />
                      </div>
                    ))
                  ) : sponsorEnquiries.length === 0 ? (
                    <div className="px-8 py-10 text-center">
                      <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm font-medium">No sponsor enquiries yet.</p>
                    </div>
                  ) : (
                    sponsorEnquiries.map((enquiry) => {
                      const tierStyle = SPONSOR_TIER_STYLES[enquiry.tier_interest?.toLowerCase()] || SPONSOR_TIER_STYLES.custom;
                      const statusStyle = SPONSOR_STATUS_STYLES[enquiry.status] || SPONSOR_STATUS_STYLES.new;
                      return (
                        <div 
                          key={enquiry.id} 
                          onClick={() => handleOpenSponsorEnquiry(enquiry)}
                          className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-black shrink-0 transition-all text-sm group-hover:scale-105">
                              {enquiry.company_name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm truncate ${enquiry.status === 'new' ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                  {enquiry.company_name}
                                </span>
                                {enquiry.status === 'new' && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="New unread enquiry" />
                                )}
                                <span className="text-xs text-slate-400 font-medium">
                                  · {enquiry.contact_name}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierStyle.bg} shrink-0`}>
                                  {enquiry.tier_interest || 'Custom'}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyle.bg} shrink-0`}>
                                  {statusStyle.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {enquiry.message || 'No additional message provided.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
                              {new Date(enquiry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSponsorEnquiry(enquiry);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Membership Growth Chart */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden h-80">
                <div className="absolute inset-0 seismic-pattern opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black">Membership Growth</h2>
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-teal-500 rounded-full text-[9px] font-bold uppercase">6 Months</span>
                    </div>
                  </div>
                  {(() => {
                    const rawData = statsData?.membership_growth || [];
                    const months = [];
                    const now = new Date();
                    for (let i = 5; i >= 0; i--) {
                      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                      const label = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                      const found = rawData.find(r => r.month === monthStr);
                      months.push({ label, count: found ? found.count : 0 });
                    }
                    const maxCount = Math.max(...months.map(m => m.count), 10);
                    
                    return (
                      <>
                        <div className="flex items-end justify-between h-32 gap-3 mt-8">
                          {months.map((m, i) => (
                            <div key={i} className="flex-1 bg-teal-500/30 rounded-t-lg group relative hover:bg-teal-500 transition-all" style={{ height: `${Math.max((m.count / maxCount) * 100, 2)}%` }}>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                +{m.count}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          {months.map((m, i) => <span key={i} className="w-full text-center">{m.label}</span>)}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right: Audit Log / System Status */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-500" /> Recent Actions
                  </h2>
                  <Link 
                    to="/admin/changelogs"
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {activityLoading && activityLogs.length === 0 ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-100 rounded w-3/4" />
                            <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-6">
                      <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs font-medium">No actions logged yet.</p>
                    </div>
                  ) : (
                    activityLogs.slice(0, 5).map((log) => {
                      const display = getActionDisplay(log.action);
                      const desc = buildActivityDescription(log);
                      return (
                        <div key={log.id} className="flex gap-3 text-left group">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border ${display.bg} ${display.color}`}>
                            {log.actor_name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {log.actor_name || log.actor_email}
                              </span>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {log.actor_role || 'admin'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-snug mt-0.5 font-medium line-clamp-2">
                              {desc}
                            </p>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                              {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Link 
                  to="/admin/changelogs"
                  className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 text-xs font-bold rounded-xl transition-all border border-slate-100 flex items-center justify-center gap-1.5"
                >
                  <span>Explore Full Change Log</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-teal-600 rounded-[2.5rem] p-8 text-white">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4">System Status</h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/5">
                     <span className="text-xs font-bold">Web Server</span>
                     <span className="px-2 py-0.5 bg-green-500 rounded text-[8px] font-black uppercase">Online</span>
                   </div>
                   <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/5">
                     <span className="text-xs font-bold">Member Database</span>
                     <span className="px-2 py-0.5 bg-green-500 rounded text-[8px] font-black uppercase">Healthy</span>
                   </div>
                   <div className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/5">
                     <span className="text-xs font-bold">API Gateway</span>
                     <span className="px-2 py-0.5 bg-green-500 rounded text-[8px] font-black uppercase">Active</span>
                   </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Admin & Executive Activity / Change Log Section ── */}
          <div id="change-logs-section" className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      Admin &amp; Executive Change Logs
                      {activityPagination?.total ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-600">
                          {activityPagination.total} Total
                        </span>
                      ) : null}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Full audit trail of administrative actions, member updates, sponsor changes, and event management
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchActivityLogs(activityPage, activityFilter)}
                  disabled={activityLoading}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50"
                  title="Refresh Logs"
                >
                  <RefreshCw className={`w-4 h-4 ${activityLoading ? 'animate-spin text-teal-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-8 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: '',               label: 'All Logs' },
                { id: 'MEMBER',         label: 'Members' },
                { id: 'EVENT',          label: 'Events' },
                { id: 'SPONSOR',        label: 'Sponsors' },
                { id: 'PAYMENT',        label: 'Payments' },
                { id: 'ADMIN_ACCOUNT',  label: 'Admin Accounts' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setActivityFilter(f.id);
                    setActivityPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activityFilter === f.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Logs List / Table */}
            <div className="divide-y divide-slate-100">
              {activityLoading && activityLogs.length === 0 ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100" />
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded w-48" />
                          <div className="h-3 bg-slate-100 rounded w-72" />
                        </div>
                      </div>
                      <div className="h-4 bg-slate-100 rounded w-28" />
                    </div>
                  ))}
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-bold text-sm">No activity logs found</p>
                  <p className="text-slate-400 text-xs mt-1">Actions performed by admins or executive members will appear here.</p>
                </div>
              ) : (
                activityLogs.map((log) => {
                  const display = getActionDisplay(log.action);
                  const desc = buildActivityDescription(log);
                  return (
                    <div key={log.id} className="px-8 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shrink-0 text-sm border shadow-sm ${display.bg} ${display.color}`}>
                          {log.actor_name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-slate-900">
                              {log.actor_name || log.actor_email}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              log.actor_role === 'executive' 
                                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {log.actor_role || 'Admin'}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${display.bg} ${display.color}`}>
                              {display.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                            {desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        {log.target && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 hidden sm:inline-block">
                            {log.target}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                          <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination footer */}
            {activityPagination && activityPagination.pages > 1 && (
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Page <strong className="text-slate-800">{activityPagination.page}</strong> of <strong className="text-slate-800">{activityPagination.pages}</strong> ({activityPagination.total} entries)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                    disabled={activityPage <= 1 || activityLoading}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => setActivityPage(p => Math.min(activityPagination.pages, p + 1))}
                    disabled={activityPage >= activityPagination.pages || activityLoading}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Inquiry Detail Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900">{selectedInquiry.name}</h3>
                    {selectedInquiry.is_read ? (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">Read</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-bold">New</span>
                    )}
                  </div>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-xs text-teal-600 font-semibold hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                <button 
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Topic</span>
                    <span className="text-xs font-bold text-slate-800">
                      {CONTACT_SUBJECTS[selectedInquiry.subject] || selectedInquiry.subject || 'General'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Received</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(selectedInquiry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Message Body</span>
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100 max-h-60 overflow-y-auto">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link 
                  to="/admin/contact-inquiries"
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Open in Inquiries Inbox →
                </Link>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${CONTACT_SUBJECTS[selectedInquiry.subject] || selectedInquiry.subject || 'GST Inquiry'}`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sponsor Enquiry Detail Modal */}
        {selectedSponsorEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900">{selectedSponsorEnquiry.company_name}</h3>
                    {(() => {
                      const sStyle = SPONSOR_STATUS_STYLES[selectedSponsorEnquiry.status] || SPONSOR_STATUS_STYLES.new;
                      return (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${sStyle.bg}`}>
                          {sStyle.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Contact: <span className="font-bold text-slate-800">{selectedSponsorEnquiry.contact_name}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedSponsorEnquiry(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Status Switcher Toolbar */}
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Change Status</span>
                  <div className="flex items-center gap-1.5">
                    {['new', 'read', 'in_review', 'approved', 'declined'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateSponsorStatus(selectedSponsorEnquiry.id, st)}
                        disabled={updatingSponsorStatusId === selectedSponsorEnquiry.id || selectedSponsorEnquiry.status === st}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          selectedSponsorEnquiry.status === st
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Tier Interest</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {selectedSponsorEnquiry.tier_interest || 'Custom'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Received</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(selectedSponsorEnquiry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email Address</span>
                    <a href={`mailto:${selectedSponsorEnquiry.email}`} className="text-xs font-bold text-teal-600 hover:underline truncate block">
                      {selectedSponsorEnquiry.email}
                    </a>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Phone Number</span>
                    {selectedSponsorEnquiry.phone ? (
                      <a href={`tel:${selectedSponsorEnquiry.phone}`} className="text-xs font-bold text-slate-800 hover:text-teal-600">
                        {selectedSponsorEnquiry.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Not provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Enquiry Message</span>
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100 max-h-48 overflow-y-auto">
                    {selectedSponsorEnquiry.message || 'No additional message was included in this enquiry.'}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link 
                  to="/admin/sponsors"
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Manage All Sponsors →
                </Link>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedSponsorEnquiry.email}?subject=GST Sponsorship Partnership - ${selectedSponsorEnquiry.company_name}`}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Payment Confirmation Modal ── */}
        {selectedPaymentReg && (
          <PaymentConfirmationModal
            isOpen={!!selectedPaymentReg}
            registration={selectedPaymentReg}
            onClose={() => setSelectedPaymentReg(null)}
            onConfirm={handleConfirmAttendeePayment}
          />
        )}
    </main>
  );
}
