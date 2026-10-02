import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const load = () => {
  try { return JSON.parse(localStorage.getItem('gm_cart')) || []; } catch { return []; }
};

// The cart is only a convenience: the server re-prices and re-checks stock when the order is placed.
export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  useEffect(() => { try { localStorage.setItem('gm_cart', JSON.stringify(items)); } catch { /* storage unavailable */ } }, [items]);

  const add = (p, qty = 1) =>
    setItems((cur) => {
      const found = cur.find((i) => i.productId === p.id);
      const quantity = Math.min((found?.quantity || 0) + qty, p.stock);
      const line = { productId: p.id, name: p.name, unit: p.unit, priceCents: p.priceCents, stock: p.stock, imageUrl: p.imageUrl, quantity };
      return found ? cur.map((i) => (i.productId === p.id ? line : i)) : [...cur, line];
    });
  const setQty = (id, q) =>
    setItems((cur) => cur.map((i) => (i.productId === id ? { ...i, quantity: Math.max(1, Math.min(i.stock, q || 1)) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i.productId !== id));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotalCents = items.reduce((n, i) => n + i.quantity * i.priceCents, 0);
  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotalCents }}>{children}</CartContext.Provider>;
}
