import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Bell,
  Search, DollarSign, UserPlus, ArrowUpRight,
  CheckCircle2, XCircle, Activity
} from 'lucide-react';

const stats = [
  { label: 'Total Members', value: '542', change: '+12%', icon: Users, color: 'text-teal-500', bg: 'bg-teal-50' },
  { label: 'Event Revenue', value: '$4,250', change: '+8%', icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Active Events', value: '8', change: '0%', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Pending Apps', value: '14', change: '+3', icon: UserPlus, color: 'text-rose-500', bg: 'bg-rose-50' },
];

const pendingApplications = [
  { id: 1, name: 'Sarah Miller', type: 'Professional', date: '2h ago', status: 'Pending' },
  { id: 2, name: 'David Chen', type: 'Student', date: '5h ago', status: 'Pending' },
  { id: 3, name: 'Robert Wilson', type: 'Corporate', date: '1d ago', status: 'In Review' },
];

const recentActivity = [
  { id: 1, user: 'Admin_John', action: 'Approved membership', target: 'Elena R.', time: '10m ago' },
  { id: 2, user: 'System', action: 'Auto-archived event', target: 'Spring Workshop', time: '1h ago' },
  { id: 3, user: 'Admin_Sarah', action: 'Uploaded resource', target: 'Basin_Analysis.pdf', time: '3h ago' },
];

export default function AdminDashboard() {
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
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-slate-900">Admin_User</div>
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Super Admin</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80" alt="avatar" />
              </div>
            </div>
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-teal-600' : 'text-slate-400'}`}>{stat.change}</span>
                </div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left: Pending Applications */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900">Pending Applications</h2>
                  <Link to="/admin/members" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">View All Directory →</Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {pendingApplications.map((app) => (
                    <div key={app.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-all">
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{app.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.type} Membership</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-bold text-slate-700">{app.status}</div>
                          <div className="text-[10px] text-slate-400">{app.date}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-500 hover:text-white transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                          <button className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><XCircle className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart/Activity Placeholder */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden h-80">
                <div className="absolute inset-0 seismic-pattern opacity-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black">Membership Growth</h2>
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-bold uppercase">Weekly</span>
                       <span className="px-3 py-1 bg-teal-500 rounded-full text-[9px] font-bold uppercase">Monthly</span>
                    </div>
                  </div>
                  {/* Mock Chart Visual */}
                  <div className="flex items-end justify-between h-32 gap-2 mt-8">
                    {[35, 45, 30, 60, 40, 80, 50, 70, 90, 65, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-teal-500/30 rounded-t-lg group relative hover:bg-teal-500 transition-all" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {h*10}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span>
                  </div>
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
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex gap-4 relative">
                      <div className="w-px bg-slate-100 absolute left-2 top-8 bottom-[-24px] last:hidden" />
                      <div className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-800 leading-snug">
                          <span className="font-bold">{log.user}</span> {log.action} <span className="font-bold text-teal-600">{log.target}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">{log.time}</p>
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
