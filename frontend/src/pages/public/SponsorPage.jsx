import React, { useState } from 'react';
import { 
  Award, Target, Users, Globe, Check, ArrowRight, 
  Building2, Send, CheckCircle, ShieldCheck, Sparkles, BarChart
} from 'lucide-react';

const tiers = [
  {
    name: 'Bronze',
    price: '$500',
    color: 'from-amber-600 to-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    features: ['Logo on website', 'Logo in monthly newsletter', '1 complimentary luncheon ticket']
  },
  {
    name: 'Silver',
    price: '$1,000',
    color: 'from-slate-300 to-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-700',
    features: ['All Bronze features', 'Quarterly social media feature', 'Logo on event signage', '2 complimentary luncheon tickets']
  },
  {
    name: 'Gold',
    price: '$2,500',
    color: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    popular: true,
    features: ['All Silver features', 'Short speaking slot at one luncheon', 'Logo on all technical talk slides', '5 complimentary luncheon tickets']
  },
  {
    name: 'Platinum',
    price: '$5,000',
    color: 'from-teal-400 to-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    features: ['All Gold features', 'Prime logo placement on homepage', 'Dedicated "Sponsor Spotlight" article', '10 complimentary luncheon tickets']
  }
];

const benefits = [
  { icon: Target, title: 'Targeted Audience', desc: 'Reach 500+ geophysical professionals and decision-makers in the Tulsa energy sector.' },
  { icon: Users, title: 'Community Support', desc: 'Directly fund student scholarships and continuing education programs for the next generation.' },
  { icon: Globe, title: 'Brand Visibility', desc: 'Gain high-profile exposure through our digital platforms, newsletters, and monthly in-person events.' },
  { icon: BarChart, title: 'Industry Growth', desc: 'Participate in the dialogue that shapes the future of geophysical exploration in the region.' },
];

export default function SponsorPage() {
  const [form, setForm] = useState({ company: '', contact: '', email: '', phone: '', tier: 'Gold', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all";
  const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-4 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-950/50" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-teal-400 text-sm font-bold tracking-[0.3em] uppercase mb-6">Partner with GST</p>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">
            Empower the Future of<br />
            <span className="gradient-text">Geophysical Science</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            Join a network of leading energy companies and service providers supporting scientific excellence in Tulsa since 1947.
          </p>
          <div className="flex justify-center">
             <button onClick={() => document.getElementById('enquiry-form').scrollIntoView({ behavior: 'smooth' })} className="btn-teal px-10 py-4 rounded-xl text-white font-bold text-sm shadow-xl shadow-teal-500/20">
               <span>Become a Sponsor</span>
             </button>
          </div>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group hover:border-teal-500/30 transition-all duration-300">
               <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                  <b.icon className="w-6 h-6 text-teal-600 transition-colors" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 mb-3">{b.title}</h3>
               <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="py-24 px-4 bg-slate-100 relative">
        <div className="absolute inset-0 seismic-pattern opacity-5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Sponsorship <span className="gradient-text">Tiers</span></h2>
            <p className="text-slate-500">Choose a partnership level that aligns with your organization's goals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div key={tier.name} className={`bg-white rounded-[2.5rem] p-8 border-2 flex flex-col transition-all duration-300 ${tier.popular ? 'border-teal-500 shadow-2xl shadow-teal-500/10 scale-105 z-10' : 'border-white shadow-sm hover:border-slate-200'}`}>
                {tier.popular && (
                   <span className="bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4 mx-auto">Most Popular</span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">{tier.name}</h3>
                <p className="text-3xl font-black text-teal-600 mb-6">{tier.price}<span className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">/ Year</span></p>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
                      <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => { setForm({...form, tier: tier.name}); document.getElementById('enquiry-form').scrollIntoView({ behavior: 'smooth' }); }}
                  className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${tier.popular ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'}`}
                >
                  Select {tier.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enquiry Form ── */}
      <section id="enquiry-form" className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="section-heading mb-8">
              <h2 className="text-4xl font-black text-slate-900">Sponsorship Enquiry</h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Interested in becoming a GST sponsor? Please fill out the form, and a member of our Executive Committee will contact you to discuss your partnership.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: 'Direct Impact', desc: 'Your sponsorship goes 100% towards society operations and student chapter funding.' },
                { icon: Building2, title: 'Corporate Presence', desc: 'Join industry giants like ExxonMobil, Chevron, and local Tulsa energy leaders.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                   <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-teal-600" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            {submitted ? (
              <div className="py-16 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-10 h-10 text-teal-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3">Enquiry Received!</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Thank you for your interest in supporting GST. Our Sponsorship Chair will reach out to you within 48 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="mt-8 btn-outline-teal px-8 py-3 rounded-xl font-bold text-sm">
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Company Name</label>
                    <input required className={inputCls} placeholder="Energy Corp Inc." value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Person</label>
                    <input required className={inputCls} placeholder="Jane Smith" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Work Email</label>
                    <input required type="email" className={inputCls} placeholder="jane@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input required className={inputCls} placeholder="+1 (918) 555-0100" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Tier of Interest</label>
                  <select 
                    className={inputCls + " cursor-pointer bg-white"} 
                    value={form.tier} 
                    onChange={e => setForm({...form, tier: e.target.value})}
                  >
                    {tiers.map(t => <option key={t.name} value={t.name}>{t.name} Partnership ({t.price})</option>)}
                    <option value="Custom">Custom / Event Specific</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Enquiry Message</label>
                  <textarea rows={4} className={inputCls + " resize-none"} placeholder="Tell us more about your sponsorship goals..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                </div>
                <button type="submit" className="w-full btn-teal px-8 py-4 rounded-xl text-white font-bold text-sm shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2">
                  <span>Send Enquiry</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
            <div className="absolute inset-0 seismic-pattern opacity-5 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Footer Stats ── */}
      <section className="py-16 bg-slate-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-10" />
        <div className="max-w-4xl mx-auto relative z-10 px-4">
           <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-teal-400" />
              <h3 className="text-xl font-bold text-white">Join 20+ Leading Industry Partners</h3>
           </div>
           <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="font-black text-2xl text-white tracking-tighter">EXXONMOBIL</span>
              <span className="font-black text-2xl text-white tracking-tighter">CHEVRON</span>
              <span className="font-black text-2xl text-white tracking-tighter">CONOCOPHILLIPS</span>
              <span className="font-black text-2xl text-white tracking-tighter">HALLIBURTON</span>
           </div>
        </div>
      </section>
    </div>
  );
}
