import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, ExternalLink, Globe, Link2 } from 'lucide-react';
import api from '../../api';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Mailing Address',
    value: 'Geophysical Society of Tulsa\nP.O. Box 4508\nTulsa, OK 74159',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'president@gs-tulsa.org',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (918) 555-0100',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all";
  const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <section className="relative pt-32 pb-16 px-4 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <p className="text-teal-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Contact Us</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Get in <span className="gradient-text">Touch</span></h1>
          <p className="text-slate-400 max-w-xl mx-auto">Have questions about membership, upcoming events, or sponsorships? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
          
          {/* ── Left Column: Info ── */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-8">Contact Information</h2>
              <div className="space-y-8">
                {contactInfo.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm text-slate-700 font-semibold whitespace-pre-line leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-100 my-10" />

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Social Media</h3>
              <div className="flex gap-3">
                {[
                  { icon: Link2, url: '#' },
                  { icon: ExternalLink, url: '#' },
                  { icon: Globe, url: 'https://gs-tulsa.org' },
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url} 
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-500/30 hover:bg-teal-50 transition-all"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-teal-600 p-8 rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute inset-0 seismic-pattern opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">Newsletter</h3>
                <p className="text-teal-50 text-sm mb-6 leading-relaxed">Subscribe to the GST monthly email for event updates and technical bulletins.</p>
                <div className="flex gap-2">
                  <input placeholder="Email" className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none" />
                  <button className="bg-white text-teal-600 p-2.5 rounded-xl hover:scale-105 transition-all"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Form ── */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              {submitted ? (
                <div className="py-20 text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-teal-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-3">Message Sent!</h2>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Thank you, <strong>{form.name}</strong>. We've received your inquiry and a board member will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-10 btn-outline-teal px-8 py-3 rounded-xl font-bold text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="section-heading mb-10">
                    <h2 className="text-2xl font-black text-slate-900">Send us a Message</h2>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelCls}>Your Name *</label>
                        <input 
                          required 
                          className={inputCls} 
                          placeholder="Jane Doe" 
                          value={form.name} 
                          onChange={e => setForm({...form, name: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Email Address *</label>
                        <input 
                          required 
                          type="email" 
                          className={inputCls} 
                          placeholder="jane@example.com" 
                          value={form.email} 
                          onChange={e => setForm({...form, email: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Subject *</label>
                      <input 
                        required 
                        className={inputCls} 
                        placeholder="Membership Inquiry" 
                        value={form.subject} 
                        onChange={e => setForm({...form, subject: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Message *</label>
                      <textarea 
                        required 
                        rows={6} 
                        className={inputCls + " resize-none"} 
                        placeholder="How can we help you today?" 
                        value={form.message} 
                        onChange={e => setForm({...form, message: e.target.value})} 
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-teal px-8 py-4 rounded-xl text-white font-bold text-sm shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Map Placeholder */}
            <div className="mt-10 bg-slate-200 rounded-[2.5rem] h-80 relative overflow-hidden group border border-slate-200">
               <img 
                 src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80" 
                 className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                 alt="Tulsa Map"
               />
               <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <a 
                   href="https://www.google.com/maps/place/Tulsa,+OK" 
                   target="_blank" 
                   rel="noreferrer"
                   className="bg-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold text-slate-800 text-sm hover:bg-teal-600 hover:text-white transition-all group/link"
                 >
                   <MapPin className="w-4 h-4 text-teal-600 group-hover/link:text-white" />
                   View on Google Maps
                 </a>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
