import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Users, Mic, MapPin, CheckCircle,
  ChevronRight, CreditCard, ArrowRight, DollarSign
} from 'lucide-react';

const impactItems = [
  {
    icon: Mic,
    title: 'Guest Speakers',
    desc: 'Funding allows us to bring world-class speakers from academia and industry to Tulsa.',
  },
  {
    icon: MapPin,
    title: 'Event Space & Catering',
    desc: 'Your support covers luncheon venues, AV equipment, and meal costs for our monthly events.',
  },
  {
    icon: Users,
    title: 'Student Scholarships',
    desc: 'Donations directly fund annual scholarships for Oklahoma geoscience students.',
  },
];

const presets = [10, 25, 50, 100, 250, 500];

export default function DonatePage() {
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState('');
  const [monthly, setMonthly] = useState(false);
  const [payment, setPayment] = useState('card');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  const finalAmount = custom ? Number(custom) : amount;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1400);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-200 max-w-lg w-full animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-teal-600 fill-teal-200" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3">Thank You!</h2>
          <p className="text-slate-500 leading-relaxed mb-3">
            Your {monthly ? 'monthly' : 'one-time'} donation of{' '}
            <strong className="text-teal-600">${finalAmount}</strong> has been received.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            A receipt will be sent to <strong>{donorEmail || 'your email'}</strong>. 
            As a 501(c)(3) organization, your contribution may be tax-deductible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-teal inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm">
              <span>Back to Home</span>
            </Link>
            <Link to="/membership" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-teal-600 text-sm border border-teal-500 hover:bg-teal-500 hover:text-white transition-all">
              Join GST <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-slate-300">Donate</span>
          </div>
          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">Support GST</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Support Our Community</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Your generosity helps the Geophysical Society of Tulsa deliver exceptional programming,
            fund student scholarships, and grow the next generation of geophysicists.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Your Impact</h2>
              <div className="space-y-5">
                {impactItems.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact tiers */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 text-sm">Donation Impact Guide</h3>
              <div className="space-y-3">
                {[
                  { amount: '$25', desc: 'Covers AV equipment for one luncheon' },
                  { amount: '$50', desc: 'Sponsors a student\'s luncheon attendance' },
                  { amount: '$100', desc: 'Contributes to a scholarship award' },
                  { amount: '$250', desc: 'Funds a full luncheon speaker honorarium' },
                  { amount: '$500+', desc: 'Named recognition in annual GST report' },
                ].map(({ amount: a, desc }) => (
                  <div key={a} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-teal-600" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-teal-700">{a} — </span>
                      <span className="text-sm text-slate-500">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax note */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <p className="text-sm font-bold text-teal-800 mb-1">Tax-Deductible Giving</p>
              <p className="text-sm text-teal-700 leading-relaxed">
                GST is a 501(c)(3) non-profit organization. All donations are tax-deductible 
                to the extent permitted by law. EIN available upon request.
              </p>
            </div>
          </div>

          {/* Donation form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-7">
              {/* Monthly toggle */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMonthly(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${!monthly ? 'bg-white shadow text-slate-800 border border-slate-200' : 'text-slate-400'}`}
                >
                  One-Time
                </button>
                <button
                  type="button"
                  onClick={() => setMonthly(true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${monthly ? 'bg-teal-500 shadow text-white' : 'text-slate-400'}`}
                >
                  Monthly ♻
                </button>
              </div>

              {/* Amount presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setAmount(p); setCustom(''); }}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                        amount === p && !custom
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:border-teal-300'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                {/* Custom */}
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="donate-custom"
                    type="number"
                    min="1"
                    placeholder="Custom amount"
                    value={custom}
                    onChange={(e) => { setCustom(e.target.value); setAmount(0); }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Donor info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donor-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Your Name</label>
                  <input id="donor-name" type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Jane Smith" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
                </div>
                <div>
                  <label htmlFor="donor-email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                  <input id="donor-email" type="email" required value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="jane@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Payment Method</label>
                <div className="flex gap-3">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'paypal', label: 'PayPal', icon: DollarSign },
                    { id: 'check', label: 'Check / Invoice', icon: CheckCircle },
                  ].map(({ id, label, icon: Icon }) => (
                    <label
                      key={id}
                      htmlFor={`pay-${id}`}
                      className={`flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        payment === id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <input type="radio" id={`pay-${id}`} name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} className="sr-only" />
                      <Icon className={`w-5 h-5 ${payment === id ? 'text-teal-600' : 'text-slate-400'}`} />
                      <span className={`text-xs font-semibold ${payment === id ? 'text-teal-700' : 'text-slate-500'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">{monthly ? 'Monthly' : 'One-time'} donation</span>
                  <span className="font-black text-slate-800 text-lg">${finalAmount > 0 ? finalAmount : '—'}</span>
                </div>
                <p className="text-xs text-slate-400">Processing fee (2.9% + $0.30) covered by GST</p>
              </div>

              {/* Submit */}
              <button
                id="donate-submit"
                type="submit"
                disabled={loading || finalAmount <= 0}
                className="btn-teal w-full py-4 rounded-xl font-black text-white text-base flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-500/20"
              >
                <span className="flex items-center gap-2">
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><Heart className="w-5 h-5 fill-white/30" /> Donate ${finalAmount > 0 ? finalAmount : '—'}{monthly ? '/mo' : ''}</>
                  )}
                </span>
              </button>

              <p className="text-center text-xs text-slate-400">
                🔒 Secure donation. GST is a registered 501(c)(3) non-profit.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
