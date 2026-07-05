import { useEffect, useState } from 'react';

/**
 * IntroOverlay
 * ------------
 * A short full-screen splash played when the homepage mounts. It sits on
 * top of <Hero /> (which is already mounted and animating underneath), and
 * simply fades/scales itself away — so the intro visually "hands off" into
 * the Hero section's live rotating terrain background rather than cutting
 * to it.
 *
 * Sequence:
 *   0.0s  mark fades/scales in, contour rings draw in behind it
 *   0.5s  progress rule starts filling
 *   2.3s  everything begins to fade + scale up slightly
 *   3.0s  onDone() fires — parent unmounts the overlay
 */
export default function IntroOverlay({ onDone }) {
  const [phase, setPhase] = useState('enter'); // enter -> hold -> leave

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t1 = setTimeout(() => setPhase('leave'), 2300);
    const t2 = setTimeout(() => onDone?.(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = previousOverflow;
    };
  }, [onDone]);

  const leaving = phase === 'leave';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05080f] overflow-hidden transition-all duration-700 ease-in"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.08)' : 'scale(1)',
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      {/* concentric contour rings drawing in, echoing the hero terrain */}
      <svg
        viewBox="0 0 600 600"
        className="absolute w-[140vmax] h-[140vmax] max-w-none opacity-70"
      >
        {[...Array(7)].map((_, i) => {
          const r = 60 + i * 34;
          const circumference = 2 * Math.PI * r;
          return (
            <circle
              key={i}
              cx="300"
              cy="300"
              r={r}
              fill="none"
              stroke={i % 2 === 0 ? '#00c0c0' : '#0d4f4f'}
              strokeWidth="1"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              style={{
                animation: `intro-ring 1.6s cubic-bezier(0.22,1,0.36,1) forwards`,
                animationDelay: `${0.1 + i * 0.08}s`,
              }}
            />
          );
        })}
      </svg>

      {/* radial glow */}
      <div
        className="absolute w-[70vmax] h-[70vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(0,192,192,0.16) 0%, rgba(0,192,192,0) 65%)',
        }}
      />

      {/* wordmark */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <span
          className="text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase text-teal-300/80 mb-4 opacity-0"
          style={{ animation: 'intro-fade-up 0.7s ease-out forwards', animationDelay: '0.15s' }}
        >
          Since 1947
        </span>

        <h1
          className="text-4xl sm:text-6xl font-black text-white leading-tight opacity-0"
          style={{ animation: 'intro-fade-up 0.8s ease-out forwards', animationDelay: '0.35s' }}
        >
          <span className="gradient-text">GST</span>
        </h1>

        <p
          className="mt-3 text-sm sm:text-base text-slate-400 tracking-wide opacity-0"
          style={{ animation: 'intro-fade-up 0.8s ease-out forwards', animationDelay: '0.55s' }}
        >
          Geophysical Society of Tulsa
        </p>

        {/* progress rule */}
        <div className="mt-8 w-40 sm:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden opacity-0"
          style={{ animation: 'intro-fade-up 0.6s ease-out forwards', animationDelay: '0.7s' }}
        >
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-300 rounded-full"
            style={{ animation: 'intro-progress 1.7s ease-in-out forwards', animationDelay: '0.75s' }}
          />
        </div>
      </div>
    </div>
  );
}
