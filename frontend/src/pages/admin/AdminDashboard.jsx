import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Bell,
  Search, DollarSign, Activity,
  CheckCircle2, XCircle, UserPlus,
  Mail, Tag, CreditCard, Banknote,
  TrendingUp, BarChart3, Filter, ArrowUpRight,
  ExternalLink, Layers, RefreshCw, Eye, X, CheckCircle,
  Building2, Phone, Sparkles
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

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
  in_review: { label: 'In Review', bg: 'bg-amber-100 text-amber-700' },
  approved:  { label: 'Approved',  bg: 'bg-emerald-100 text-emerald-700' },
  declined:  { label: 'Declined',  bg: 'bg-slate-100 text-slate-500' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [recentLog, setRecentLog] = useState([]);
  const [contactInquiries, setContactInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [markingInquiryId, setMarkingInquiryId] = useState(null);
  const [sponsorEnquiries, setSponsorEnquiries] = useState([]);
  const [selectedSponsorEnquiry, setSelectedSponsorEnquiry] = useState(null);
  const [updatingSponsorStatusId, setUpdatingSponsorStatusId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id of member being actioned

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
      const { data: auditRes } = await api.get('/admin/audit?limit=5');
      setRecentLog(auditRes.data || []);
    } catch (err) {
      console.error('Error fetching audit log:', err.response?.data || err.message);
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

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  useEffect(() => {
    fetchRevenueData(revenueTimeframe);
  }, [revenueTimeframe, fetchRevenueData]);

  const handleStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/members/${id}/status`, { status });
      // Remove from pending list immediately
      setPendingApps(prev => prev.filter(a => a.id !== id));
      // Refresh stats to reflect updated pending count
      const { data: statsRes } = await api.get('/admin/stats');
      setStatsData(statsRes.data);
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
    } catch (err) {
      console.error('Failed to update sponsor status:', err);
    } finally {
      setUpdatingSponsorStatusId(null);
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
              { label: 'Total Members',    value: statsData?.total_members || 0,           icon: Users,      color: 'text-teal-500',   bg: 'bg-teal-50',   badge: null },
              { label: 'Active Events',    value: statsData?.active_events || 0,           icon: Calendar,   color: 'text-amber-500',  bg: 'bg-amber-50',  badge: null },
              { label: 'Total Donations',  value: `$${statsData?.total_donations || 0}`,   icon: DollarSign, color: 'text-blue-500',   bg: 'bg-blue-50',   badge: null },
              { label: 'Pending Apps',     value: statsData?.pending_applications ?? pendingApps.length, icon: UserPlus, color: 'text-rose-500', bg: 'bg-rose-50', badge: (statsData?.pending_applications || pendingApps.length) > 0 ? 'rose' : null },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.badge === 'rose' && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider">Action needed</span>
                  )}
                </div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-3xl font-black text-slate-900">{loading ? '—' : stat.value}</p>
              </div>
            ))}
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
              const eventRev = Number(summary.event_revenue || 0);
              const donationRev = Number(summary.donation_revenue || 0);
              const pendingAmount = Number(summary.pending_amount || 0);

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
                        {summary.cash_transactions_count || 0} orders
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
                        {summary.card_transactions_count || 0} orders
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
              const maxVal = Math.max(...timeline.map(t => Number(t.total || 0)), 50);

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
                          const tot = Number(item.total || 0);
                          const cash = Number(item.cash || 0);
                          const card = Number(item.card || 0);
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
                    Revenue by Event ({revenueData?.events?.length || 0})
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
                    Revenue by Member Tier ({revenueData?.members?.length || 0})
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
                      {(revenueData?.events || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                            No event revenue recorded yet.
                          </td>
                        </tr>
                      ) : (
                        (revenueData?.events || []).map((ev) => (
                          <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-900">{ev.title}</div>
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
                              {ev.paid_count || 0} tickets
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
                                to={`/admin/events/${ev.id}`}
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
                  {(revenueData?.members || []).length === 0 ? (
                    <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                      No member tier revenue recorded yet.
                    </div>
                  ) : (
                    (revenueData?.members || []).map((m, idx) => {
                      const totalMemberRev = (revenueData?.members || []).reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0);
                      const pct = totalMemberRev > 0 ? Math.round((Number(m.total_revenue || 0) / totalMemberRev) * 100) : 0;

                      return (
                        <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-800">
                              {m.display_name}
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
                        <th className="px-5 py-3.5 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(revenueData?.recent_transactions || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                            No recent paid transactions found.
                          </td>
                        </tr>
                      ) : (
                        (revenueData?.recent_transactions || []).map((t, idx) => {
                          const isCash = t.payment_method === 'cash' || t.payment_method === 'at_door';
                          return (
                            <tr key={t.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{t.name || 'Anonymous'}</div>
                                <div className="text-[11px] text-slate-400">{t.email || '—'}</div>
                              </td>
                              <td className="px-5 py-3.5">
                                {t.type === 'event_registration' ? (
                                  <div>
                                    <span className="font-semibold text-slate-800">{t.event_title || 'Event Registration'}</span>
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
                                ${Number(t.amount || 0).toFixed(2)}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" /> Paid
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right text-slate-500 font-medium">
                                {t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
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
                  <Link to="/admin/members" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">
                    View All Members →
                  </Link>
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
                          onClick={() => setSelectedSponsorEnquiry(enquiry)}
                          className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center font-black shrink-0 transition-all text-sm group-hover:scale-105">
                              {enquiry.company_name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-slate-900 truncate">
                                  {enquiry.company_name}
                                </span>
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
                                setSelectedSponsorEnquiry(enquiry);
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
                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-500" /> Recent Actions
                </h2>
                <div className="space-y-6">
                  {loading ? (
                    <div className="text-center text-slate-500 text-sm">Loading activity...</div>
                  ) : recentLog.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm">No recent activity.</div>
                  ) : recentLog.map((log) => (
                    <div key={log.id} className="flex gap-4 relative">
                      <div className="w-px bg-slate-100 absolute left-2 top-8 bottom-[-24px] last:hidden" />
                      <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-800 leading-snug">
                          <span className="font-bold">{log.user_email || 'System'}</span> {log.action} <span className="font-bold text-teal-600">{log.target || ''}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-3 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
                  Full Audit History
                </button>
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
                    {['new', 'in_review', 'approved', 'declined'].map((st) => (
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
    </main>
  );
}
