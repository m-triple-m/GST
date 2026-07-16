import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Bell,
  Search, DollarSign, Activity,
  CheckCircle2, XCircle, UserPlus,
  Mail, Tag
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [recentLog, setRecentLog] = useState([]);
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

    setLoading(false);
  };

  useEffect(() => { fetchDashboardData(); }, []);

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
    </main>
  );
}
