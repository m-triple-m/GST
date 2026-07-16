import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Settings,
  Globe, LogOut, Plus, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Items shown to ALL logged-in members
const memberItems = [
  { name: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Events',     icon: Calendar,        path: '/events' },
  { name: 'Settings',   icon: Settings,        path: '/dashboard/settings' },
];

// Extra items for executive + admin only
const executiveItems = [
  { name: 'Manage Events', icon: Calendar, path: '/dashboard/manage-events' },
  { name: 'All Members', icon: Users, path: '/dashboard/members' },
];

/**
 * DashboardLayout — sidebar layout wrapping all member /dashboard/* routes.
 * Uses <Outlet /> for nested route content.
 */
export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = () => {
      import('../api').then(({ default: api }) => {
        api.get('/members/me')
          .then(res => setProfile(res.data.data))
          .catch(err => console.error('Failed to load profile for dashboard header', err));
      });
    };
    fetchProfile();
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, []);

  const isExecutive = user?.role === 'executive' || user?.role === 'admin';
  const sidebarItems = isExecutive ? [...memberItems, ...executiveItems] : memberItems;

  const roleBadge = {
    admin:     { label: 'Admin',     cls: 'text-rose-500' },
    executive: { label: 'Executive', cls: 'text-amber-500' },
    member:    { label: 'Member',    cls: 'text-teal-500' },
  }[user?.role] ?? { label: user?.role, cls: 'text-slate-400' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : (user?.name || 'Member');
  const displayInitial = displayName[0]?.toUpperCase() || 'M';
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=14b8a6`;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-slate-900 font-black text-sm tracking-tight">GST</div>
              <div className="text-[9px] text-teal-500 font-bold uppercase tracking-widest">Member Portal</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <img src={defaultAvatar} alt="Default Avatar" className="w-9 h-9 rounded-xl object-cover" />
            )}
            <div>
              <div className="text-slate-900 font-bold text-sm capitalize truncate w-32" title={displayName}>{displayName}</div>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${roleBadge.cls}`}>{roleBadge.label}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 group ${
                activeTab === item.name
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.name ? 'text-white' : 'text-slate-400 group-hover:text-teal-500'}`} />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Schedule event shortcut — executive/admin only */}
        {isExecutive && (
          <div className="px-4 pb-4">
            <Link
              to="/dashboard/events/new"
              className="w-full flex items-center gap-2 justify-center px-4 py-3 rounded-xl text-xs font-bold bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all border border-teal-100"
            >
              <Plus className="w-4 h-4" />
              Schedule Event
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
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
