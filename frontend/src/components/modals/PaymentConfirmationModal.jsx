import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Banknote, CreditCard, Building2, Gift, 
  CheckCircle2, X, AlertCircle, Loader2, Calendar, 
  Users, Mail, ArrowRight, ShieldCheck, Tag
} from 'lucide-react';

export default function PaymentConfirmationModal({ 
  isOpen, 
  onClose, 
  registration, 
  onConfirm 
}) {
  const [paymentMethod, setPaymentMethod] = useState('at_door');
  const [referenceNote, setReferenceNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (registration) {
      setPaymentMethod(registration.payment_method === 'card' ? 'card' : 'at_door');
      setReferenceNote('');
      setError('');
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const attendeeName = registration.attendee_name || 
    (registration.first_name ? `${registration.first_name} ${registration.last_name || ''}` : 'Unnamed Attendee');
  const attendeeEmail = registration.attendee_email || registration.user_email || 'No email provided';
  const eventTitle = registration.event_title || registration.source_title || 'Event Registration';
  const amount = Number(
    Number(registration.amount_paid) > 0
      ? registration.amount_paid
      : (registration.expected_amount || registration.effective_amount || registration.amount || 0)
  );
  const guests = Array.isArray(registration.guests) ? registration.guests : [];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await onConfirm(registration.id, 'paid', paymentMethod, referenceNote);
      onClose();
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to confirm payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions = [
    {
      id: 'at_door',
      label: 'Cash / Pay at Door',
      desc: 'Physical cash received in-person at the check-in desk',
      icon: Banknote,
      color: 'emerald',
    },
    {
      id: 'card',
      label: 'Credit Card / Online',
      desc: 'Electronic credit or debit card payment',
      icon: CreditCard,
      color: 'blue',
    },
    {
      id: 'check',
      label: 'Check / Bank Transfer',
      desc: 'Corporate check or direct ACH bank transfer',
      icon: Building2,
      color: 'purple',
    },
    {
      id: 'comp',
      label: 'Complimentary / Waived',
      desc: 'Authorized fee waiver or sponsor VIP invitation',
      icon: Gift,
      color: 'amber',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Confirm Attendee Payment
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verify receipt of payment and mark registration as paid
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Event & Attendee Summary Card */}
          <div className="rounded-2xl bg-slate-900 text-white p-4 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between gap-3 text-xs mb-2">
              <span className="text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {eventTitle}
              </span>
              <span className="text-slate-400 font-medium text-[11px]">
                ID: #{registration.id}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 mt-3 pt-3 border-t border-slate-800">
              <div>
                <div className="font-extrabold text-base text-white flex items-center gap-2">
                  <span>{attendeeName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {registration.attendee_type || 'Member'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{attendeeEmail}</span>
                  {registration.company && <span>· {registration.company}</span>}
                </div>
                {guests.length > 0 && (
                  <div className="text-[11px] text-teal-300 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>+{guests.length} Guest{guests.length !== 1 ? 's' : ''} included</span>
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Due</p>
                <p className="text-2xl font-black text-emerald-400 leading-tight">
                  ${amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-2.5">
              Select Payment Collection Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold leading-snug ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                          {opt.label}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {opt.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Optional Reference Note */}
          <div>
            <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
              Payment Reference / Receipt Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder="e.g., Receipt #1042, Check #5892, or Door volunteer note"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Confirmation Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              Confirming this payment will immediately update the attendee's ticket status to <strong className="text-slate-700">Paid</strong> and synchronize the financial records on the Admin Dashboard.
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment (${amount.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
