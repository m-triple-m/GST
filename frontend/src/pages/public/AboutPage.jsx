import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Globe, Award, ArrowRight, BookOpen, MapPin, Calendar } from 'lucide-react';

const stats = [
  { value: '1947', label: 'Founded' },
  { value: '500+', label: 'Active Members' },
  { value: '12', label: 'Annual Luncheons' },
  { value: '$10k+', label: 'Scholarships Awarded' },
];

const values = [
  {
    icon: Users,
    title: 'Professional Networking',
    desc: 'Connecting geophysicists in the Tulsa area for over 75 years through technical luncheons and social events.',
  },
  {
    icon: BookOpen,
    title: 'Continuing Education',
    desc: 'Promoting the science of geophysics through workshops, technical talks, and access to SEG resources.',
  },
  {
    icon: Award,
    title: 'Student Support',
    desc: 'Fostering the next generation of geoscientists through dedicated scholarships and student chapter outreach.',
  },
  {
    icon: Globe,
    title: 'Community Impact',
    desc: 'Contributing to the local energy industry and scientific community in the "Oil Capital of the World".',
  },
];

const milestones = [
  { year: '1947', title: 'GST Founded', desc: 'The Geophysical Society of Tulsa was established to promote the science of geophysics.' },
  { year: '1952', title: 'First Symposium', desc: 'Hosted the first major technical symposium in the region.' },
  { year: '2022', title: '75th Anniversary', desc: 'Celebrated three-quarters of a century of scientific contribution in Tulsa.' },
  { year: '2024', title: 'Digital Expansion', desc: 'Launched the new member portal and digital resource archive.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-4 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-teal-400 text-sm font-bold tracking-[0.3em] uppercase mb-6 animate-fade-in">Established 1947</p>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8 animate-fade-in-up">
            Advancing the Science of<br />
            <span className="gradient-text">Applied Geophysics</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-in-up delay-100">
            The Geophysical Society of Tulsa (GST) is a non-profit organization dedicated to the education and professional development of geoscientists in the Tulsa region.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Link to="/membership" className="btn-teal px-8 py-4 rounded-xl text-white font-bold text-sm shadow-xl hover:shadow-teal-500/20 transition-all">
              <span>Join the Society</span>
            </Link>
            <Link to="/executive" className="btn-outline-teal px-8 py-4 rounded-xl font-bold text-sm bg-white/5 backdrop-blur-sm transition-all border-white/20 text-white hover:bg-white hover:text-slate-900">
              Meet Leadership
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 px-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission Section ── */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80" 
                alt="Tulsa Skyline" 
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/20 mix-blend-multiply" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-teal-600 text-white p-6 rounded-2xl shadow-xl hidden sm:block">
              <p className="text-2xl font-black mb-1">75+ Years</p>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-100">of Scientific Heritage</p>
            </div>
          </div>
          
          <div>
            <div className="section-heading mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">Our Mission</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg mb-6">
              The purpose of this Society is to promote the science of geophysics, especially as it applies to exploration and research; to foster the common scientific interests of geophysicists; and to maintain a high professional standing among its members.
            </p>
            <p className="text-slate-600 leading-relaxed mb-8">
              Based in Tulsa, Oklahoma, GST serves as a local chapter for the Society of Exploration Geophysicists (SEG), providing a platform for local professionals and students to exchange ideas and stay current with industry trends.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <MapPin className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-bold text-slate-700">Tulsa, OK Chapter</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <Calendar className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-bold text-slate-700">Monthly Luncheons</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 px-4 bg-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Why GST Matters</h2>
            <div className="w-24 h-1 bg-teal-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-500/20 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500 transition-all duration-300">
                  <v.icon className="w-6 h-6 text-teal-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Society Journey</h2>
          </div>
          
          <div className="space-y-12 relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-8 relative z-10">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 font-black text-xs shadow-lg shadow-teal-500/30">
                  {i === milestones.length - 1 ? 'Now' : m.year.slice(2)}
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">{m.year}</p>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{m.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center shadow-2xl shadow-teal-900/20">
          <div className="absolute inset-0 seismic-pattern opacity-10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              Join Tulsa's Professional<br /><span className="gradient-text">Geophysical Community</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Whether you are a seasoned professional or a student starting out, GST offers the resources and connections you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/membership" className="btn-teal px-10 py-4 rounded-xl text-white font-bold text-sm shadow-xl">
                <span>Apply for Membership</span>
              </Link>
              <Link to="/donate" className="px-10 py-4 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-all">
                Support Student Scholarships
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
