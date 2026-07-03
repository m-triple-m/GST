import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, Shield, ChevronRight, ArrowLeft,
  CheckCircle, Lock, User, Landmark, Loader2,
  Calendar, Ticket
} from 'lucide-react';
import api from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const steps = ['Details', 'Payment', 'Review'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [form, setForm] = useState({
    firstName: user?.first_name || '',
    lastName:  user?.last_name  || '',
    email:     user?.email      || '',
    company:   '',
    dietary:   '',
    cardNum:   '',
    expiry:    '',
    cvv:       '',
  });
  const [complete, setComplete] = useState(false);

  const inputCls  = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all";
  const labelCls  = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2";

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleComplete = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setApiError('');
    try {
      // Fire one registration request per cart item
      await Promise.all(
        items.map(item =>
          api.post(`/events/${item.eventId}/register`, {
            attendee_name:  `${form.firstName} ${form.lastName}`.trim(),
            attendee_email: form.email,
            company:        form.company || undefined,
            dietary_notes:  form.dietary || undefined,
            attendee_type:  item.attendeeType,
            payment_method: 'card',
          })
        )
      );
      clearCart();
      setComplete(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !complete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-lg border border-slate-100">
          <Ticket className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-3">No items to checkout</h2>
          <p className="text-slate-400 mb-8">Go back to the cart and add at least one event.</p>
          <Link to="/cart" className="btn-teal px-8 py-3.5 rounded-xl text-white font-bold text-sm inline-block">
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100">
          <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-8 animate-fade-in">
            <CheckCircle className="w-12 h-12 text-teal-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">All Set!</h1>
          <p className="text-slate-500 leading-relaxed mb-10">
            You are now registered for <strong>{items.length > 0 ? items.length : 'all'}</strong> event{items.length !== 1 ? 's' : ''}.
            A confirmation has been sent to <strong>{form.email}</strong>.
          </p>
          <div className="flex gap-3">
            <Link to="/dashboard" className="flex-1 btn-teal px-6 py-4 rounded-2xl text-white font-bold text-sm shadow-xl">
              <span>Dashboard</span>
            </Link>
            <Link to="/events" className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 text-sm hover:border-teal-400 transition-all">
              More Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-10">
          <Link to="/cart" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" /> Back to Cart
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">

            {/* Step Indicator */}
            <div className="flex items-center mb-12">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all duration-300 ${
                      i < step  ? 'bg-teal-500 border-teal-500 text-white' :
                      i === step ? 'border-teal-500 text-teal-600 bg-white ring-4 ring-teal-500/10' :
                                   'border-slate-200 text-slate-300 bg-white'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-black tracking-widest uppercase mt-3 ${i === step ? 'text-teal-600' : 'text-slate-300'}`}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 mb-4 transition-all duration-300 ${i < step ? 'bg-teal-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 seismic-pattern opacity-5 pointer-events-none" />

              <div className="relative z-10">
                {/* ── Step 0: Details ── */}
                {step === 0 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-teal-500" />
                      <h2 className="text-xl font-black text-slate-800">Attendee Information</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>First Name</label>
                        <input className={inputCls} placeholder="Jane" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Last Name</label>
                        <input className={inputCls} placeholder="Smith" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input className={inputCls} type="email" placeholder="jane@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Company / Institution</label>
                      <input className={inputCls} placeholder="Organization Name (optional)" value={form.company} onChange={e => set('company', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Dietary Notes</label>
                      <input className={inputCls} placeholder="e.g. vegetarian, nut allergy (optional)" value={form.dietary} onChange={e => set('dietary', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* ── Step 1: Payment ── */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-teal-500" />
                      <h2 className="text-xl font-black text-slate-800">Payment Details</h2>
                    </div>

                    <div>
                      <label className={labelCls}>Card Number</label>
                      <div className="relative">
                        <input className={inputCls + " pl-12"} placeholder="0000 0000 0000 0000" value={form.cardNum} onChange={e => set('cardNum', e.target.value)} />
                        <CreditCard className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Expiry</label>
                        <input className={inputCls} placeholder="MM / YY" value={form.expiry} onChange={e => set('expiry', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>CVV</label>
                        <input className={inputCls} placeholder="•••" type="password" value={form.cvv} onChange={e => set('cvv', e.target.value)} />
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex gap-3">
                      <Lock className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-teal-700 leading-relaxed font-bold uppercase tracking-wide">
                        Payments are processed securely via SSL encryption. GST does not store card details.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Review ── */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-teal-500" />
                      <h2 className="text-xl font-black text-slate-800">Final Review</h2>
                    </div>

                    <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
                      <div className="flex justify-between px-6 py-4">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Attendee</span>
                        <span className="text-slate-900 font-bold text-sm">{form.firstName} {form.lastName}</span>
                      </div>
                      <div className="flex justify-between px-6 py-4">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Email</span>
                        <span className="text-slate-900 font-bold text-sm">{form.email}</span>
                      </div>
                      {items.map(item => (
                        <div key={`${item.eventId}-${item.attendeeType}`} className="flex justify-between px-6 py-4">
                          <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-teal-500" />
                            {item.title.length > 30 ? item.title.slice(0, 30) + '…' : item.title}
                            <span className="text-xs text-slate-400">×{item.qty}</span>
                          </span>
                          <span className="text-slate-900 font-bold text-sm">${(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between px-6 py-4">
                        <span className="text-slate-900 text-sm font-black uppercase tracking-wide">Total</span>
                        <span className="text-teal-600 font-black text-lg">${subtotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {apiError && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 font-medium">
                        {apiError}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-12 flex gap-4">
                  {step > 0 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="flex-1 py-4 px-6 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 hover:border-slate-200 transition-all text-sm"
                    >
                      Back
                    </button>
                  )}
                  <button
                    disabled={submitting}
                    onClick={() => step < 2 ? setStep(step + 1) : handleComplete()}
                    className="flex-[2] btn-teal py-4 px-8 rounded-2xl text-white font-bold text-sm shadow-xl shadow-teal-500/10 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{step === 2 ? 'Complete Registration' : 'Next Step'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 seismic-pattern opacity-10" />
                <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.2em] mb-4 relative z-10">Order Summary</h3>
                <div className="relative z-10 space-y-3">
                  {items.map(item => (
                    <div key={`${item.eventId}-${item.attendeeType}`} className="flex justify-between text-xs">
                      <span className="text-slate-400 truncate mr-2">{item.title.slice(0, 22)}… ×{item.qty}</span>
                      <span className="text-white font-bold">${(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Total</span>
                    <span className="text-teal-400 font-black">${subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-dashed border-slate-200 relative overflow-hidden">
                <Landmark className="w-8 h-8 text-slate-200 absolute bottom-4 right-4" />
                <h4 className="text-xs font-black text-teal-700 uppercase tracking-widest mb-2">Why GST?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Since 1947, the Geophysical Society of Tulsa has been a non-profit leader in the scientific community. Your dues support student scholarships and local geological research.
                </p>
              </div>

              <div className="p-6 border border-dashed border-slate-200 rounded-3xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Need Help?</p>
                <Link to="/contact" className="text-teal-600 font-black text-xs hover:text-teal-700 transition-colors">
                  Contact Board Member →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
