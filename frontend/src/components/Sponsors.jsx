import { ExternalLink, Heart } from 'lucide-react';

const sponsors = [
  { name: 'ConocoPhillips', tier: 'Gold', initials: 'COP' },
  { name: 'Williams Companies', tier: 'Gold', initials: 'WMB' },
  { name: 'ONEOK', tier: 'Silver', initials: 'OKE' },
  { name: 'Schlumberger', tier: 'Silver', initials: 'SLB' },
  { name: 'Pioneer Natural Resources', tier: 'Silver', initials: 'PXD' },
  { name: 'Holly Frontier', tier: 'Bronze', initials: 'HFC' },
  { name: 'University of Tulsa', tier: 'Academic', initials: 'TU' },
  { name: 'TGS', tier: 'Bronze', initials: 'TGS' },
];

const tierColors = {
  Gold: 'border-amber-400/60 bg-amber-50 text-amber-700',
  Silver: 'border-slate-300 bg-slate-50 text-slate-600',
  Bronze: 'border-orange-300/60 bg-orange-50 text-orange-700',
  Academic: 'border-teal-300/60 bg-teal-50 text-teal-700',
};

export default function Sponsors() {
  return (
    <section id="sponsors" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-teal-500 fill-teal-500" />
            <p className="text-teal-600 text-sm font-semibold tracking-widest uppercase">
              Our Sponsors
            </p>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Supported By Industry Leaders</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            The GST is generously supported by leading energy companies and academic institutions 
            throughout the Tulsa region and beyond.
          </p>
        </div>

        {/* Sponsor logos grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className={`group flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 ${tierColors[sponsor.tier]} hover:shadow-md transition-all duration-200 cursor-pointer`}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <span className="text-sm font-black text-slate-700">{sponsor.initials}</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800 leading-tight">{sponsor.name}</p>
                <p className="text-xs font-semibold opacity-70 mt-0.5">{sponsor.tier} Sponsor</p>
              </div>
            </div>
          ))}
        </div>

        {/* Become a sponsor CTA */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">
            Interested in sponsoring GST events and reaching the Tulsa geophysical community?
          </p>
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-500 text-teal-600 font-semibold text-sm hover:bg-teal-500 hover:text-white transition-all duration-200"
          >
            Become a Sponsor <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
