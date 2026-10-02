import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { api, qs } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Container from '@/components/common/Container';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton';
import ProductGrid from '@/components/products/ProductGrid';
import SearchBar from '@/components/products/SearchBar';
import FilterPanel from '@/components/products/FilterPanel';

const PAGE_SIZE = 12;
const toCents = (v) => (v === '' || Number.isNaN(Number(v)) ? undefined : Math.round(Number(v) * 100));

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categories = useCategories();

  const f = {
    q: params.get('q') || '',
    category: params.get('category') || '',
    page: Math.max(1, Number(params.get('page')) || 1),
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    inStock: params.get('inStock') === '1',
    onSale: params.get('onSale') === '1',
  };
  useTitle(f.onSale ? 'Deals' : f.category || 'Shop');

  // Filters live in the URL so results can be shared, bookmarked and survive refresh.
  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v == null || v === false) next.delete(k);
      else next.set(k, v === true ? '1' : String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };
  const clearAll = () => setParams(new URLSearchParams());

  const sidebarCount = [f.minPrice, f.maxPrice, f.inStock, f.onSale].filter(Boolean).length;
  const hasFilters = Boolean(f.q || f.category || sidebarCount);

  const query = qs({
    q: f.q, category: f.category, page: f.page, limit: PAGE_SIZE,
    minPriceCents: toCents(f.minPrice), maxPriceCents: toCents(f.maxPrice),
    inStock: f.inStock ? '1' : undefined, onSale: f.onSale ? '1' : undefined,
  });
  const list = useAsync(() => api(`/products${query}`), [query]);
  const panel = (idPrefix, after) => (
    <FilterPanel key={`${idPrefix}-${f.minPrice}-${f.maxPrice}-${f.inStock}-${f.onSale}`} idPrefix={idPrefix} values={f}
      onApply={(d) => { update({ minPrice: d.minPrice, maxPrice: d.maxPrice, inStock: d.inStock, onSale: d.onSale }); after?.(); }}
      onReset={() => { update({ minPrice: '', maxPrice: '', inStock: false, onSale: false }); after?.(); }} />
  );

  const items = list.data?.items;
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold">{f.onSale ? 'Deals' : f.category || 'Shop fresh produce'}</h1>
      <p className="mt-1 text-muted-foreground">Fresh fruits, vegetables and greens from trusted local suppliers.</p>

      <div className="mt-6 space-y-3">
        <SearchBar q={f.q} category={f.category} categories={categories.data?.items || []} loading={list.loading}
          hasFilters={hasFilters} onClear={clearAll} onSearch={update} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {list.data ? `${list.data.total} product${list.data.total === 1 ? '' : 's'}` : '\u00A0'}
          </p>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal aria-hidden="true" /> Filters{sidebarCount > 0 && ` (${sidebarCount})`}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-4 shadow-card">
            <h2 className="mb-4 text-base font-semibold">Filters</h2>
            {panel('desktop')}
          </div>
        </aside>

        <div>
          {list.loading && !list.data && <ProductGridSkeleton sidebar count={PAGE_SIZE} />}
          {list.error && <ErrorState error={list.error} onRetry={list.reload} />}
          {items && items.length === 0 && (
            <EmptyState icon={SearchX} title="No fresh produce found"
              actions={<>{hasFilters && <Button onClick={clearAll}>Clear filters</Button>}<Button variant="outline" onClick={clearAll}>Browse all products</Button></>}>
              Try another search or browse all available produce.
            </EmptyState>
          )}
          {items && items.length > 0 && (
            <>
              <ProductGrid products={items} sidebar busy={list.loading} />
              <Pagination page={list.data.page} pages={list.data.pages} onPageChange={(p) => { update({ page: p > 1 ? p : '' }); window.scrollTo(0, 0); }} />
            </>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription className="sr-only">Narrow the product list</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">{panel('mobile', () => setFiltersOpen(false))}</div>
        </SheetContent>
      </Sheet>
    </Container>
  );
}
