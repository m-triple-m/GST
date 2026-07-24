import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight,
  ShieldCheck, Ticket, Calendar, MapPin, Clock,
  PackageOpen, Tag, Users, User, ChevronDown, ChevronUp, X, Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

/** Format a dollar amount to 2 decimal places */
const fmt = (n) => `$${Number(n).toFixed(2)}`;

/** Format event date */
const formattedDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
    : 'TBD';

/**
 * Guest management panel embedded inside a cart item card.
 * Mirrors the Additional Guests UI in RegisterEventPage.
 */
function GuestPanel({ item, updateItemGuests }) {
  const [open, setOpen] = useState(item.guests?.length > 0);
  const guests = item.guests ?? [];
  const guestPrice = item.guestPrice ?? item.price;

  const addGuest = () => {
    updateItemGuests(item.eventId, item.attendeeType, [...guests, '']);
    setOpen(true);
  };

  const removeGuest = (idx) => {
    const next = guests.filter((_, i) => i !== idx);
    updateItemGuests(item.eventId, item.attendeeType, next);
  };

  const updateGuest = (idx, val) => {
    const next = [...guests];
    next[idx] = val;
    updateItemGuests(item.eventId, item.attendeeType, next);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-teal-600 transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Additional Guests
          {guests.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black">
              {guests.length}
            </span>
          )}
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={addGuest}
          className="flex items-center gap-1 text-xs font-black text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Guest
        </button>
      </div>

      {/* Guest pricing note */}
      {guestPrice > 0 && (
        <p className="text-[10px] text-slate-400 font-medium mb-3">
          Each guest: {fmt(guestPrice)}/ticket
        </p>
      )}

      {/* Guest list */}
      {open && guests.length > 0 && (
        <div className="space-y-2">
          {guests.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateGuest(idx, e.target.value)}
                  placeholder={`Guest ${idx + 1} full name`}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => removeGuest(idx)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors flex-shrink-0"
                title="Remove guest"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open && guests.length === 0 && (
        <p className="text-xs text-slate-400 italic">
          No guests added yet. Click "Add Guest" to include additional attendees.
        </p>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, updateQty, removeItem, updateItemGuests, updateItemPrice, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pricesLoading, setPricesLoading] = useState(true);
  const syncedRef = useRef(false); // prevent double-sync in StrictMode

  /**
   * On mount: fetch admin settings + each event's own prices,
   * then push the resolved prices back into CartContext so that:
   *  - localStorage-restored items get live prices
   *  - items added before settings loaded get corrected
   *
   * Priority: event-specific price > admin global setting > 0
   */
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    const syncPrices = async () => {
      if (items.length === 0) {
        setPricesLoading(false);
        return;
      }
      try {
        // Fetch global admin settings
        const settingsRes = await api.get('/settings');
        const s = settingsRes.data?.data || {};
        const adminMemberPrice    = Number(s.member_ticket_cost)     || 0;
        const adminNonMemberPrice = Number(s.non_member_ticket_cost) || 0;

        // Fetch each event's own ticket costs (in parallel)
        const eventFetches = await Promise.allSettled(
          [...new Set(items.map(i => i.eventId))].map(id =>
            api.get(`/events/${id}`).then(r => r.data?.data)
          )
        );

        // Build a map: eventId → event data
        const eventMap = {};
        eventFetches.forEach(result => {
          if (result.status === 'fulfilled' && result.value?.id) {
            eventMap[result.value.id] = result.value;
          }
        });

        // Resolve and push price for every cart item
        items.forEach(item => {
          const ev = eventMap[item.eventId];

          let price;
          let guestPrice;

          if (item.attendeeType === 'member') {
            price =
              Number(ev?.member_ticket_cost)  ||
              adminMemberPrice                ||
              Number(ev?.ticket_cost)         ||
              0;
          } else {
            price =
              Number(ev?.non_member_ticket_cost) ||
              adminNonMemberPrice                 ||
              Number(ev?.ticket_cost)             ||
              0;
          }

          guestPrice =
            Number(ev?.non_member_ticket_cost) ||
            adminNonMemberPrice                 ||
            Number(ev?.ticket_cost)             ||
            0;

          // Only push if the resolved price differs from what's stored
          // (avoids unnecessary re-renders for items already priced correctly)
          if (price !== item.price || guestPrice !== (item.guestPrice ?? item.price)) {
            updateItemPrice(item.eventId, item.attendeeType, price, guestPrice);
          }
        });
      } catch {
        // Fail open — keep whatever prices are stored
      } finally {
        setPricesLoading(false);
      }
    };

    syncPrices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-item line total: primary tickets + guests
  const itemTotal = (item) => {
    const guestPrice = item.guestPrice ?? item.price;
    return item.price * item.qty + guestPrice * (item.guests?.length ?? 0);
  };

  // Grand total (same as context subtotal, computed locally for display clarity)
  const grandTotal = items.reduce((sum, item) => sum + itemTotal(item), 0);

  // Show a brief loading overlay while prices are syncing from the API
  if (pricesLoading && items.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        <p className="text-slate-400 font-semibold text-sm">Calculating your order…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-4">
            <ShoppingCart className="w-4 h-4" />
            Event Bookings
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                Your <span className="gradient-text">Cart</span>
              </h1>
              <p className="text-slate-400 font-medium">
                {items.length === 0
                  ? 'No events selected yet'
                  : `${items.length} event${items.length > 1 ? 's' : ''} in your cart`}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-rose-400 hover:text-rose-500 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center shadow-sm">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageOpen className="w-12 h-12 text-teal-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">Your cart is empty</h2>
            <p className="text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">
              Browse upcoming events and click <strong>"Add to Cart"</strong> to reserve your spot.
            </p>
            <Link to="/events" className="btn-teal px-8 py-3.5 rounded-xl text-white font-bold text-sm inline-flex items-center gap-2">
              <span>Browse Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">

            {/* ── Items List ── */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                const guestPrice = item.guestPrice ?? item.price;
                const lineTotal = itemTotal(item);

                return (
                  <div
                    key={`${item.eventId}-${item.attendeeType}`}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-teal-500/40 hover:shadow-md transition-all duration-200"
                  >
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />

                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Ticket className="w-7 h-7 text-teal-600" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                item.attendeeType === 'member'
                                  ? 'bg-teal-100 text-teal-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              <Tag className="w-2.5 h-2.5 inline mr-1" />
                              {item.attendeeType === 'member' ? 'Member Rate' : 'Guest Rate'}
                            </span>
                          </div>
                          <h3 className="font-black text-slate-900 text-lg leading-snug mb-3 truncate">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-500" />
                              {formattedDate(item.event_date)}
                            </span>
                            {item.start_time && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-teal-500" />
                                {item.start_time}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-teal-500" />
                              {item.location}
                            </span>
                          </div>
                        </div>

                        {/* Price + Qty Controls */}
                        <div className="flex md:flex-col items-center md:items-end justify-between gap-4 flex-shrink-0">
                          {/* Line total */}
                          <div className="text-right">
                            <p className="text-2xl font-black text-teal-600">
                              {fmt(lineTotal)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {fmt(item.price)}/ticket
                              {(item.guests?.length ?? 0) > 0 && (
                                <span className="ml-1 text-slate-400">
                                  + {item.guests.length} guest{item.guests.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Qty Stepper */}
                            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                              <button
                                onClick={() => updateQty(item.eventId, item.attendeeType, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-slate-500 disabled:opacity-30"
                                disabled={item.qty <= 1}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center font-black text-slate-800 text-sm">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.eventId, item.attendeeType, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-slate-500"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Remove */}
                            <button
                              onClick={() => removeItem(item.eventId, item.attendeeType)}
                              className="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* ── Guest Management Panel ── */}
                      <GuestPanel
                        item={item}
                        updateItemGuests={updateItemGuests}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Add More Events */}
              <Link
                to="/events"
                className="flex items-center justify-center gap-2 p-5 bg-slate-100/60 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-400 font-bold text-xs uppercase tracking-widest transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add another event
              </Link>
            </div>

            {/* ── Order Summary Sidebar ── */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-32 shadow-2xl shadow-slate-900/20 overflow-hidden relative">
                <div className="absolute inset-0 seismic-pattern opacity-10 pointer-events-none" />

                <div className="relative z-10">
                  <h2 className="text-xl font-black mb-6 pb-5 border-b border-white/10">
                    Order Summary
                  </h2>

                  {/* Per-item breakdown */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => {
                      const guestPrice = item.guestPrice ?? item.price;
                      const guestCount = item.guests?.length ?? 0;
                      return (
                        <div key={`${item.eventId}-${item.attendeeType}`} className="space-y-1">
                          {/* Primary ticket(s) */}
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400 truncate mr-2">
                              {item.title.length > 22 ? item.title.slice(0, 22) + '…' : item.title}
                              <span className="ml-1 text-slate-500">×{item.qty}</span>
                            </span>
                            <span className="text-white font-bold flex-shrink-0">
                              {fmt(item.price * item.qty)}
                            </span>
                          </div>
                          {/* Guest tickets */}
                          {guestCount > 0 && (
                            <div className="flex justify-between text-xs pl-2">
                              <span className="text-slate-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {guestCount} guest{guestCount > 1 ? 's' : ''}
                              </span>
                              <span className="text-slate-300 font-semibold flex-shrink-0">
                                {fmt(guestPrice * guestCount)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-px bg-white/10 mb-5" />

                  <div className="flex justify-between text-slate-400 text-sm mb-2">
                    <span>Processing Fee</span>
                    <span className="text-white font-bold">$0.00</span>
                  </div>

                  <div className="flex justify-between items-end mb-10 mt-4">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total</span>
                    <span className="text-4xl font-black gradient-text">{fmt(grandTotal)}</span>
                  </div>

                  {/* Attendee count note */}
                  {items.some(i => (i.guests?.length ?? 0) > 0) && (
                    <div className="mb-5 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <p className="text-[10px] font-bold text-teal-300 uppercase tracking-wide">
                          Includes {items.reduce((s, i) => s + (i.guests?.length ?? 0), 0)} additional guest ticket{items.reduce((s, i) => s + (i.guests?.length ?? 0), 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full btn-teal px-8 py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 group shadow-xl shadow-teal-500/10 transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-slate-500">
                    <ShieldCheck className="w-5 h-5 text-teal-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Secure Society Checkout</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
