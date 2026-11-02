import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Settings,
  Menu, X, LogOut, UserCog, Building2, Mail, History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE_SIDEBAR_ITEMS = [
  { name: 'Dashboard',         icon: LayoutDashboard, path: '/admin' },
  { name: 'Members',           icon: Users,           path: '/admin/members' },
  { name: 'Events',            icon: Calendar,        path: '/admin/events' },
  { name: 'Sponsors',          icon: Building2,       path: '/admin/sponsors' },
  { name: 'Contact Inquiries', icon: Mail,            path: '/admin/contact-inquiries' },
  { name: 'Change Logs',       icon: History,         path: '/admin/changelogs' },
  { name: 'Admin Accounts',    icon: UserCog,         path: '/admin/accounts' },
  { name: 'Settings',          icon: Settings,        path: '/admin/settings' },
];

/**
 * AdminLayout — sidebar layout wrapping all /admin/* routes.
 * Uses <Outlet /> for nested route content.
 */
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // All admins see the same sidebar items
  const sidebarItems = BASE_SIDEBAR_ITEMS;

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = () => {
      import('../api').then(({ default: api }) => {
        api.get('/members/me')
          .then(res => setProfile(res.data.data))
          .catch(err => console.error('Failed to load profile for admin sidebar', err));
      });
    };
    const fetchUnreadCount = () => {
      import('../api').then(({ default: api }) => {
        api.get('/admin/stats')
          .then(res => setUnreadCount(res.data.data?.unread_inquiries || 0))
          .catch(err => console.error('Failed to load unread inquiries count', err));
      });
    };
    fetchProfile();
    fetchUnreadCount();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, [location.pathname]);

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
          <Link to="/admin" className={`flex items-center gap-3 group ${!sidebarOpen && 'hidden'}`}>
            <img 
              src="/assets/new_logo.png" 
              alt="GST Logo" 
              className="w-8 h-8 object-contain drop-shadow shrink-0 group-hover:scale-105 transition-transform" 
            />
            <div>
              <div className="font-black text-sm tracking-tight leading-none text-white">GST ADMIN</div>
              <div className="text-[9px] text-teal-400 font-bold uppercase tracking-widest mt-1">Command Center</div>
            </div>
          </Link>
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
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'hidden'}`}>
              <div>
                <div className="text-white font-bold text-xs capitalize truncate w-32 group-hover:text-teal-400 transition-colors" title={displayName}>{displayName}</div>
                <div className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mt-0.5">Admin</div>
              </div>
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
            const isContactItem = item.path === '/admin/contact-inquiries';
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 group ${isActive
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-400'}`} />
                  <span className={!sidebarOpen ? 'hidden' : 'block'}>{item.name.toUpperCase()}</span>
                </div>
                {isContactItem && unreadCount > 0 && sidebarOpen && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                    isActive ? 'bg-white text-teal-700' : 'bg-teal-500/20 text-teal-400'
                  }`}>
                    {unreadCount}
                  </span>
                )}
                {isContactItem && unreadCount > 0 && !sidebarOpen && (
                  <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                )}
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
