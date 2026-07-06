import { createContext, useContext, useState, useEffect } from 'react';

/**
 * CartContext — global cart state for event bookings
 *
 * Each cart item: { eventId, title, event_date, location, attendeeType, price, qty }
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

  /** Add or update an event in the cart */
  const addToCart = (event, attendeeType = 'member', qty = 1) => {
    const price = Number(event.ticket_cost) || 0;
    setItems(prev => {
      const existing = prev.find(i => i.eventId === event.id && i.attendeeType === attendeeType);
      if (existing) {
        return prev.map(i =>
          i.eventId === event.id && i.attendeeType === attendeeType
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prev, {
        eventId:      event.id,
        title:        event.title,
        event_date:   event.event_date,
        start_time:   event.start_time,
        location:     event.location_name || (event.location_type === 'online' ? 'Online' : 'TBD'),
        attendeeType,
        price,
        qty,
      }];
    });
  };

  /** Update qty for a specific cart item */
  const updateQty = (eventId, attendeeType, delta) => {
    setItems(prev =>
      prev.map(i =>
        i.eventId === eventId && i.attendeeType === attendeeType
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  /** Remove a specific item from cart */
  const removeItem = (eventId, attendeeType) => {
    setItems(prev => prev.filter(i => !(i.eventId === eventId && i.attendeeType === attendeeType)));
  };

  /** Clear entire cart */
  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal  = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeItem, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
