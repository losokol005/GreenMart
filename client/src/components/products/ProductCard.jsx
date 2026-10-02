import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/context/Cart';
import { formatMoney, isOnSale, discountPercent } from '@/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductImage from './ProductImage';
import FavoriteButton from './FavoriteButton';

function Availability({ stock }) {
  if (stock === 0) return <p className="text-xs font-medium text-destructive">Out of stock</p>;
  if (stock <= 5) return <p className="text-xs font-medium text-soil">Only {stock} left</p>;
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden="true" /> In stock
    </p>
  );
}

export default function ProductCard({ product: p }) {
  const { add, items } = useCart();
  const navigate = useNavigate();
  const inCart = items.find((i) => i.productId === p.id)?.quantity || 0;
  const maxed = p.stock > 0 && inCart >= p.stock;
  const sale = isOnSale(p);

  const onAdd = () => {
    add(p, 1);
    toast.success(`${p.name} added to cart`, { action: { label: 'View cart', onClick: () => navigate('/cart') } });
  };

  return (
    <li className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow duration-200 focus-within:shadow-card-hover hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <ProductImage src={p.imageUrl} alt={p.name} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {sale && <Badge variant="soil">-{discountPercent(p)}%</Badge>}
        </div>
        <FavoriteButton product={p} className="absolute right-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="text-xs text-muted-foreground">{p.category}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{p.name}</h3>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-base font-bold sm:text-lg">{formatMoney(p.priceCents)}</span>
          <span className="text-xs text-muted-foreground sm:text-sm">/ {p.unit}</span>
          {sale && <s className="text-xs text-muted-foreground"><span className="sr-only">Was </span>{formatMoney(p.compareAtPriceCents)}</s>}
        </p>
        <Availability stock={p.stock} />
        <Button className="mt-auto w-full" size="sm" disabled={p.stock === 0 || maxed} onClick={onAdd} aria-label={p.stock === 0 ? `${p.name} is out of stock` : `Add ${p.name} to cart`}>
          <Plus aria-hidden="true" /> {maxed ? 'Max in cart' : 'Add to cart'}
        </Button>
      </div>
    </li>
  );
}
