import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api';
import {
  User, Briefcase, GraduationCap, Award, FileText,
  Send, CheckCircle, Loader2, Plus, Trash2, Check,
  ChevronRight, ShieldCheck, MapPin, Building, Phone, Mail
} from 'lucide-react';
import {
  TIERS as STATIC_TIERS, INITIAL_FORM,
  EMAIL_RE, PHONE_RE, SEG_STATUS_OPTIONS
} from './membership.config';

const steps = ['Personal & Home', 'Company & Work', 'Education & Societies', 'Membership Tier', 'Review'];

/** Inline error helper */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

export default function MembershipPage() {
  const [searchParams] = useSearchParams();
  const urlTier = searchParams.get('tier');
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    tier: urlTier && ['student', 'professional', 'corporate'].includes(urlTier.toLowerCase())
      ? urlTier.toLowerCase()
      : INITIAL_FORM.tier,
  }));
  const [tiers, setTiers] = useState(STATIC_TIERS);
  const [tiersLoading, setTiersLoading] = useState(true);

  /** Fetch live tier prices set by the super admin from /settings */
  useEffect(() => {
    const fetchTierPrices = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data?.data) {
          const settings = data.data;
          setTiers(STATIC_TIERS.map((tier) => {
            const rawPrice = settings[`tier_${tier.id}_price`];
            if (rawPrice !== undefined && rawPrice !== '' && rawPrice !== null) {
              const numeric = parseFloat(rawPrice);
              const formatted = isNaN(numeric)
                ? rawPrice
                : numeric === 0
                  ? 'Free'
                  : numeric % 1 === 0
                    ? `$${numeric.toFixed(0)}/yr`
                    : `$${numeric.toFixed(2)}/yr`;
              return { ...tier, price: formatted };
            }
            return tier;
          }));
        }
      } catch {
        // Fail open
      } finally {
        setTiersLoading(false);
      }
    };
    fetchTierPrices();
  }, []);

  /** Update regular form fields */
  const update = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  /** Update dynamic education array */
  const updateEducation = (index, field, val) => {
    setForm((f) => {
      const updated = [...(f.education || [])];
      updated[index] = { ...updated[index], [field]: val };
      return { ...f, education: updated };
    });
  };

  const addEducation = () => {
    setForm((f) => ({
      ...f,
      education: [...(f.education || []), { university: '', degree: '', major: '' }]
    }));
  };

  const removeEducation = (index) => {
    setForm((f) => ({
      ...f,
      education: f.education.filter((_, i) => i !== index)
    }));
  };

  /** Run validations for the current step */
  const validateStep = () => {
    const next = {};

    // Step 0: Personal & Home
    if (step === 0) {
      if (!form.firstName?.trim()) next.firstName = 'First name is required.';
      if (!form.lastName?.trim()) next.lastName = 'Last name is required.';
      if (!form.email?.trim()) {
        next.email = 'Email address is required.';
      } else if (!EMAIL_RE.test(form.email.trim())) {
        next.email = 'Please enter a valid email address.';
      }
      if (!form.phone?.trim()) {
        next.phone = 'Phone number is required.';
      } else if (!PHONE_RE.test(form.phone.trim())) {
        next.phone = 'Please enter a valid phone number (min 7 digits).';
      }
      if (!form.homeStreet?.trim()) next.homeStreet = 'Home street address is required.';
      if (!form.homeCity?.trim()) next.homeCity = 'Home city is required.';
      if (!form.homeState?.trim()) next.homeState = 'Home state is required.';
      if (!form.homeZip?.trim()) next.homeZip = 'Home ZIP code is required.';
    }

    // Step 1: Company & Work
    if (step === 1) {
      if (!form.companyName?.trim()) next.companyName = 'Company name is required.';
      if (!form.jobTitle?.trim()) next.jobTitle = 'Job title is required.';
      if (!form.companyPhone?.trim()) {
        next.companyPhone = 'Company phone number is required.';
      } else if (!PHONE_RE.test(form.companyPhone.trim())) {
        next.companyPhone = 'Please enter a valid company phone number.';
      }
      if (!form.companyStreet?.trim()) next.companyStreet = 'Company street address is required.';
      if (!form.companyCity?.trim()) next.companyCity = 'Company city is required.';
      if (!form.companyState?.trim()) next.companyState = 'Company state is required.';
      if (!form.companyZip?.trim()) next.companyZip = 'Company ZIP code is required.';
    }

    // Step 2: Education, Societies & Privacy Policy
    if (step === 2) {
      if (!form.segStatus) next.segStatus = 'SEG status is required.';
      const firstEdu = form.education?.[0] || {};
      if (!firstEdu.university?.trim()) next.edu_0_university = 'University / College is required for primary degree.';
      if (!firstEdu.degree?.trim()) next.edu_0_degree = 'Degree level is required for primary degree.';
      if (!firstEdu.major?.trim()) next.edu_0_major = 'Major / Field of study is required for primary degree.';
      if (!form.privacyPolicy) {
        next.privacyPolicy = 'You must agree to the GST Privacy Policy and Membership Terms to continue.';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const checkEmailExists = async (email) => {
    try {
      const { data } = await api.get(`/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      return data?.data?.exists === true;
    } catch {
      return false;
    }
  };

  const handleNextStep = async () => {
    if (!validateStep()) return;

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
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        nickname: form.nickname || undefined,
        email: form.email,
        phone: form.phone || undefined,
        homeStreet: form.homeStreet || undefined,
        homeCity: form.homeCity || undefined,
        homeState: form.homeState || undefined,
        homeZip: form.homeZip || undefined,
        privacyPolicy: form.privacyPolicy,

        companyName: form.companyName || undefined,
        companyStreet: form.companyStreet || undefined,
        companyCity: form.companyCity || undefined,
        companyState: form.companyState || undefined,
        companyZip: form.companyZip || undefined,
        companyPhone: form.companyPhone || undefined,
        boardPosition: form.boardPosition || undefined,
        jobTitle: form.jobTitle || undefined,

        segStatus: form.segStatus || 'non-member',
        tgsMember: form.tgsMember,
        education: (form.education || []).filter(e => e.university?.trim() || e.degree?.trim() || e.major?.trim()),

        tier: form.tier,
      };

      const { data } = await api.post('/members/apply', payload);
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
        <div className="bg-white rounded-3xl p-10 sm:p-12 shadow-xl border border-slate-200 max-w-lg w-full animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-11 h-11 text-teal-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Application Submitted!</h2>
          <p className="text-slate-600 leading-relaxed mb-6 text-sm">
            Thank you, <strong>{form.firstName}</strong>! Your GST membership application has been successfully recorded.
            We will review your submission and confirm your membership at <strong>{form.email}</strong>.
          </p>

          {defaultPassword && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left">
              <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span>🔑</span> Temporary Login Password
              </p>
              <p className="font-mono text-lg font-black text-amber-950 tracking-wider mb-2">{defaultPassword}</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Use your email <strong>{form.email}</strong> and this password to access the Member Dashboard once approved.
              </p>
            </div>
          )}

          <Link to="/" className="btn-teal inline-flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-md">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Hero ── */}
      <div className="bg-slate-900 pt-28 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-2">Join Our Society</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3">Membership Application</h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Join the Geophysical Society of Tulsa — supporting geoscience innovation and professional networking since 1947.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none min-w-[120px]">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                    i < step
                      ? 'bg-teal-500 border-teal-500 text-white shadow-sm'
                      : i === step
                        ? 'border-teal-500 text-teal-600 bg-white ring-4 ring-teal-500/10'
                        : 'border-slate-300 text-slate-400 bg-white'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[11px] mt-1.5 font-bold whitespace-nowrap ${i === step ? 'text-teal-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${i < step ? 'bg-teal-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Personal & Home Address ── */}
        {step === 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Personal &amp; Contact Information</h2>
                <p className="text-xs text-slate-400">Please provide your personal details and residential address. Fields marked with * are mandatory.</p>
              </div>
            </div>

            {/* Names & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">First Name *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  placeholder="e.g. Jane"
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.firstName ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
                <FieldError msg={errors.firstName} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Last Name *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  placeholder="e.g. Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.lastName ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
                <FieldError msg={errors.lastName} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nickname / Preferred (Optional)</label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => update('nickname', e.target.value)}
                  placeholder="e.g. Janie"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="jane.doe@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  {emailChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    </div>
                  )}
                </div>
                <FieldError msg={errors.email} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="(918) 555-0199"
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
                <FieldError msg={errors.phone} />
              </div>
            </div>

            {/* Home Address Section */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> Home Address
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home Street Address *</label>
                <input
                  type="text"
                  value={form.homeStreet}
                  onChange={(e) => update('homeStreet', e.target.value)}
                  placeholder="1234 S Boulder Ave, Apt 5"
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.homeStreet ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
                <FieldError msg={errors.homeStreet} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home City *</label>
                  <input
                    type="text"
                    value={form.homeCity}
                    onChange={(e) => update('homeCity', e.target.value)}
                    placeholder="Tulsa"
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.homeCity ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  <FieldError msg={errors.homeCity} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home State *</label>
                  <input
                    type="text"
                    value={form.homeState}
                    onChange={(e) => update('homeState', e.target.value)}
                    placeholder="OK"
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.homeState ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  <FieldError msg={errors.homeState} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Home ZIP Code *</label>
                  <input
                    type="text"
                    value={form.homeZip}
                    onChange={(e) => update('homeZip', e.target.value)}
                    placeholder="74119"
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.homeZip ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  <FieldError msg={errors.homeZip} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Company & Work Details ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Company &amp; Professional Details</h2>
                <p className="text-xs text-slate-400">Information about your current employer, position, and office location. Fields marked with * are mandatory.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company Name *</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => update('companyName', e.target.value)}
                  placeholder="e.g. Williams Companies"
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.companyName ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
                <FieldError msg={errors.companyName} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Job Title *</label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => update('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Geophysicist"
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.jobTitle ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
                <FieldError msg={errors.jobTitle} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Board Position (Optional)</label>
                <input
                  type="text"
                  value={form.boardPosition}
                  onChange={(e) => update('boardPosition', e.target.value)}
                  placeholder="e.g. Committee Member"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company Phone *</label>
              <input
                type="tel"
                value={form.companyPhone}
                onChange={(e) => update('companyPhone', e.target.value)}
                placeholder="(918) 573-2000"
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.companyPhone ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
              <FieldError msg={errors.companyPhone} />
            </div>

            {/* Company Address */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-600" /> Company Address
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company Street Address *</label>
                <input
                  type="text"
                  value={form.companyStreet}
                  onChange={(e) => update('companyStreet', e.target.value)}
                  placeholder="One Williams Center, Suite 2800"
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.companyStreet ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
                <FieldError msg={errors.companyStreet} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company City *</label>
                  <input
                    type="text"
                    value={form.companyCity}
                    onChange={(e) => update('companyCity', e.target.value)}
                    placeholder="Tulsa"
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.companyCity ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  <FieldError msg={errors.companyCity} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company State *</label>
                  <input
                    type="text"
                    value={form.companyState}
                    onChange={(e) => update('companyState', e.target.value)}
                    placeholder="OK"
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.companyState ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  <FieldError msg={errors.companyState} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company ZIP Code *</label>
                  <input
                    type="text"
                    value={form.companyZip}
                    onChange={(e) => update('companyZip', e.target.value)}
                    placeholder="74172"
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.companyZip ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                    }`}
                  />
                  <FieldError msg={errors.companyZip} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Education & Societies ── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Education &amp; Society Affiliations</h2>
                <p className="text-xs text-slate-400">SEG status, Tulsa Geological Society membership, and academic degrees. Primary degree is mandatory.</p>
              </div>
            </div>

            {/* SEG Status & TGS Membership */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  SEG Status (Society of Exploration Geophysicists) *
                </label>
                <select
                  value={form.segStatus}
                  onChange={(e) => update('segStatus', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 transition-all ${
                    errors.segStatus ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                >
                  {SEG_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.segStatus} />
              </div>

              <div className="flex flex-col justify-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tulsa Geological Society (TGS)
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.tgsMember}
                    onChange={(e) => update('tgsMember', e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Current active member of Tulsa Geological Society (TGS)
                  </span>
                </label>
              </div>
            </div>

            {/* Education Records (Multi-entry) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-teal-600" /> Education &amp; Degrees
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Primary degree (#1) is mandatory; subsequent degrees are optional.</p>
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Additional Degree
                </button>
              </div>

              {(form.education || []).map((edu, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-teal-700 uppercase tracking-wider">
                        Degree #{idx + 1} {isPrimary ? '(Primary - Required *)' : '(Additional - Optional)'}
                      </span>
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => removeEducation(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                          title="Remove this degree"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          University / Institution {isPrimary && '*'}
                        </label>
                        <input
                          type="text"
                          value={edu.university}
                          onChange={(e) => {
                            updateEducation(idx, 'university', e.target.value);
                            if (isPrimary) setErrors((err) => ({ ...err, edu_0_university: '' }));
                          }}
                          placeholder="e.g. University of Tulsa"
                          className={`w-full px-3.5 py-2 rounded-xl border bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                            isPrimary && errors.edu_0_university ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                          }`}
                        />
                        {isPrimary && <FieldError msg={errors.edu_0_university} />}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Degree {isPrimary && '*'}
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            updateEducation(idx, 'degree', e.target.value);
                            if (isPrimary) setErrors((err) => ({ ...err, edu_0_degree: '' }));
                          }}
                          placeholder="e.g. B.S., M.S., Ph.D."
                          className={`w-full px-3.5 py-2 rounded-xl border bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                            isPrimary && errors.edu_0_degree ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                          }`}
                        />
                        {isPrimary && <FieldError msg={errors.edu_0_degree} />}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Major / Field {isPrimary && '*'}
                        </label>
                        <input
                          type="text"
                          value={edu.major}
                          onChange={(e) => {
                            updateEducation(idx, 'major', e.target.value);
                            if (isPrimary) setErrors((err) => ({ ...err, edu_0_major: '' }));
                          }}
                          placeholder="e.g. Geophysics"
                          className={`w-full px-3.5 py-2 rounded-xl border bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                            isPrimary && errors.edu_0_major ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50' : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                          }`}
                        />
                        {isPrimary && <FieldError msg={errors.edu_0_major} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Permissions, Consents & Privacy Preferences */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> Permissions &amp; Privacy Preferences
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage your communication consent, directory visibility, and terms agreement.
                </p>
              </div>

              {/* Mandatory Terms Agreement */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 hover:bg-teal-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.privacyPolicy}
                    onChange={(e) => update('privacyPolicy', e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-teal-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Privacy Policy &amp; Terms Agreement <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5 leading-relaxed">
                      I agree to the Geophysical Society of Tulsa (GST) Constitution, Bylaws, Code of Conduct, and Privacy Policy regarding society communications and membership records.
                    </span>
                  </div>
                </label>
                <FieldError msg={errors.privacyPolicy} />
              </div>

              {/* Communication & Directory Opt-Ins */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  Communication &amp; Directory Options
                </p>

                {/* Event Announcements */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={form.eventAnnouncements}
                    onChange={(e) => update('eventAnnouncements', e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-teal-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Event Announcements
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Receive notices regarding monthly technical luncheons, short courses, social gatherings, and symposiums.
                    </span>
                  </div>
                </label>

                {/* Member emails and newsletters */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={form.newsletterOptIn}
                    onChange={(e) => update('newsletterOptIn', e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-teal-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Member Emails &amp; Newsletters
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Receive GST newsletters, annual meeting notices, the President&rsquo;s address, and election ballots.
                    </span>
                  </div>
                </label>

                {/* Access to profile by others (Directory) */}
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors">
                  <input
                    type="checkbox"
                    checked={form.directoryVisible}
                    onChange={(e) => update('directoryVisible', e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-teal-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Member Directory Visibility (Access to profile by others)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Allow other verified GST members to view your name, professional title, and company in the private online member directory.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Membership Tier ── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Select Membership Tier</h2>
                  <p className="text-xs text-slate-400">Choose the membership level that corresponds with your professional eligibility.</p>
                </div>
              </div>

              {tiersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-7 h-7 text-teal-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {tiers.map((tier) => (
                    <label
                      key={tier.id}
                      className={`block cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 ${
                        form.tier === tier.id
                          ? 'border-teal-500 bg-teal-50/80 shadow-md shadow-teal-500/5'
                          : 'border-slate-200 bg-white hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="tier"
                          value={tier.id}
                          checked={form.tier === tier.id}
                          onChange={() => update('tier', tier.id)}
                          className="mt-1 accent-teal-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-base">{tier.name}</h3>
                            {tier.popular && (
                              <span className="px-2.5 py-0.5 bg-teal-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                                Most Popular
                              </span>
                            )}
                            <span className="ml-auto font-black text-teal-700 text-lg">{tier.price}</span>
                          </div>
                          <p className="text-slate-500 text-xs mb-3">{tier.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {tier.features.map((f) => (
                              <span key={f} className="flex items-center gap-1 text-[11px] text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full font-medium">
                                <Check className="w-3 h-3 text-teal-600 shrink-0" />{f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 4: Review & Submit ── */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Review Your Application</h2>
                <p className="text-xs text-slate-400">Please review all submitted details before finalizing your application.</p>
              </div>
            </div>

            {/* Summary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Personal &amp; Contact</p>
                <div className="space-y-1 text-slate-800">
                  <p><span className="font-bold">Name:</span> {form.firstName} {form.lastName} {form.nickname ? `(${form.nickname})` : ''}</p>
                  <p><span className="font-bold">Email:</span> {form.email}</p>
                  <p><span className="font-bold">Phone:</span> {form.phone || '—'}</p>
                  <p><span className="font-bold">Home Address:</span> {[form.homeStreet, form.homeCity, form.homeState, form.homeZip].filter(Boolean).join(', ') || '—'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Company &amp; Work</p>
                <div className="space-y-1 text-slate-800">
                  <p><span className="font-bold">Company:</span> {form.companyName || '—'}</p>
                  <p><span className="font-bold">Job Title:</span> {form.jobTitle || '—'}</p>
                  <p><span className="font-bold">Board Position:</span> {form.boardPosition || '—'}</p>
                  <p><span className="font-bold">Company Phone:</span> {form.companyPhone || '—'}</p>
                  <p><span className="font-bold">Company Address:</span> {[form.companyStreet, form.companyCity, form.companyState, form.companyZip].filter(Boolean).join(', ') || '—'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Societies &amp; Affiliations</p>
                <div className="space-y-1 text-slate-800">
                  <p><span className="font-bold">SEG Status:</span> <span className="capitalize">{form.segStatus}</span></p>
                  <p><span className="font-bold">TGS Member:</span> {form.tgsMember ? 'Yes (Active Member)' : 'No'}</p>
                  <p><span className="font-bold">Selected Tier:</span> <span className="font-bold text-teal-700 capitalize">{tiers.find(t => t.id === form.tier)?.name} {tiers.find(t => t.id === form.tier)?.price ? `(${tiers.find(t => t.id === form.tier)?.price})` : ''}</span></p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Education &amp; Degrees</p>
                <div className="space-y-1.5 text-slate-800">
                  {(form.education || []).filter(e => e.university || e.degree).length === 0 ? (
                    <p className="text-slate-400">None specified</p>
                  ) : (
                    (form.education || []).filter(e => e.university || e.degree).map((edu, idx) => (
                      <p key={idx} className="text-slate-700">
                        • <span className="font-bold">{edu.degree || 'Degree'}</span> in {edu.major || 'Major'} — {edu.university || 'University'}
                      </p>
                    ))
                  )}
                </div>
              </div>

              {/* Permissions & Consents Review */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 sm:col-span-2">
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Permissions, Consents &amp; Privacy</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                  <p><span className="font-bold">Terms &amp; Privacy Policy:</span> <span className="text-emerald-700 font-bold">✓ Accepted</span></p>
                  <p><span className="font-bold">Member Directory:</span> {form.directoryVisible ? <span className="text-teal-700 font-bold">Visible to Members</span> : <span className="text-slate-500">Hidden</span>}</p>
                  <p><span className="font-bold">Event Announcements:</span> {form.eventAnnouncements ? <span className="text-teal-700 font-bold">Subscribed</span> : <span className="text-slate-500">Opted out</span>}</p>
                  <p><span className="font-bold">Newsletters &amp; Updates:</span> {form.newsletterOptIn ? <span className="text-teal-700 font-bold">Subscribed</span> : <span className="text-slate-500">Opted out</span>}</p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <span>⚠️</span> {submitError}
              </div>
            )}
          </div>
        )}

        {/* ── Wizard Navigation Controls ── */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={emailChecking}
              className="btn-teal px-7 py-2.5 rounded-xl font-bold text-white text-xs flex items-center gap-2 shadow-md shadow-teal-500/20 disabled:opacity-60"
            >
              {emailChecking ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking email…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Next Step <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              id="membership-submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-teal px-8 py-3 rounded-xl font-bold text-white text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" /> Submit Application
                </span>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
