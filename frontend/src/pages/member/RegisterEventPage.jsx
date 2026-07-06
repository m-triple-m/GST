import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, ArrowLeft, CheckCircle,
  CreditCard, ChevronRight, User, Mail, Users, Loader2, ShieldCheck
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function RegisterEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState({});

  // Compute applicable ticket price: event-specific → global setting → ticket_cost → 0
  // Each piece is converted to Number first so "0.00" (truthy string but 0 as number)
  // correctly falls through to the next fallback via ||
  const ticketPrice = (() => {
    if (!event) return 0;
    if (isAuthenticated) {
      return Number(event.member_ticket_cost)
        || Number(globalSettings.member_ticket_cost)
        || Number(event.ticket_cost)
        || 0;
    }
    return Number(event.non_member_ticket_cost)
      || Number(globalSettings.non_member_ticket_cost)
      || Number(event.ticket_cost)
      || 0;
  })();

  const [step, setStep] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    dietary: '',
    attendeeType: isAuthenticated ? 'member' : 'guest',
    guests: [],
    paymentMethod: 'card',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, settingsRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get('/settings'),
        ]);
        setEvent(eventRes.data.data);
        setGlobalSettings(settingsRes.data.data || {});
      } catch (err) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading event details...</p>
      </div>
    );
  }

  if (!event || event.status !== 'upcoming') {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <Calendar className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Event Not Available</h2>
        <p className="text-slate-400 mb-6">This event cannot be registered for right now.</p>
        <Link to="/events" className="btn-teal px-6 py-3 rounded-xl text-white font-semibold text-sm">
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
    } else {
      setSubmitLoading(true);
      setApiError('');
      try {
        await api.post(`/events/${id}/register`, {
          attendee_name: formData.name,
          attendee_email: formData.email,
          company: formData.company,
          dietary_notes: formData.dietary,
          attendee_type: formData.attendeeType,
          guests: formData.guests,
          payment_method: formData.paymentMethod,
        });
        setStep(3);
      } catch (err) {
        setApiError(err.response?.data?.message || 'Registration failed');
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const formattedDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'TBD';
  const formattedTime = event.start_time
    ? `${event.start_time}${event.end_time ? ` – ${event.end_time}` : ''}`
    : 'TBD';
  const locName = event.location_name || (event.location_type === 'online' ? 'Online' : 'TBD');

  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-slate-200 max-w-lg w-full animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-11 h-11 text-teal-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3">Registration Confirmed!</h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            Thank you, <strong>{formData.name}</strong>! You are registered for: <br />
            <span className="text-teal-600 font-bold">{event.title}</span>.
          </p>
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-3 border border-slate-100">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-teal-500" /> {formattedDate}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-teal-500" /> {locName}
            </div>
          </div>
          <Link to="/events" className="btn-teal inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm">
            <span>Back to Events</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="bg-slate-900 py-12 relative overflow-hidden">
        <div className="absolute inset-0 seismic-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`/events/${id}`} className="inline-flex items-center gap-2 text-teal-400 text-sm font-semibold mb-6 hover:text-teal-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Event
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Event Registration</h1>
          <p className="text-slate-400">{event.title}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                <div className="h-px flex-1 bg-slate-100" />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
                <div className="h-px flex-1 bg-slate-100" />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>3</div>
              </div>

              {apiError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <Step1 formData={formData} setFormData={setFormData} isAuthenticated={isAuthenticated} />
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Payment Method</h2>
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'card'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard className={`w-6 h-6 ${formData.paymentMethod === 'card' ? 'text-teal-600' : 'text-slate-400'}`} />
                          <div className="text-left">
                            <p className={`font-bold ${formData.paymentMethod === 'card' ? 'text-slate-800' : 'text-slate-600'}`}>Credit or Debit Card</p>
                            <p className="text-xs text-slate-500">Secure transaction via Stripe</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-4 ${
                          formData.paymentMethod === 'card' ? 'border-teal-500 bg-white' : 'border-slate-300 bg-transparent'
                        }`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: 'at_door' })}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'at_door'
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Users className={`w-6 h-6 ${formData.paymentMethod === 'at_door' ? 'text-teal-600' : 'text-slate-400'}`} />
                          <div className="text-left">
                            <p className={`font-bold ${formData.paymentMethod === 'at_door' ? 'text-slate-800' : 'text-slate-600'}`}>In Person (Cash)</p>
                            <p className="text-xs text-slate-500">Pay later at the event venue</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-4 ${
                          formData.paymentMethod === 'at_door' ? 'border-teal-500 bg-white' : 'border-slate-300 bg-transparent'
                        }`} />
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="btn-teal w-full py-4 rounded-2xl font-black text-white text-base shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {step === 1 ? 'Continue to Payment' : 'Complete Registration'} <ChevronRight className="w-5 h-5" />
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h3 className="font-bold text-slate-800 text-lg mb-6 pb-4 border-b border-slate-100">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Registration ({formData.attendeeType})</span>
                  <span className="font-bold text-slate-800">${ticketPrice.toFixed(2)}</span>
                </div>
                {formData.guests.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Guests ({formData.guests.length})</span>
                    <span className="font-bold text-slate-800">${(ticketPrice * formData.guests.length).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Processing Fee</span>
                  <span className="font-bold text-slate-800">$0.00</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-black text-teal-600">
                    ${(ticketPrice * (1 + formData.guests.length)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs mb-2 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Event Logistics
                </div>
                <p className="text-xs text-teal-600 leading-relaxed">
                  Join us at <strong>{locName}</strong> on <strong>{formattedDate}</strong> at <strong>{formattedTime}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Step 1 — Attendee Information with Member Profile Autofill
───────────────────────────────────────────────────────────────── */
function Step1({ formData, setFormData, isAuthenticated }) {
  const [profile, setProfile]               = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [autofilled, setAutofilled]         = useState(false);

  // Fetch logged-in member profile (silently ignored for guests)
  useEffect(() => {
    api.get('/members/me')
      .then(({ data }) => { if (data?.data) setProfile(data.data); })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const applyProfile = () => {
    if (!profile) return;
    setFormData(prev => ({
      ...prev,
      name:         `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      email:        profile.email   || prev.email,
      company:      profile.company || prev.company,
      attendeeType: 'member',
    }));
    setAutofilled(true);
  };

  // Auto-apply on first load when form is still blank
  useEffect(() => {
    if (profile && !autofilled && !formData.name && !formData.email) {
      applyProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return (
    <>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Attendee Information</h2>

      {/* ── Profile Autofill Banner (only for logged-in members) ── */}
      {!profileLoading && profile && (
        <div className={`mb-6 rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all duration-300 ${
          autofilled ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-teal-100 flex-shrink-0 overflow-hidden border-2 border-teal-200">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Your avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-700 font-black text-sm">
                  {(profile.first_name || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                {autofilled ? '✓ Filled from your profile' : "You're logged in as a member"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                {profile.company ? ` · ${profile.company}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={applyProfile}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              autofilled
                ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 hover:bg-teal-600'
                : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            {autofilled ? 'Re-apply' : 'Fill from Profile'}
          </button>
        </div>
      )}

      {/* ── Form fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              placeholder="Jane Smith"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
              placeholder="jane@company.com"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Company / Institution</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          placeholder="Organization Name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dietary Requirements</label>
        <input
          type="text"
          value={formData.dietary}
          onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          placeholder="e.g. Vegetarian, Gluten-free (optional)"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Attendee Type</label>

        {/* Logged-in member: show locked badge instead of toggleable buttons */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-teal-500 bg-teal-50">
            <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-teal-700">GST Member</p>
              <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest mt-0.5">
                Auto-selected · Member pricing applied
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, attendeeType: 'member' })}
              className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                formData.attendeeType === 'member'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              GST Member
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, attendeeType: 'guest' })}
              className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                formData.attendeeType === 'guest'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-100 text-slate-500 hover:border-slate-200'
              }`}
            >
              Guest / Non-Member
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Additional Guests</label>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, guests: [...formData.guests, ''] })}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg"
          >
            + Add Guest
          </button>
        </div>
        {formData.guests.map((guest, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="relative flex-1">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={guest}
                onChange={(e) => {
                  const newGuests = [...formData.guests];
                  newGuests[idx] = e.target.value;
                  setFormData({ ...formData, guests: newGuests });
                }}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                placeholder={`Guest ${idx + 1} Name`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const newGuests = [...formData.guests];
                newGuests.splice(idx, 1);
                setFormData({ ...formData, guests: newGuests });
              }}
              className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
