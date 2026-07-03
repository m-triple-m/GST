import { Link } from 'react-router-dom';
import { Users, Mail, Globe, ChevronRight, Award } from 'lucide-react';

const committee = [
  {
    title: 'President',
    name: 'TBA',
    bio: 'The President oversees all GST operations, chairs executive meetings, and represents the society at SEG and regional events.',
    email: 'president@gst-tulsa.org',
    term: '2025–2026',
    vacant: true,
  },
  {
    title: 'Vice President',
    name: 'TBA',
    bio: 'The Vice President assists the President, coordinates programs, and assumes presidential duties when needed.',
    email: 'vp@gst-tulsa.org',
    term: '2025–2026',
    vacant: true,
  },
  {
    title: 'Secretary',
    name: 'TBA',
    bio: 'The Secretary maintains official records, manages correspondence, and documents all board proceedings.',
    email: 'secretary@gst-tulsa.org',
    term: '2025–2026',
    vacant: true,
  },
  {
    title: 'Treasurer',
    name: 'TBA',
    bio: 'The Treasurer manages GST finances, prepares annual budgets, and ensures fiscal responsibility.',
    email: 'treasurer@gst-tulsa.org',
    term: '2025–2026',
    vacant: true,
  },
  {
    title: 'Past President',
    name: 'TBA',
    bio: 'The Past President provides continuity and guidance from prior leadership experience.',
    email: null,
    term: '2025–2026',
    vacant: true,
  },
  {
    title: 'Program Chair',
    name: 'TBA',
    bio: 'The Program Chair plans and coordinates the monthly technical luncheon program and selects speakers.',
    email: 'programs@gst-tulsa.org',
    term: '2025–2026',
    vacant: true,
  },
  {
    title: 'Membership Chair',
    name: 'TBA',
    bio: 'The Membership Chair manages member recruitment, renewals, and engagement initiatives.',
    email: 'membership@gst-tulsa.org',
    term: '2025–2026',
    vacant: true,
  },
  {
    title: 'Student Affairs Chair',
    name: 'TBA',
    bio: 'Coordinates student outreach, scholarship awards, and university partnerships.',
    email: null,
    term: '2025–2026',
    vacant: true,
  },
];

const responsibilities = [
  { role: 'Technical Program', desc: 'Monthly luncheons featuring cutting-edge geophysical research' },
  { role: 'Student Outreach', desc: 'Scholarships, mentoring, and academic partnerships' },
  { role: 'Community Events', desc: 'Annual golf tournament and professional socials' },
  { role: 'SEG Liaison', desc: 'Coordination with the Society of Exploration Geophysicists' },
];

export default function ExecutivePage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-slate-900 py-14 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
            <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Executive Committee</span>
          </div>
          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">Leadership</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Executive Committee</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Our dedicated volunteer leaders work year-round to deliver meaningful programming 
            and opportunities for Tulsa's geophysical community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Info banner */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-12 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-teal-800 mb-1">Volunteer Leadership</h3>
            <p className="text-teal-700 text-sm leading-relaxed">
              All GST executive positions are volunteer roles held by working geophysical professionals 
              and academics from the Tulsa area. Positions are elected annually by GST members.
              Interested in serving? <Link to="/membership" className="underline font-semibold">Become a member</Link> to be eligible.
            </p>
          </div>
        </div>

        {/* Roles overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {responsibilities.map(({ role, desc }) => (
            <div key={role} className="stat-card rounded-xl p-5">
              <p className="font-bold text-teal-700 text-sm mb-1">{role}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Committee grid */}
        <h2 className="text-2xl font-black text-slate-900 mb-8">2025–2026 Committee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {committee.map(({ title, name, bio, email, term, vacant }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col group"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 group-hover:from-teal-100 group-hover:to-teal-200 flex items-center justify-center mb-4 transition-all duration-200">
                <Users className="w-7 h-7 text-slate-500 group-hover:text-teal-600 transition-colors duration-200" />
              </div>

              {/* Role */}
              <p className="text-xs font-bold text-teal-600 tracking-widest uppercase mb-1">{title}</p>

              {/* Name */}
              <p className={`font-bold text-lg mb-2 ${vacant ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                {vacant ? 'To Be Announced' : name}
              </p>

              {/* Bio */}
              <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">{bio}</p>

              {/* Term */}
              <p className="text-xs text-slate-400 mb-3">Term: {term}</p>

              {/* Email */}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-teal-600 transition-colors duration-200"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {email}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-14 bg-slate-900 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 seismic-pattern opacity-20" />
          <div className="relative">
            <h3 className="text-2xl font-black text-white mb-3">Interested in Serving?</h3>
            <p className="text-slate-400 max-w-lg mx-auto mb-7">
              GST committee positions are open to all professional members. 
              Elections are held annually at our spring meeting. Join as a member to become eligible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/membership" className="btn-teal px-7 py-3.5 rounded-xl font-bold text-white text-sm">
                <span>Join GST</span>
              </Link>
              <Link to="/#contact" className="px-7 py-3.5 rounded-xl font-bold text-white text-sm border border-white/20 hover:bg-white/5 transition-all duration-200">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
