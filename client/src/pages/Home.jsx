import { Link } from 'react-router-dom';
import { ArrowRight, Sprout } from 'lucide-react';
import { api } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { Button } from '@/components/ui/button';
import Container from '@/components/common/Container';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton';
import Hero from '@/components/hero/Hero';
import CategorySection from '@/components/categories/CategorySection';
import ProductGrid from '@/components/products/ProductGrid';
import { shopHref, dealsHref } from '@/components/navigation/navItems';

function Section({ id, title, subtitle, href, linkLabel, children }) {
  return (
    <section aria-labelledby={id} className="py-10">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id={id} className="text-2xl font-semibold">{title}</h2>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          <Button asChild variant="ghost"><Link to={href}>{linkLabel} <ArrowRight aria-hidden="true" /></Link></Button>
        </div>
        {children}
      </Container>
    </section>
  );
}

export default function Home() {
  useTitle('');
  const fresh = useAsync(() => api('/products?limit=8'), []);
  const deals = useAsync(() => api('/products?onSale=1&limit=4'), []);

  return (
    <>
      <Hero />
      <CategorySection />
      {deals.data?.items.length > 0 && (
        <Section id="deals-title" title="Deals this week" subtitle="Fresh produce at a lower price." href={dealsHref} linkLabel="All deals">
          <ProductGrid products={deals.data.items} />
        </Section>
      )}
      <Section id="fresh-title" title="Fresh picks" subtitle="Popular produce, ready to order." href={shopHref} linkLabel="View all products">
        {fresh.loading && !fresh.data && <ProductGridSkeleton />}
        {fresh.error && <ErrorState error={fresh.error} onRetry={fresh.reload} />}
        {fresh.data && fresh.data.items.length === 0 && (
          <EmptyState icon={Sprout} title="Fresh produce is on its way">New products are added regularly. Please check back soon.</EmptyState>
        )}
        {fresh.data && fresh.data.items.length > 0 && <ProductGrid products={fresh.data.items} />}
      </Section>
    </>
  );
}
