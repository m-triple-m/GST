import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import {
  User, Briefcase, ChevronRight,
  Check, ArrowRight, Award, FileText, Send, CheckCircle
} from 'lucide-react';
import {
  TIERS, INITIAL_FORM,
  EMAIL_RE, PHONE_RE, URL_RE,
  EXPERIENCE_OPTIONS, INDUSTRY_OPTIONS,
} from './membership.config';

const steps = ['Personal Info', 'Professional', 'Membership Tier', 'Review'];



/** Inline error helper */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

export default function MembershipPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(INITIAL_FORM);

  /** Clear the error for a field on every change */
  const update = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  /** Run all validations for the current step. Returns true if valid. */
  const validateStep = () => {
    const next = {};

    if (step === 0) {
      if (!form.firstName.trim()) next.firstName = 'First name is required.';
      if (!form.lastName.trim()) next.lastName = 'Last name is required.';
      if (!form.email.trim()) {
        next.email = 'Email address is required.';
      } else if (!EMAIL_RE.test(form.email.trim())) {
        next.email = 'Please enter a valid email address.';
      }
      if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) {
        next.phone = 'Please enter a valid phone number.';
      }
      if (form.linkedin.trim() && !URL_RE.test(form.linkedin.trim())) {
        next.linkedin = 'Please enter a valid LinkedIn URL.';
      }
    }

    if (step === 1) {
      if (form.company.trim().length > 255) next.company = 'Company name must be 255 characters or fewer.';
      if (form.title.trim().length > 255) next.title = 'Job title must be 255 characters or fewer.';
    }

    // step 2 (tier) always has a default, nothing to validate

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /**
   * Checks if an email already exists via a dedicated endpoint.
   * Fails open: any error (404 not implemented, 401 auth required,
   * network failure, etc.) is treated as "can't verify → skip → let user proceed".
   *
   * @param {string} email
   * @returns {Promise<boolean>} - true only when server explicitly confirms the email exists
   */
  const checkEmailExists = async (email) => {
    try {
      const { data } = await api.get(`/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      return data?.data?.exists === true;
    } catch {
      return false; // any error (404, 401, network) → skip the check, don't block the form
    }
  };

  const handleNextStep = async () => {
    // Run local validation first
    if (!validateStep()) return;

    // Extra async email-exists check only on step 0
    // checkEmailExists is fail-open and never throws — any error → returns false → user proceeds
    if (step === 0) {
      setEmailChecking(true);
      const exists = await checkEmailExists(form.email);
      setEmailChecking(false);
      if (exists) {
        setErrors((e) => ({ ...e, email: 'This email is already registered. Please use a different email or log in.' }));
        return;
      }
    }
    setStep((s) => s + 1);
  };


  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data } = await api.post('/members/apply', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        linkedin_url: form.linkedin || undefined,
        company: form.company || undefined,
        job_title: form.title || undefined,
        experience: form.experience || undefined,
        industry: form.industry || undefined,
        motivation: form.motivation || undefined,
        referred: form.referral,
        tier: form.tier,
      });
      if (data?.data?.defaultPassword) setDefaultPassword(data.data.defaultPassword);
      setSubmitted(true);
    } catch (error) {
      const message = error.response?.data?.message || 'Submission failed. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-200 max-w-lg w-full animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-11 h-11 text-teal-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3">Application Submitted!</h2>
          <p className="text-slate-500 leading-relaxed mb-6">
            Thank you, <strong>{form.firstName}</strong>! Your GST membership application has been received.
            We'll review it and send confirmation to <strong>{form.email}</strong> within 2–3 business days.
          </p>

          {/* Default password callout */}
          {defaultPassword && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left">
              <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">🔑 Your Temporary Login Password</p>
              <p className="font-mono text-lg font-black text-amber-900 tracking-wider mb-2">{defaultPassword}</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Use this password with your email <strong>{form.email}</strong> to log in once your application is approved.
                Please change it immediately after your first login.
              </p>
            </div>
          )}

          <Link to="/" className="btn-teal inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm">
            <span className="flex items-center gap-2">Back to Home <ArrowRight className="w-4 h-4" /></span>
          </Link>
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
          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-3">Join the Community</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Membership Application</h1>
          <p className="text-slate-400 text-lg max-w-xl">Become part of Tulsa's premier geophysical society — founded 1947.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${i < step
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : i === step
                        ? 'border-teal-500 text-teal-600 bg-white'
                        : 'border-slate-300 text-slate-400 bg-white'
                    }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium hidden sm:block ${i === step ? 'text-teal-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${i < step ? 'bg-teal-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-500" /> Personal Profile
            </h2>
            <p className="text-slate-400 text-sm mb-6">Tell us about yourself</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label htmlFor="member-firstName" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">First Name *</label>
                <input
                  id="member-firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  placeholder="Jane"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${errors.firstName ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-500'
                    }`}
                />
                <FieldError msg={errors.firstName} />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="member-lastName" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Last Name *</label>
                <input
                  id="member-lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  placeholder="Smith"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${errors.lastName ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-500'
                    }`}
                />
                <FieldError msg={errors.lastName} />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label htmlFor="member-email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                <div className="relative">
                  <input
                    id="member-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="jane.smith@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-500'
                      }`}
                  />
                  {emailChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-teal-400/40 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <FieldError msg={errors.email} />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="member-phone" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Phone</label>
                <input
                  id="member-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="(918) 555-0100"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-500'
                    }`}
                />
                <FieldError msg={errors.phone} />
              </div>

              {/* LinkedIn */}
              <div>
                <label htmlFor="member-linkedin" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">LinkedIn Profile</label>
                <input
                  id="member-linkedin"
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => update('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/yourprofile"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${errors.linkedin ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-500'
                    }`}
                />
                <FieldError msg={errors.linkedin} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Professional */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-500" /> Professional Background
            </h2>
            <p className="text-slate-400 text-sm mb-6">Help us understand your professional context</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="member-company" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Company / Institution</label>
                  <input
                    id="member-company"
                    type="text"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder="Acme Energy"
                    className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${errors.company ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-500'
                      }`}
                  />
                  <FieldError msg={errors.company} />
                </div>
                <div>
                  <label htmlFor="member-title" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Job Title</label>
                  <input
                    id="member-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="Exploration Geophysicist"
                    className={`w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:ring-teal-500/30 focus:border-teal-500'
                      }`}
                  />
                  <FieldError msg={errors.title} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="member-exp" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Years of Experience</label>
                  <select id="member-exp" value={form.experience} onChange={(e) => update('experience', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white transition-all">
                    <option value="">Select...</option>
                    {EXPERIENCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="member-industry" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Primary Industry</label>
                  <select id="member-industry" value={form.industry} onChange={(e) => update('industry', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white transition-all">
                    <option value="">Select...</option>
                    {INDUSTRY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="member-motivation" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Why do you want to join GST?</label>
                <textarea id="member-motivation" rows={4} value={form.motivation} onChange={(e) => update('motivation', e.target.value)} placeholder="Share your interest in GST and what you hope to contribute or gain..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none" />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.referral} onChange={(e) => update('referral', e.target.checked)} className="w-4 h-4 mt-0.5 accent-teal-500" />
                <span className="text-sm text-slate-600">I was referred by a current GST member</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Tier */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-500" /> Select Membership Tier
            </h2>
            <p className="text-slate-400 text-sm mb-6">Choose the tier that best fits your situation</p>
            <div className="space-y-4">
              {TIERS.map((tier) => (
                <label
                  key={tier.id}
                  htmlFor={`tier-${tier.id}`}
                  className={`block cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 ${form.tier === tier.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-teal-300'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      id={`tier-${tier.id}`}
                      name="tier"
                      value={tier.id}
                      checked={form.tier === tier.id}
                      onChange={() => update('tier', tier.id)}
                      className="mt-1 accent-teal-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-800 text-lg">{tier.name}</h3>
                        {tier.popular && (
                          <span className="px-2.5 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-full">Most Popular</span>
                        )}
                        <span className="ml-auto font-black text-teal-600 text-lg">{tier.price}</span>
                      </div>
                      <p className="text-slate-500 text-sm mb-3">{tier.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {tier.features.map((f) => (
                          <span key={f} className="flex items-center gap-1 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                            <Check className="w-3 h-3 text-teal-500" />{f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" /> Review Your Application
            </h2>
            <p className="text-slate-400 text-sm mb-6">Please review before submitting</p>
            <div className="space-y-4">
              {[
                { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                { label: 'Email', value: form.email },
                { label: 'Company', value: form.company || '—' },
                { label: 'Title', value: form.title || '—' },
                { label: 'Industry', value: form.industry || '—' },
                { label: 'Experience', value: form.experience || '—' },
                { label: 'Membership Tier', value: TIERS.find((t) => t.id === form.tier)?.name },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-400 font-medium">{label}</span>
                  <span className="text-sm text-slate-800 font-semibold text-right max-w-xs">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100 text-sm text-teal-700">
              By submitting, you agree to GST's membership terms and code of conduct.
              You'll receive a confirmation email with next steps for payment.
            </div>
          </div>
        )}

        {/* Submit error */}
        {submitError && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700 font-medium flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              disabled={emailChecking}
              className="btn-teal px-8 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {emailChecking && step === 0 ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Checking email…
                </span>
              ) : (
                <span className="flex items-center gap-2">Next Step <ChevronRight className="w-4 h-4" /></span>
              )}
            </button>
          ) : (
            <button
              id="membership-submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-teal px-8 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Submit Application</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
