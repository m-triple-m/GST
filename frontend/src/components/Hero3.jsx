import { useState, useEffect, useRef } from 'react';
import { ArrowDown, Play, MapPin, Users, Calendar, Award } from 'lucide-react';

const stats = [
  { value: '75+', label: 'Years of Service', icon: Award },
  { value: '500+', label: 'Active Members', icon: Users },
  { value: '12', label: 'Events per Year', icon: Calendar },
  { value: '1947', label: 'Founded in Tulsa', icon: MapPin },
];

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollDown = () => {
    const el = document.querySelector('#news-events');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Base dark backdrop with deep teal accent gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #082121 0%, #05080f 100%)',
        }}
      />

      {/* Content — center aligned */}
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 w-full flex flex-col items-center text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/40 bg-teal-500/10 mb-8 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-teal-400" />
          <span className="text-teal-300 text-xs font-semibold tracking-widest uppercase">
            First SEG Section Approved — Since 1947
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 transition-all duration-700 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="block">Geophysical</span>
          <span className="block">
            Society of <span className="gradient-text">Tulsa</span>
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.25s' }}
        >
          In 1947, the Geophysical Society of Tulsa (GST) became the first section approved by the Society of Exploration Geophysicists. For over 75 years, we have enriched the geophysical community through regular meetings, technical talks, and professional events.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-wrap justify-center gap-4 mb-16 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.35s' }}
        >
          <a
            href="#events"
            id="hero-events-btn"
            onClick={(e) => { e.preventDefault(); document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="btn-teal px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-teal-500/20 text-sm"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Events
            </span>
          </a>
          <a
            href="#membership"
            id="hero-join-btn"
            onClick={(e) => { e.preventDefault(); document.querySelector('#membership')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="px-7 py-3.5 rounded-xl font-semibold text-white border border-white/20 hover:border-teal-400/60 hover:bg-white/5 transition-all duration-200 text-sm"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Become a Member
            </span>
          </a>
        </div>

        {/* Stats row — minimal style matching reference image */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8 w-full max-w-3xl transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.45s' }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-start">
              <span className="text-3xl font-black text-white mb-1">{value}</span>
              <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors duration-200 group"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium tracking-wider uppercase group-hover:text-teal-400">Explore</span>
        <ArrowDown className="w-5 h-5" />
      </button>
    </section>
  );
}
