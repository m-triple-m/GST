import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Settings,
  Globe, Menu, X, LogOut, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Members',   icon: Users,           path: '/admin/members' },
  { name: 'Events',    icon: Calendar,        path: '/admin/events' },
  { name: 'Settings',  icon: Settings,        path: '/admin/settings' },
];

/**
 * AdminLayout — sidebar layout wrapping all /admin/* routes.
 * Uses <Outlet /> for nested route content.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950 text-white transition-all duration-300 flex flex-col sticky top-0 h-screen z-30`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-sm tracking-tight leading-none">GST ADMIN</div>
              <div className="text-[9px] text-teal-400 font-bold uppercase tracking-widest mt-1">Command Center</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="mx-4 mt-4 flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-xl px-3 py-2">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
              {user?.name || 'Admin'}
            </span>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 group ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-400'}`} />
                <span className={!sidebarOpen ? 'hidden' : 'block'}>{item.name.toUpperCase()}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-4 h-4" />
            <span className={!sidebarOpen ? 'hidden' : 'block'}>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* ── Page Content ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
