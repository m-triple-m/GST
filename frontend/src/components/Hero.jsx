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
      {/* Hero background */}
      <div className="absolute inset-0 hero-bg" />

      {/* Seismic wave overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <path
            d="M0,450 C120,400 180,500 300,450 C420,400 480,500 600,450 C720,400 780,500 900,450 C1020,400 1080,500 1200,450 C1320,400 1380,500 1440,450"
            fill="none" stroke="#008080" strokeWidth="2" opacity="0.6"
          />
          <path
            d="M0,420 C80,380 140,460 260,420 C380,380 440,460 560,420 C680,380 740,460 860,420 C980,380 1040,460 1160,420 C1280,380 1360,460 1440,420"
            fill="none" stroke="#00a0a0" strokeWidth="1.5" opacity="0.4"
          />
          <path
            d="M0,480 C160,520 220,440 340,480 C460,520 520,440 640,480 C760,520 820,440 940,480 C1060,520 1120,440 1240,480 C1360,520 1400,440 1440,480"
            fill="none" stroke="#008080" strokeWidth="1" opacity="0.3"
          />
          {/* Earth strata lines */}
          {[620, 660, 700, 740, 780, 820].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="1440" y2={y} stroke="#00a0a0" strokeWidth="0.5" opacity={0.1 + i * 0.02} strokeDasharray={i % 2 === 0 ? "8 4" : "4 8"} />
          ))}
        </svg>
      </div>

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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/40 bg-teal-500/10 mb-8 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-300 text-xs font-semibold tracking-widest uppercase">
              First SEG Section Approved — Since 1947
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 transition-all duration-700 delay-100 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ animationDelay: '0.15s' }}
          >
            <span className="block">Geophysical</span>
            <span className="block gradient-text">Society of</span>
            <span className="block text-white">Tulsa</span>
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
            className={`flex flex-wrap gap-4 mb-16 transition-all duration-700 ${
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

          {/* Stats row */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
