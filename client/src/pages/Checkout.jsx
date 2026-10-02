import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Banknote, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api';
import { useAsync } from '@/useAsync';
import { useAuth } from '@/context/Auth';
import { useCart } from '@/context/Cart';
import { useTitle } from '@/hooks/useTitle';
import { formatMoney } from '@/format';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Container from '@/components/common/Container';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { describeError } from '@/components/common/errors';
import Field from '@/components/auth/Field';

const PHONE = /^\+?[0-9 ()-]{7,20}$/;

export default function Checkout() {
  useTitle('Checkout');
  const { user } = useAuth();
  const { items, subtotalCents, clear } = useCart();
  const navigate = useNavigate();
  const cfg = useAsync(() => api('/config'), []);
  const [form, setForm] = useState({ fullName: user.name, phone: user.phone || '', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  // One key per checkout screen: a double-click or a retry after a dropped connection can never create two orders.
  const idempotencyKey = useRef(crypto.randomUUID());
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: undefined }); };

  if (items.length === 0 && !busy) {
    return (
      <Container className="py-10">
        <PageHeader title="Checkout" />
        <EmptyState icon={ShoppingCart} title="Your cart is empty" actions={<Button asChild><Link to="/shop">Browse fresh produce</Link></Button>}>Add some produce before checking out.</EmptyState>
      </Container>
    );
  }
  const fee = cfg.data?.deliveryFeeCents ?? 0;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const found = {};
    if (!form.fullName.trim()) found.fullName = 'Enter the name for the delivery.';
    if (!PHONE.test(form.phone.trim())) found.phone = 'Enter a valid phone number, e.g. +254 700 000 000.';
    if (form.address.trim().length < 5) found.address = 'Enter a delivery address the rider can find.';
    setErrors(found); setFormError(null);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(first)?.focus(); return; }

    setBusy(true);
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          delivery: { fullName: form.fullName.trim(), phone: form.phone.trim(), address: form.address.trim(), notes: form.notes.trim() || undefined },
        },
      });
      clear();
      window.dispatchEvent(new Event('gm:notifications'));
      toast.success(`Order ${order.orderNumber} placed`);
      navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      const fieldErrs = {};
      (err.details || []).forEach((d) => { const k = d.path?.replace('delivery.', ''); if (k) fieldErrs[k] = d.message; });
      setErrors(fieldErrs);
      const stock = err.code === 'INSUFFICIENT_STOCK' || err.code === 'PRODUCT_UNAVAILABLE';
      setFormError(stock
        ? { title: 'Some items are no longer available', text: err.message, review: true }
        : { title: describeError(err).title, text: err.status >= 500 || err.status === 0 ? describeError(err).text : err.message });
      setBusy(false);
    }
  }

  return (
    <Container className="py-8">
      <PageHeader title="Checkout" description="Tell us where to deliver your fresh produce." />
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader><CardTitle>Delivery details</CardTitle></CardHeader>
          <CardContent>
            <form id="checkout-form" onSubmit={submit} noValidate className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle aria-hidden="true" />
                  <AlertTitle>{formError.title}</AlertTitle>
                  <AlertDescription>{formError.text} {formError.review && <Link to="/cart" className="font-medium underline">Review your cart</Link>}</AlertDescription>
                </Alert>
              )}
              <Field id="fullName" label="Full name" error={errors.fullName}>{(p) => <Input {...p} value={form.fullName} onChange={set('fullName')} maxLength={100} autoComplete="name" />}</Field>
              <Field id="phone" label="Phone number" error={errors.phone} hint="The rider will call this number.">{(p) => <Input {...p} type="tel" value={form.phone} onChange={set('phone')} maxLength={20} autoComplete="tel" placeholder="+254 700 000 000" />}</Field>
              <Field id="address" label="Delivery address" error={errors.address}>{(p) => <Textarea {...p} value={form.address} onChange={set('address')} maxLength={300} rows={3} autoComplete="street-address" placeholder="Building, street, area" />}</Field>
              <Field id="notes" label="Notes for the rider (optional)" error={errors.notes}>{(p) => <Textarea {...p} value={form.notes} onChange={set('notes')} maxLength={300} rows={2} placeholder="Gate code, landmark…" />}</Field>
            </form>
          </CardContent>
        </Card>

        <aside aria-label="Order summary">
          <Card className="lg:sticky lg:top-24">
            <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="space-y-2">
                {items.map((i) => (
                  <li key={i.productId} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{i.quantity} × {i.name}</span><span className="shrink-0">{formatMoney(i.priceCents * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(subtotalCents)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{fee === 0 ? 'Free' : formatMoney(fee)}</span></div>
              <Separator />
              <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMoney(subtotalCents + fee)}</span></div>
              <p className="flex items-center gap-2 rounded-md bg-accent p-3 text-xs"><Banknote className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> Pay with cash when your order arrives.</p>
              <Button type="submit" form="checkout-form" size="lg" className="w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />} {busy ? 'Placing order…' : 'Place order'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Final prices and stock are confirmed when you place the order.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
