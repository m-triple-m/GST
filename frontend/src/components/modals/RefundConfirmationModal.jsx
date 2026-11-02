import React, { useState } from 'react';
import { RefreshCw, X, AlertCircle, Loader2, Calendar, Mail } from 'lucide-react';

export default function RefundConfirmationModal({
  isOpen,
  onClose,
  registration,
  onConfirm
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !registration) return null;

  const attendeeName = registration.attendee_name || 
    (registration.first_name ? `${registration.first_name} ${registration.last_name || ''}` : 'Unnamed Attendee');
  const attendeeEmail = registration.attendee_email || registration.user_email || 'No email provided';
  const eventTitle = registration.event_title || registration.source_title || 'Event Registration';
  const amount = Number(registration.amount_paid || registration.amount || 0);

  const handleRefund = async () => {
    try {
      setSubmitting(true);
      setError('');
      await onConfirm(registration.id, 'refunded');
      onClose();
    } catch (err) {
      console.error('Refund error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to process refund.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-sm shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Refund Registration
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mark attendee ticket as refunded / void
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

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-start text-xs">
              <span className="text-slate-400 font-bold uppercase">Attendee</span>
              <span className="font-extrabold text-slate-900">{attendeeName}</span>
            </div>
            <div className="flex justify-between items-start text-xs">
              <span className="text-slate-400 font-bold uppercase">Event</span>
              <span className="font-bold text-slate-700 max-w-[200px] text-right truncate">{eventTitle}</span>
            </div>
            <div className="flex justify-between items-start text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-600 font-bold uppercase">Refund Amount</span>
              <span className="font-black text-purple-700 text-base">${amount.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to mark this registration as <strong>Refunded</strong>? This will release the attendee's active ticket status.
          </p>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRefund}
              disabled={submitting}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Confirm Refund</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
