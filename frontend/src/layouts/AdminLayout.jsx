import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Settings,
  Globe, Menu, X, LogOut, ShieldAlert, Mail
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

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = () => {
      import('../api').then(({ default: api }) => {
        api.get('/members/me')
          .then(res => setProfile(res.data.data))
          .catch(err => console.error('Failed to load profile for admin sidebar', err));
      });
    };
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : (user?.name || 'Admin');
  const displayInitial = displayName[0]?.toUpperCase() || 'A';
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=14b8a6`;

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

        {/* User profile card */}
        {sidebarOpen ? (
          <Link to="/admin/profile" className="mx-4 mt-4 flex items-center gap-3 bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-white/10 rounded-2xl p-3 transition-all group">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-9 h-9 rounded-xl object-cover animate-fade-in" />
            ) : (
              <img src={defaultAvatar} alt="Default Avatar" className="w-9 h-9 rounded-xl object-cover" />
            )}
            <div className="truncate">
              <div className="text-white font-bold text-xs capitalize truncate w-32 group-hover:text-teal-400 transition-colors" title={displayName}>{displayName}</div>
              <div className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mt-0.5">Admin Role</div>
            </div>
          </Link>
        ) : (
          <Link to="/admin/profile" className="mx-auto mt-4 flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-white/10 rounded-xl transition-all" title={displayName}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-7 h-7 rounded-lg object-cover animate-fade-in" />
            ) : (
              <span className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-[10px] font-black text-white">{displayInitial}</span>
            )}
          </Link>
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
