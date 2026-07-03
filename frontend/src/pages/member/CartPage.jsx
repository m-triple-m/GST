import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight,
  ShieldCheck, Ticket, Calendar, MapPin, Clock,
  PackageOpen, Tag, Users
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

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
                {items.length === 0 ? 'No events selected yet' : `${items.length} event${items.length > 1 ? 's' : ''} in your cart`}
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

            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
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
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.attendeeType === 'member'
                              ? 'bg-teal-100 text-teal-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
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

                      {/* Price + Controls */}
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-4 flex-shrink-0">
                        <p className="text-2xl font-black text-teal-600">
                          ${(item.price * item.qty).toLocaleString()}
                        </p>
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
                            <span className="w-7 text-center font-black text-slate-800 text-sm">{item.qty}</span>
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
                        <p className="text-[10px] text-slate-400 font-semibold hidden md:block">
                          ${item.price}/ticket
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add More */}
              <Link
                to="/events"
                className="flex items-center justify-center gap-2 p-5 bg-slate-100/60 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-400 font-bold text-xs uppercase tracking-widest transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add another event
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-32 shadow-2xl shadow-slate-900/20 overflow-hidden relative">
                <div className="absolute inset-0 seismic-pattern opacity-10 pointer-events-none" />

                <div className="relative z-10">
                  <h2 className="text-xl font-black mb-8 pb-6 border-b border-white/10">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={`${item.eventId}-${item.attendeeType}`} className="flex justify-between text-sm">
                        <span className="text-slate-400 truncate mr-2">
                          {item.title.length > 25 ? item.title.slice(0, 25) + '…' : item.title}
                          <span className="ml-1 text-slate-500">×{item.qty}</span>
                        </span>
                        <span className="text-white font-bold flex-shrink-0">
                          ${(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-white/10 mb-6" />

                  <div className="flex justify-between text-slate-400 text-sm mb-2">
                    <span>Processing Fee</span>
                    <span className="text-white font-bold">$0.00</span>
                  </div>

                  <div className="flex justify-between items-end mb-10 mt-4">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total</span>
                    <span className="text-4xl font-black gradient-text">${subtotal.toLocaleString()}</span>
                  </div>

                  {/* Member pricing note */}
                  <div className="mb-6 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-teal-300 uppercase tracking-wide">
                        Member $25 · Guest $35 per ticket
                      </p>
                    </div>
                  </div>

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
