import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Shield, Archive, Bell, Settings, Loader2
} from 'lucide-react';
import api from '../../api';

const sidebarItems = [
  { name: 'DASHBOARD', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'EXECUTIVE BOARD', icon: Users, path: '/executive', active: true },
  { name: 'MEMBER DIRECTORY', icon: Users, path: '/membership' },
  { name: 'GOVERNANCE', icon: Shield, path: '#' },
  { name: 'ARCHIVES', icon: Archive, path: '#' },
];

export default function ExecutiveBoardPage() {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const { data } = await api.get('/members/executive');
        setExecutives(data.data || []);
      } catch (err) {
        console.error('Failed to fetch executives', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutives();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="w-64 border-r border-teal-500/20 flex flex-col fixed left-0 top-16 bottom-0 bg-slate-900/80 backdrop-blur-xl">
        <div className="p-8 border-b border-teal-500/20">
          <span className="text-xs font-bold tracking-[0.25em] text-teal-400 uppercase">Platform</span>
          <div className="text-[10px] text-slate-500 mt-1 tracking-widest">V1.0.4</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold tracking-widest transition-all duration-200 rounded-lg ${
                item.active
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 ml-64">

        {/* Local sub-nav */}
        <div className="px-12 py-5 border-b border-teal-500/20 flex items-center justify-between sticky top-16 bg-slate-950/90 backdrop-blur-xl z-10">
          <div className="flex items-center gap-8">
            {['NETWORK', 'EVENTS', 'RESOURCES'].map(item => (
              <Link key={item} to="#" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-teal-400 transition-colors">{item}</Link>
            ))}
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border-b border-teal-500 pb-1">LEADERSHIP</span>
          </div>
          <div className="flex items-center gap-5">
            <button className="text-slate-500 hover:text-teal-400 transition-colors"><Bell className="w-4 h-4" /></button>
            <button className="text-slate-500 hover:text-teal-400 transition-colors"><Settings className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-12 max-w-5xl">

          {/* Page heading */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-teal-500/20" />
              <span className="text-[10px] font-bold text-teal-500 tracking-[0.3em] uppercase">GST // Executive Board</span>
              <div className="h-px flex-1 bg-teal-500/20" />
            </div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
              Executive <span className="gradient-text">Leadership</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Defining the strategic direction and governance protocols for the Geophysical Society of Tulsa network ecosystem.
            </p>
            <div className="h-px w-full bg-gradient-to-r from-teal-500/40 to-transparent mt-10" />
          </div>

          {/* Member Cards */}
          <div className="space-y-8">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
              </div>
            ) : (
              executives.map((exec, idx) => {
                const fullName = `${exec.first_name} ${exec.last_name}`;
                const role = exec.job_title || 'EXECUTIVE MEMBER';
                const image = exec.profile_image || exec.avatar_url || exec.exec_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'; // Placeholder
                
                return (
                  <div
                    key={exec.id}
                    className="flex glass-card rounded-xl overflow-hidden group hover:border-teal-500/40 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {/* Image */}
                    <div className="w-72 flex-shrink-0 relative overflow-hidden bg-slate-800">
                      <img
                        src={image}
                        alt={fullName}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/60" />
                      {/* Teal corner accent */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-10 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.25em] mb-3">{role}</span>
                      <h2 className="text-3xl font-black text-white mb-5 tracking-tight uppercase">{fullName}</h2>
                      {exec.company && (
                        <p className="text-slate-400 font-medium mb-5">{exec.company}</p>
                      )}
                      <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 max-w-xl">
                        {exec.bio || `${fullName} serves on the Executive Board of the Geophysical Society of Tulsa, helping to guide the strategic vision and operations of the organization.`}
                      </p>
                      <div className="flex gap-4">
                        <Link
                          to={`/executive/${exec.id}`}
                          className="btn-teal px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg"
                        >
                          <span>View Portfolio</span>
                        </Link>
                        <button className="btn-outline-teal px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Recruitment Pending Card */}
            <div className="flex rounded-xl overflow-hidden border border-dashed border-slate-700 opacity-50 mt-8">
              <div className="w-72 flex-shrink-0 bg-slate-800/50 flex items-center justify-center py-20">
                <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Image</span>
              </div>
              <div className="flex-1 p-10 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em] mb-3">Position Pending</span>
                <h2 className="text-3xl font-black text-slate-600 mb-5 tracking-tight">RECRUITMENT IN PROGRESS</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-xl">
                  This position is currently undergoing strategic review. The Executive Board is seeking a candidate with a background in structural governance and geophysical policy implementation.
                </p>
                <button disabled className="w-fit px-6 py-3 border border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-600 rounded-lg cursor-not-allowed">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-12 py-10 border-t border-teal-500/20 flex flex-col md:flex-row items-center justify-between gap-6 mt-20">
          <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">© 2024 Geophysical Society of Tulsa</p>
          <div className="flex items-center gap-8">
            {['Privacy Policy', 'Terms of Service', 'Contact', 'Bylaws'].map((item) => (
              <Link key={item} to="#" className="text-[10px] font-bold text-slate-600 hover:text-teal-400 transition-colors uppercase tracking-widest">{item}</Link>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
