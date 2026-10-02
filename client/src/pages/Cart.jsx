import { Link } from 'react-router-dom';
import { ShoppingCart, Truck, Banknote } from 'lucide-react';
import { api } from '@/api';
import { useAsync } from '@/useAsync';
import { useCart } from '@/context/Cart';
import { useTitle } from '@/hooks/useTitle';
import { formatMoney } from '@/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Container from '@/components/common/Container';
import EmptyState from '@/components/common/EmptyState';
import CartLine from '@/components/cart/CartLine';

export default function Cart() {
  useTitle('Your cart');
  const { items, count, subtotalCents } = useCart();
  const cfg = useAsync(() => api('/config'), []);

  if (items.length === 0) {
    return (
      <Container className="py-10">
        <h1 className="mb-6 text-3xl font-bold">Your cart</h1>
        <EmptyState icon={ShoppingCart} title="Your cart is empty" actions={<Button asChild><Link to="/shop">Browse fresh produce</Link></Button>}>
          Add some fresh produce to get started.
        </EmptyState>
      </Container>
    );
  }

  const fee = cfg.data?.deliveryFeeCents;
  return (
    <Container className="py-8">
      <h1 className="mb-6 text-3xl font-bold">Your cart <span className="text-lg font-normal text-muted-foreground">({count} item{count === 1 ? '' : 's'})</span></h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-border rounded-lg border border-border bg-card px-4 shadow-card">
          {items.map((i) => <CartLine key={i.productId} item={i} />)}
        </ul>
        <aside aria-label="Order summary">
          <Card className="lg:sticky lg:top-24">
            <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(subtotalCents)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                {cfg.loading ? <Skeleton className="h-4 w-16" /> : fee === undefined ? <span>At checkout</span> : <span>{fee === 0 ? 'Free' : formatMoney(fee)}</span>}
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMoney(subtotalCents + (fee || 0))}</span></div>
              <Button asChild size="lg" className="w-full"><Link to="/checkout">Checkout</Link></Button>
              <Button asChild variant="ghost" className="w-full"><Link to="/shop">Continue shopping</Link></Button>
              <ul className="space-y-2 pt-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Banknote className="h-4 w-4 text-primary" aria-hidden="true" /> Pay with cash on delivery</li>
                <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" aria-hidden="true" /> Track your order after checkout</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
