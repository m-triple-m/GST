import { useState, useEffect, useRef } from 'react';
import { ArrowDown, Play, MapPin, Users, Calendar, Award } from 'lucide-react';
import TerrainBackground from './TerrainBackground2';

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
      {/* Base dark backdrop */}
      <div className="absolute inset-0 bg-[#05080f]" />

      {/* 3D animated topographic contour terrain */}
      <TerrainBackground opacity={0.8} />

      {/* Readability gradient over the terrain */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, rgba(5,8,15,0.94) 0%, rgba(5,8,15,0.78) 32%, rgba(5,8,15,0.35) 60%, rgba(5,8,15,0.55) 100%)',
        }}
      />

      {/* Floating particle dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.05,
              animation: `pulse ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + 's',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-4xl">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/40 bg-teal-500/10 mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-300 text-xs font-semibold tracking-widest uppercase">
              First SEG Section Approved — Since 1947
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{ animationDelay: '0.15s' }}
          >
            <span className="block">Geophysical</span>
            <span className="block gradient-text">Society of</span>
            <span className="block text-white">Tulsa</span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{ transitionDelay: '0.25s' }}
          >
            In 1947, the Geophysical Society of Tulsa (GST) became the first section approved by the Society of Exploration Geophysicists. For over 75 years, we have enriched the geophysical community through regular meetings, technical talks, and professional events.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-4 mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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

          {/* Stats row */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            style={{ transitionDelay: '0.45s' }}
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="glass-card rounded-xl p-4 group hover:border-teal-500/30 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors duration-200">
                    <Icon className="w-4 h-4 text-teal-400" />
                  </div>
                  <span className="text-2xl font-black text-white">{value}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors duration-200 animate-bounce group"
        aria-label="Scroll down"
      >
        <span className="text-xs font-medium tracking-wider uppercase group-hover:text-teal-400">Explore</span>
        <ArrowDown className="w-5 h-5" />
      </button>
    </section>
  );
}
