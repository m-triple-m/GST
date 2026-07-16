import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';
import api from '../api';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/contact', formState);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-50 seismic-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-teal-600 text-sm font-semibold tracking-widest uppercase mb-3">
            Get In Touch
          </p>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Contact Us</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Have questions about membership, events, or sponsorship? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Contact Information</h3>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    label: 'Mailing Address',
                    lines: ['Geophysical Society of Tulsa', 'P.O. Box 2784', 'Tulsa, OK 74101'],
                  },
                  {
                    icon: Mail,
                    label: 'Email',
                    lines: ['info@gst-tulsa.org'],
                  },
                  {
                    icon: Phone,
                    label: 'Via Wild Apricot',
                    lines: ['gst.wildapricot.org/Contact'],
                  },
                ].map(({ icon: Icon, label, lines }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                      {lines.map((line) => (
                        <p key={line} className="text-slate-700 text-sm font-medium">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-52 relative bg-slate-200">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100">
                <MapPin className="w-8 h-8 text-teal-500" />
                <p className="text-sm font-semibold text-slate-600">Tulsa, Oklahoma</p>
                <p className="text-xs text-slate-400">The Energy Capital of the World</p>
                <a
                  href="https://maps.google.com/?q=Tulsa,+OK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-teal-600 hover:underline font-medium"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-9 h-9 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                <p className="text-slate-500 max-w-sm">
                  Thank you for reaching out. A member of the GST team will get back to you shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 px-6 py-3 rounded-xl border border-teal-500 text-teal-600 font-semibold text-sm hover:bg-teal-500 hover:text-white transition-all duration-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-6">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 font-medium">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    required
                    value={formState.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Select a topic...</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="events">Events &amp; Sponsorship</option>
                    <option value="speaking">Speaking Opportunity</option>
                    <option value="scholarship">Student Scholarships</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 resize-none"
                  />
                </div>
                <button
                  id="contact-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-teal w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-teal-500/20"
                >
                  <span className="flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
