import { createContext, useContext, useState, useEffect } from 'react';

/**
 * CartContext — global cart state for event bookings
 *
 * Each cart item:
 *   { eventId, title, event_date, start_time, location,
 *     attendeeType, price, guestPrice, qty, guests: string[] }
 *
 *  - price      = per-ticket price for the primary attendee (member or guest rate)
 *  - guestPrice = per-ticket price for each additional named guest
 *                 (= non_member_ticket_cost or ticket_cost, so guests always pay
 *                  the non-member / general rate regardless of who added the item)
 *  - guests     = array of guest names added while in the cart
 *  - qty        = number of primary-attendee tickets (almost always 1)
 *
 * Total line-item amount = price * qty + guestPrice * guests.length
 */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('gst_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem('gst_cart', JSON.stringify(items));
  }, [items]);

  /**
   * Add or update an event in the cart.
   *
   * @param {object} event          Full event object from the API
   * @param {'member'|'guest'} attendeeType
   * @param {number} qty            Number of primary tickets (default 1)
   * @param {object} globalSettings Optional global /settings overrides
   */
  const addToCart = (event, attendeeType = 'member', qty = 1, globalSettings = {}) => {
    // Resolve the correct price for the primary attendee
    let price;
    if (attendeeType === 'member') {
      price =
        Number(event.member_ticket_cost) ||
        Number(globalSettings.member_ticket_cost) ||
        Number(event.ticket_cost) ||
        0;
    } else {
      price =
        Number(event.non_member_ticket_cost) ||
        Number(globalSettings.non_member_ticket_cost) ||
        Number(event.ticket_cost) ||
        0;
    }

    // Guests always pay the non-member / general rate
    const guestPrice =
      Number(event.non_member_ticket_cost) ||
      Number(globalSettings.non_member_ticket_cost) ||
      Number(event.ticket_cost) ||
      0;

    setItems(prev => {
      const existing = prev.find(
        i => i.eventId === event.id && i.attendeeType === attendeeType
      );
      if (existing) {
        return prev.map(i =>
          i.eventId === event.id && i.attendeeType === attendeeType
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          eventId:      event.id,
          title:        event.title,
          event_date:   event.event_date,
          start_time:   event.start_time,
          location:     event.location_name || (event.location_type === 'online' ? 'Online' : 'TBD'),
          attendeeType,
          price,
          guestPrice,
          qty,
          guests: [],   // named guests added on the cart page
        },
      ];
    });
  };

  /** Update qty for a specific cart item (minimum 1) */
  const updateQty = (eventId, attendeeType, delta) => {
    setItems(prev =>
      prev.map(i =>
        i.eventId === eventId && i.attendeeType === attendeeType
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  /**
   * Replace the guests array for a specific cart item.
   * @param {number} eventId
   * @param {'member'|'guest'} attendeeType
   * @param {string[]} guests  Array of guest names
   */
  const updateItemGuests = (eventId, attendeeType, guests) => {
    setItems(prev =>
      prev.map(i =>
        i.eventId === eventId && i.attendeeType === attendeeType
          ? { ...i, guests: guests.filter(g => g !== undefined) }
          : i
      )
    );
  };

  /**
   * Update the resolved price and guestPrice for a cart item.
   * Called from CartPage after fetching /settings so admin-configured
   * prices are always reflected even for items loaded from localStorage.
   *
   * @param {number} eventId
   * @param {'member'|'guest'} attendeeType
   * @param {number} price       Effective primary-attendee ticket price
   * @param {number} guestPrice  Effective per-guest ticket price
   */
  const updateItemPrice = (eventId, attendeeType, price, guestPrice) => {
    setItems(prev =>
      prev.map(i =>
        i.eventId === eventId && i.attendeeType === attendeeType
          ? { ...i, price, guestPrice }
          : i
      )
    );
  };

  /** Remove a specific item from cart */
  const removeItem = (eventId, attendeeType) => {
    setItems(prev =>
      prev.filter(i => !(i.eventId === eventId && i.attendeeType === attendeeType))
    );
  };

  /** Clear entire cart */
  const clearCart = () => setItems([]);

  /** Total ticket count (primary attendees only) */
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  /**
   * Grand total:
   *   For each item → (primary price × qty) + (guestPrice × number of guests)
   */
  const subtotal = items.reduce((sum, i) => {
    const guestPrice = i.guestPrice ?? i.price; // backward compat
    return sum + i.price * i.qty + guestPrice * (i.guests?.length ?? 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        updateItemGuests,
        updateItemPrice,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
