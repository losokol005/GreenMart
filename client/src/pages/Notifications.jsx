import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { formatDate } from '@/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Container from '@/components/common/Container';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { RowsSkeleton } from '@/components/common/LoadingSkeleton';

export default function Notifications() {
  useTitle('Order updates');
  const { data, error, loading, reload } = useAsync(() => api('/notifications'), []);
  const [busy, setBusy] = useState(false);

  async function markAll() {
    setBusy(true);
    try { await api('/notifications/read-all', { method: 'POST' }); window.dispatchEvent(new Event('gm:notifications')); reload(); }
    catch { toast.error("Couldn't update. Please try again."); }
    setBusy(false);
  }
  const markOne = (n) => { if (!n.read) api(`/notifications/${n.id}/read`, { method: 'POST' }).then(() => window.dispatchEvent(new Event('gm:notifications'))).catch(() => {}); };

  return (
    <Container className="max-w-2xl py-8">
      <PageHeader title="Order updates" description="Status changes for your orders."
        actions={data?.unread > 0 && <Button variant="outline" onClick={markAll} disabled={busy}><CheckCheck aria-hidden="true" /> Mark all as read</Button>} />
      {loading && !data && <RowsSkeleton count={3} className="h-16" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.items.length === 0 && <EmptyState icon={BellOff} title="No updates yet">We'll let you know here when your order status changes.</EmptyState>}
      {data && data.items.length > 0 && (
        <ul className="space-y-2">
          {data.items.map((n) => {
            const body = (
              <>
                <Bell className={cn('mt-0.5 h-4 w-4 shrink-0', n.read ? 'text-muted-foreground' : 'text-primary')} aria-hidden="true" />
                <div className="min-w-0">
                  <p className={cn('text-sm', !n.read && 'font-semibold')}>{!n.read && <span className="sr-only">Unread: </span>}{n.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                </div>
              </>
            );
            const cls = cn('flex gap-3 rounded-lg border bg-card p-4 shadow-card', n.read ? 'border-border' : 'border-primary/40 bg-accent/40');
            return <li key={n.id}>{n.order ? <Link to={`/orders/${n.order}`} onClick={() => markOne(n)} className={cn(cls, 'transition-shadow hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
          })}
        </ul>
      )}
    </Container>
  );
}
