import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, PackageOpen } from 'lucide-react';
import { api, qs } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { formatDate, formatMoney } from '@/format';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import Container from '@/components/common/Container';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { RowsSkeleton } from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/orders/StatusBadge';

export default function Orders() {
  useTitle('My orders');
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useAsync(() => api(`/orders${qs({ page, limit: 10 })}`), [page]);
  return (
    <Container className="max-w-3xl py-8">
      <PageHeader title="My orders" description="Track your orders and view receipts." />
      {loading && !data && <RowsSkeleton />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.items.length === 0 && (
        <EmptyState icon={PackageOpen} title="No orders yet" actions={<Button asChild><Link to="/shop">Start shopping</Link></Button>}>When you place an order it will show up here.</EmptyState>
      )}
      {data && data.items.length > 0 && (
        <ul className={`space-y-3 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          {data.items.map((o) => (
            <li key={o.id}>
              <Link to={`/orders/${o.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="min-w-0">
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? '' : 's'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right"><StatusBadge status={o.status} /><p className="mt-1 text-sm font-bold">{formatMoney(o.totalCents)}</p></div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />}
    </Container>
  );
}
