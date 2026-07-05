import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Mail, Link as LinkIcon, Share2,
  Link2, ExternalLink, AtSign,
  Award, CheckCircle2, PenTool, Lock,
  MessageSquare, ThumbsUp, Filter, ArrowLeft, Loader2
} from 'lucide-react';
import api from '../../api';

export default function ExecutiveProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exec, setExec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutive = async () => {
      try {
        const { data } = await api.get(`/members/executive/${id}`);
        setExec(data.data);
      } catch (err) {
        setExec(null);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutive();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!exec) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4 tracking-tight">Profile Not Found</h1>
          <button onClick={() => navigate('/executive')} className="text-teal-400 text-sm hover:underline">← Back to Leadership</button>
        </div>
      </div>
    );
  }

  const fullName = `${exec.first_name} ${exec.last_name}`;
  const role = exec.job_title || 'EXECUTIVE MEMBER';
  const joinedDate = (exec.joined_at || exec.created_at) ? new Date(exec.joined_at || exec.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown';
  const image = exec.profile_image || exec.avatar_url || exec.exec_photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
  const bio = exec.bio || `${fullName} is an active member of the Executive Board of the Geophysical Society of Tulsa.`;

  // Provide some default dummy achievements & links for the UI since they aren't in DB yet
  const achievements = [
    { name: 'VERIFIED', icon: CheckCircle2, locked: false },
    { name: 'AUTHOR', icon: PenTool, locked: false },
    { name: 'LOCKED', icon: Lock, locked: true },
  ];
  
  const links = [
    { name: 'LINKEDIN', url: '#', icon: Link2 },
  ];

  const activity = [
    {
      id: 1,
      title: 'MEMBER_JOINED',
      desc: `${fullName} joined the Geophysical Society of Tulsa.`,
      tag: 'JOINED',
      time: 'Recently'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white seismic-pattern" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sub-nav Header ── */}
      <div className="px-10 py-5 border-b border-teal-500/20 flex items-center justify-between sticky top-16 bg-slate-950/95 backdrop-blur-xl z-20">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-lg font-black tracking-tight text-white">GST</Link>
          <div className="flex gap-8">
            {['EXPLORE', 'DONATE', 'ABOUT'].map(item => (
              <Link key={item} to="#" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-teal-400 transition-colors">{item}</Link>
            ))}
            <Link to="/executive" className="text-[10px] font-bold text-teal-400 uppercase tracking-widest border-b border-teal-500 pb-1">MEMBERS</Link>
          </div>
        </div>
        <button className="btn-teal px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg">
          <span>JOIN US</span>
        </button>
      </div>

      {/* ── Back link ── */}
      <div className="max-w-6xl mx-auto px-10 pt-10">
        <button onClick={() => navigate('/executive')} className="flex items-center gap-2 text-slate-500 hover:text-teal-400 transition-colors text-xs font-bold tracking-widest uppercase mb-10">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Executive Board
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Profile image */}
          <div className="relative rounded-xl overflow-hidden aspect-square glass-card">
            <img src={image} alt={fullName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            {/* Teal border accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400/0" />
          </div>

          {/* Profile card */}
          <div className="glass-card rounded-xl p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{fullName}</h1>
              <span className="inline-block px-3 py-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-[9px] font-black tracking-[0.2em] uppercase rounded-md">
                {role}
              </span>
              <p className="text-slate-500 text-[10px] font-bold mt-3 italic tracking-wider">Joined: {joinedDate}</p>
            </div>

            <div className="h-px bg-teal-500/15" />

            <button className="w-full py-3.5 btn-teal text-[10px] font-black uppercase tracking-widest text-white rounded-lg">
              <span>Message Member</span>
            </button>

            <div className="flex gap-3">
              {[
                { icon: LinkIcon, label: 'Copy Link' },
                { icon: Share2, label: 'Share' },
                { icon: Mail, label: 'Email' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} title={label} className="flex-1 py-3 glass-card border-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Professional links */}
          <div className="glass-card rounded-xl p-8">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6">PROFESSIONAL_LINKS</h3>
            <div className="space-y-4">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-teal-400 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md glass-card flex items-center justify-center group-hover:border-teal-500/40 transition-colors">
                    <link.icon className="w-3.5 h-3.5" />
                  </div>
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Bio */}
          <div className="glass-card rounded-xl p-10">
            <h3 className="text-[9px] font-black text-teal-500 uppercase tracking-[0.25em] mb-6">INTRODUCTION // MEMBER_BIO</h3>
            <p className="text-slate-300 text-lg font-medium leading-relaxed">
              {bio}
            </p>
          </div>

          {/* Achievements */}
          <div className="glass-card rounded-xl p-10">
            <h3 className="text-[9px] font-black text-teal-500 uppercase tracking-[0.25em] mb-8">ACHIEVEMENTS // AWARDS</h3>
            <div className="flex gap-6 flex-wrap">
              {achievements.map((ach) => (
                <div key={ach.name} className={`flex flex-col items-center gap-3 group ${ach.locked ? 'opacity-25' : ''}`}>
                  <div className={`w-14 h-14 rounded-xl glass-card flex items-center justify-center transition-all duration-300 ${
                    !ach.locked ? 'hover:bg-teal-500/20 hover:border-teal-500/50 cursor-pointer text-teal-400' : 'text-slate-600'
                  }`}>
                    <ach.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest uppercase text-slate-500 group-hover:text-teal-500 transition-colors">{ach.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-10 py-6 border-b border-teal-500/20 flex justify-between items-center">
              <h3 className="text-[9px] font-black text-teal-500 uppercase tracking-[0.25em]">RECENT_ACTIVITY</h3>
              <button className="text-slate-500 hover:text-teal-400 transition-colors"><Filter className="w-4 h-4" /></button>
            </div>

            <div className="divide-y divide-teal-500/10">
              {activity.map((act) => (
                <div key={act.id} className="px-10 py-8 group hover:bg-teal-500/5 transition-all duration-200 relative">
                  <div className="absolute top-8 right-10 text-[9px] font-bold text-slate-600 flex items-center gap-1.5">
                    <span>{act.time}</span>
                  </div>
                  
                  {/* Teal left accent on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <h4 className="text-base font-black text-white mb-3 tracking-tight uppercase group-hover:text-teal-300 transition-colors pr-24">
                    {act.title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-2xl">
                    {act.desc}
                  </p>

                  {act.metadata && (
                    <div className="flex gap-6">
                      <span className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        {act.metadata.replies} REPLIES
                      </span>
                      <span className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <ThumbsUp className="w-3.5 h-3.5 text-teal-600" />
                        {act.metadata.upvotes} UPVOTES
                      </span>
                    </div>
                  )}
                  {act.tag && (
                    <span className="inline-block px-3 py-1.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[8px] font-black tracking-widest uppercase rounded-md">
                      {act.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-10 py-10 border-t border-teal-500/20 flex flex-col md:flex-row items-center justify-between gap-8 mt-10">
        <div className="text-lg font-black tracking-tight text-white">GST</div>
        <div className="flex items-center gap-10">
          {['PRIVACY POLICY', 'TERMS OF SERVICE', 'CONTACT', 'FAQ'].map((item) => (
            <Link key={item} to="#" className="text-[9px] font-bold text-slate-600 hover:text-teal-400 transition-colors tracking-widest uppercase">{item}</Link>
          ))}
        </div>
        <p className="text-[8px] font-bold text-slate-600 tracking-widest uppercase">© 2024 GEOPHYSICAL SOCIETY OF TULSA</p>
      </footer>
    </div>
  );
}
