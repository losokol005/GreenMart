import { cn } from '@/lib/utils';
import ProductCard from './ProductCard';

// 2 cols on phones, 3 on tablets; 4 on desktop (or at xl when a filter sidebar takes space).
export const gridClass = (sidebar = false) =>
  cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3', sidebar ? 'xl:grid-cols-4' : 'lg:grid-cols-4');

export default function ProductGrid({ products, sidebar = false, busy = false }) {
  return (
    <ul className={cn(gridClass(sidebar), busy && 'opacity-60 transition-opacity')} aria-busy={busy}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}
