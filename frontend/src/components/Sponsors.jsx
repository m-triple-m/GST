import { useEffect, useState } from 'react';
import { ExternalLink, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

// ── Tier config ───────────────────────────────────────────────────────────────
const TIER_ORDER  = ['platinum', 'gold', 'silver', 'bronze'];

const TIER_STYLE = {
  platinum: {
    card:   'border-teal-300/70 bg-gradient-to-b from-teal-50 to-white hover:border-teal-400 hover:shadow-teal-100',
    badge:  'bg-teal-100 text-teal-700',
    label:  'Platinum',
  },
  gold: {
    card:   'border-amber-300/70 bg-gradient-to-b from-amber-50 to-white hover:border-amber-400 hover:shadow-amber-100',
    badge:  'bg-amber-100 text-amber-700',
    label:  'Gold',
  },
  silver: {
    card:   'border-slate-300/70 bg-gradient-to-b from-slate-50 to-white hover:border-slate-400 hover:shadow-slate-100',
    badge:  'bg-slate-100 text-slate-600',
    label:  'Silver',
  },
  bronze: {
    card:   'border-orange-300/60 bg-gradient-to-b from-orange-50 to-white hover:border-orange-400 hover:shadow-orange-100',
    badge:  'bg-orange-100 text-orange-700',
    label:  'Bronze',
  },
};

// Derive initials from sponsor name
const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

// Backend base URL (strips /api suffix)
const BACKEND = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') ?? '';

function logoSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
}

// ── Single sponsor card ───────────────────────────────────────────────────────
function SponsorCard({ sponsor }) {
  const [imgError, setImgError] = useState(false);
  const style = TIER_STYLE[sponsor.tier] ?? TIER_STYLE.bronze;
  const src   = logoSrc(sponsor.logo_url);

  const card = (
    <div
      className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${style.card}`}
    >
      {/* Logo or initials avatar */}
      <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
        {src && !imgError ? (
          <img
            src={src}
            alt={sponsor.name}
            className="max-w-full max-h-full object-contain p-1"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-lg font-black text-slate-600">{initials(sponsor.name)}</span>
        )}
      </div>

      {/* Name + tier */}
      <div className="text-center">
        <p className="text-sm font-bold text-slate-800 leading-tight">{sponsor.name}</p>
        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* External link icon on hover */}
      {sponsor.website_url && (
        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 transition-colors" />
      )}
    </div>
  );

  return sponsor.website_url ? (
    <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer">
      {card}
    </a>
  ) : card;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Sponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedTier, setSelectedTier] = useState('all');

  useEffect(() => {
    api.get('/sponsors')
      .then(({ data }) => setSponsors(data.data ?? []))
      .catch(() => setSponsors([]))
      .finally(() => setLoading(false));
  }, []);

  const activeTiers = TIER_ORDER.filter((t) => sponsors.some((s) => s.tier === t));

  const displayedSponsors = selectedTier === 'all'
    ? sponsors
    : sponsors.filter((s) => s.tier === selectedTier);

  return (
    <section id="sponsors" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-teal-500 fill-teal-500" />
            <p className="text-teal-600 text-sm font-semibold tracking-widest uppercase">
              Our Sponsors
            </p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">
            Supported By Industry Leaders
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            The GST is generously supported by leading energy companies and academic
            institutions throughout the Tulsa region and beyond.
          </p>
        </div>

        {/* Optional Filter Pills if multiple tiers exist */}
        {!loading && sponsors.length > 0 && activeTiers.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTier === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Sponsors ({sponsors.length})
            </button>
            {activeTiers.map((tier) => {
              const count = sponsors.filter((s) => s.tier === tier).length;
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`capitalize px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {TIER_STYLE[tier]?.label || tier} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-teal-500" />
          </div>
        ) : sponsors.length === 0 ? (
          /* No sponsors set yet — hide the grid gracefully */
          <p className="text-center text-slate-400 text-sm py-8">
            Sponsor information coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedSponsors.map((s) => (
              <SponsorCard key={s.id} sponsor={s} />
            ))}
          </div>
        )}

        {/* Become a sponsor CTA */}
        <div className="text-center mt-14">
          <p className="text-slate-500 text-sm mb-4">
            Interested in sponsoring GST events and reaching the Tulsa geophysical community?
          </p>
          <Link
            to="/sponsor"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-500 text-teal-600 font-semibold text-sm hover:bg-teal-500 hover:text-white transition-all duration-200"
          >
            Become a Sponsor <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
