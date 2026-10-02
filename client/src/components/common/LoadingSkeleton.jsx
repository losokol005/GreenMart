import { Skeleton } from '@/components/ui/skeleton';
import { gridClass } from '@/components/products/ProductGrid';

export function ProductCardSkeleton() {
  return (
    <li className="overflow-hidden rounded-lg border border-border bg-card" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-3 sm:p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-3 h-10 w-full" />
      </div>
    </li>
  );
}

export function ProductGridSkeleton({ count = 8, sidebar = false }) {
  return (
    <ul className={gridClass(sidebar)} role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </ul>
  );
}

export function CategorySkeleton({ count = 4 }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="status" aria-label="Loading categories">
      {Array.from({ length: count }, (_, i) => <li key={i}><Skeleton className="h-24 w-full" /></li>)}
    </ul>
  );
}

export function RowsSkeleton({ count = 4, className = 'h-24' }) {
  return (
    <ul className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => <li key={i}><Skeleton className={`${className} w-full`} /></li>)}
    </ul>
  );
}
