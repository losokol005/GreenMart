import { BadgePercent } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { categoryHref, dealsHref } from '@/components/navigation/navItems';
import { CategorySkeleton } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import Container from '@/components/common/Container';
import CategoryCard from './CategoryCard';
import { categoryIcon } from './categoryIcon';

export default function CategorySection() {
  const { data, error, loading, reload } = useCategories();
  return (
    <section id="categories" aria-labelledby="categories-title" className="scroll-mt-20 py-12">
      <Container>
        <h2 id="categories-title" className="text-2xl font-semibold">Shop by category</h2>
        <p className="mt-1 text-muted-foreground">Find exactly what you need, straight from the farm.</p>
        <div className="mt-6">
          {loading && !data && <CategorySkeleton />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {data.items.map((c) => <CategoryCard key={c} to={categoryHref(c)} icon={categoryIcon(c)} label={c} />)}
              <CategoryCard to={dealsHref} icon={BadgePercent} label="Deals" accent />
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
