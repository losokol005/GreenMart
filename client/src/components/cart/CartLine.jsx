import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/Cart';
import { formatMoney } from '@/format';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/products/ProductImage';
import QuantityStepper from './QuantityStepper';

export default function CartLine({ item }) {
  const { setQty, remove } = useCart();
  return (
    <li className="flex gap-3 py-4">
      <ProductImage src={item.imageUrl} alt={item.name} className="h-20 w-20 shrink-0 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{item.name}</p>
            <p className="text-sm text-muted-foreground">{formatMoney(item.priceCents)} / {item.unit}</p>
          </div>
          <p className="shrink-0 font-bold">{formatMoney(item.priceCents * item.quantity)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <QuantityStepper name={item.name} value={item.quantity} max={item.stock} onChange={(q) => setQty(item.productId, q)} />
          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => { remove(item.productId); toast(`${item.name} removed`); }} aria-label={`Remove ${item.name} from cart`}>
            <Trash2 aria-hidden="true" /> <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
        {item.quantity >= item.stock && <p className="text-xs text-soil">Maximum available quantity</p>}
      </div>
    </li>
  );
}
