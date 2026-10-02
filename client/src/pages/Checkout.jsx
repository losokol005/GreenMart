import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../useAsync';
import { useAuth } from '../context/Auth';
import { useCart } from '../context/Cart';
import { formatMoney } from '../format';
import { ErrorMessage, Empty } from '../components/UI';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotalCents, clear } = useCart();
  const navigate = useNavigate();
  const cfg = useAsync(() => api('/config'), []);
  const [form, setForm] = useState({ fullName: user.name, phone: user.phone || '', address: '', notes: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef(crypto.randomUUID()); // a retried/double-clicked submit reuses the same key

  if (items.length === 0) return <Empty>Your cart is empty. <Link to="/">Browse produce</Link></Empty>;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fee = cfg.data?.deliveryFeeCents || 0;

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body: { items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })), delivery: { ...form, notes: form.notes || undefined } },
      });
      clear();
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1>Checkout</h1>
      <form className="form" onSubmit={submit}>
        <label>Full name<input required maxLength={100} value={form.fullName} onChange={set('fullName')} autoComplete="name" /></label>
        <label>Phone<input required type="tel" maxLength={20} value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+254 7xx xxx xxx" /></label>
        <label>Delivery address<textarea required maxLength={300} rows={3} value={form.address} onChange={set('address')} autoComplete="street-address" /></label>
        <label>Notes for the rider (optional)<textarea maxLength={300} rows={2} value={form.notes} onChange={set('notes')} /></label>
        <p>Payment: <strong>Cash on delivery</strong></p>
        <p>Subtotal {formatMoney(subtotalCents)} · Delivery {formatMoney(fee)} · <strong>Total {formatMoney(subtotalCents + fee)}</strong></p>
        <ErrorMessage error={error} />
        <button className="primary" type="submit" disabled={submitting}>{submitting ? 'Placing order…' : 'Place order'}</button>
      </form>
    </>
  );
}
