import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/Cart';
import { formatMoney } from '@/format';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EmptyState from '@/components/common/EmptyState';
import CartLine from './CartLine';

export default function CartDrawer({ open, onOpenChange }) {
  const { items, count, subtotalCents } = useCart();
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Your cart{count > 0 && ` (${count})`}</SheetTitle>
          <SheetDescription className="sr-only">Items in your shopping cart</SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex-1 p-4">
            <EmptyState icon={ShoppingCart} title="Your cart is empty" actions={<Button asChild onClick={close}><Link to="/shop">Browse fresh produce</Link></Button>}>
              Add some fresh produce to get started.
            </EmptyState>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">{items.map((i) => <CartLine key={i.productId} item={i} />)}</ul>
            <SheetFooter>
              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span><strong>{formatMoney(subtotalCents)}</strong>
              </div>
              <p className="text-xs text-muted-foreground">Delivery fee is shown at checkout.</p>
              <Button asChild size="lg" onClick={close}><Link to="/checkout">Checkout</Link></Button>
              <Button asChild variant="outline" onClick={close}><Link to="/cart">View cart</Link></Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
