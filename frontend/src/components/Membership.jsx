import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Users, Star, ArrowRight } from 'lucide-react';
import api from '../api';

const DEFAULT_TIERS = [
  {
    id: 'student',
    name: 'Student',
    price: '$80',
    period: '/year',
    description: 'For geoscience students pursuing excellence in exploration geophysics.',
    features: [
      'Access to all monthly technical luncheons',
      'Networking with industry professionals',
      'GST Student Scholarship eligibility',
      'SEG Student Section connection',
      'Digital newsletter subscription',
    ],
    cta: 'Join as Student',
    highlighted: false,
    badge: null,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$110',
    period: '/year',
    description: 'For working geophysicists, engineers, and earth science professionals.',
    features: [
      'All monthly luncheon discounts',
      'Full voting rights in GST elections',
      'Priority access to workshops & field trips',
      'Professional directory listing',
      'SEG affiliate discounts',
      'Committee participation eligibility',
    ],
    cta: 'Join as Professional',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    price: '$150',
    period: '/year',
    description: 'For companies and organizations seeking full team participation and visibility.',
    features: [
      'Logo placement at GST meetings & site',
      'Multiple employee memberships',
      'Technical luncheon sponsor discounts',
      'Priority event recognition',
      'Annual society directory feature',
    ],
    cta: 'Join as Corporate',
    highlighted: false,
    badge: null,
  },
];

export default function Membership() {
  const [tiers, setTiers] = useState(DEFAULT_TIERS);

  useEffect(() => {
    const fetchLiveTiers = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data?.data) {
          const s = data.data;
          setTiers(DEFAULT_TIERS.map((tier) => {
            const raw = s[`tier_${tier.id}_price`];
            if (raw !== undefined && raw !== null && raw !== '') {
              const num = parseFloat(raw);
              const formattedPrice = isNaN(num)
                ? raw
                : num === 0
                  ? 'Free'
                  : `$${num.toFixed(0)}`;
              return { ...tier, price: formattedPrice };
            }
            return tier;
          }));
        }
      } catch {
        // Fallback to default
      }
    };
    fetchLiveTiers();
  }, []);

  return (
    <section id="membership" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 seismic-pattern opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Become a Member
          </p>
          <h2 className="text-4xl font-black text-white mb-4">
            Join the GST Community
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Connect with Tulsa's foremost geophysical community. Enjoy technical luncheons, 
            professional networking, and exclusive resources — all year long.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                tier.highlighted
                  ? 'bg-teal-500 shadow-2xl shadow-teal-500/30 ring-1 ring-teal-400'
                  : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-teal-700 text-xs font-bold shadow-lg">
                    <Star className="w-3 h-3 fill-teal-500 stroke-none" />
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier name */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tier.highlighted ? 'bg-white/20' : 'bg-teal-500/20'
                  }`}>
                    <Users className={`w-4 h-4 ${tier.highlighted ? 'text-white' : 'text-teal-400'}`} />
                  </div>
                  <h3 className={`font-bold text-lg ${tier.highlighted ? 'text-white' : 'text-slate-100'}`}>
                    {tier.name}
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${tier.highlighted ? 'text-teal-100' : 'text-slate-400'}`}>
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className={`flex items-end gap-1 mb-6 pb-6 border-b ${
                tier.highlighted ? 'border-white/20' : 'border-slate-700'
              }`}>
                <span className={`text-4xl font-black ${tier.highlighted ? 'text-white' : 'text-slate-100'}`}>
                  {tier.price}
                </span>
                <span className={`text-sm mb-1 ${tier.highlighted ? 'text-teal-100' : 'text-slate-400'}`}>
                  {tier.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      tier.highlighted ? 'bg-white/20' : 'bg-teal-500/15'
                    }`}>
                      <Check className={`w-3 h-3 ${tier.highlighted ? 'text-white' : 'text-teal-400'}`} />
                    </div>
                    <span className={`text-sm ${tier.highlighted ? 'text-teal-50' : 'text-slate-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={`/membership?tier=${tier.id}`}
                id={`membership-cta-${tier.id}`}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  tier.highlighted
                    ? 'bg-white text-teal-700 hover:bg-teal-50 shadow-lg'
                    : 'border border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white'
                }`}
              >
                {tier.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <p className="text-center text-slate-500 text-sm mt-10">
          GST is a 501(c)(3) non-profit organization · Oklahoma, P.O. Box 2784, Tulsa, OK 74101
        </p>
      </div>
    </section>
  );
}
