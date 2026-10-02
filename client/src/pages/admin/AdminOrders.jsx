import { useState } from 'react';
import { ClipboardList, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { api, qs } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { formatDate, formatMoney, STATUS_LABEL } from '@/format';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminShell from '@/components/admin/AdminShell';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { RowsSkeleton } from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/orders/StatusBadge';

// Mirrors the server's allowed transitions (the server remains the authority).
const NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['out_for_delivery', 'cancelled'], out_for_delivery: ['delivered'], delivered: [], cancelled: [] };
const VERB = { confirmed: 'Confirm order', out_for_delivery: 'Dispatch', delivered: 'Mark delivered', cancelled: 'Cancel order' };
const ALL = 'all';

export default function AdminOrders() {
  useTitle('Admin · Orders');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const { data, error, loading, reload } = useAsync(() => api(`/admin/orders${qs({ status, page, limit: 15 })}`), [status, page]);

  async function move(o, to) {
    setBusyId(o.id);
    try {
      await api(`/admin/orders/${o.id}/status`, { method: 'PATCH', body: { status: to } });
      toast.success(`${o.orderNumber}: ${STATUS_LABEL[to].toLowerCase()}`);
    } catch (e) {
      toast.error(e.message);
      if (e.status === 409) reload(); // someone else changed it
      throw e;
    } finally { setBusyId(null); }
    reload();
  }
  const safeMove = (o, to) => move(o, to).catch(() => {});

  return (
    <AdminShell title="Orders" description="Confirm, dispatch and complete customer orders.">
      <div className="mb-4 max-w-xs">
        <Select value={status || ALL} onValueChange={(v) => { setPage(1); setStatus(v === ALL ? '' : v); }}>
          <SelectTrigger aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading && !data && <RowsSkeleton count={4} className="h-36" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.items.length === 0 && <EmptyState icon={ClipboardList} title="No orders found">{status ? 'No orders have this status.' : 'Orders will appear here as customers place them.'}</EmptyState>}
      {data && data.items.length > 0 && (
        <ul className={`space-y-3 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          {data.items.map((o) => (
            <li key={o.id} className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)} · {o.user?.name || 'Deleted user'}</p>
                </div>
                <div className="text-right"><StatusBadge status={o.status} /><p className="mt-1 font-bold">{formatMoney(o.totalCents)}</p></div>
              </div>
              <p className="mt-3 text-sm">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{o.delivery.address}{o.delivery.notes && ` (${o.delivery.notes})`}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" aria-hidden="true" /><a className="underline" href={`tel:${o.delivery.phone}`}>{o.delivery.phone}</a></p>
              </div>
              {NEXT[o.status].length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {NEXT[o.status].map((to) => to === 'cancelled'
                    ? <Button key={to} variant="outline" className="text-destructive" disabled={busyId === o.id} onClick={() => setCancelTarget(o)}>{VERB[to]}</Button>
                    : <Button key={to} disabled={busyId === o.id} onClick={() => safeMove(o, to)}>{VERB[to]}</Button>)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />}
      <ConfirmDialog open={Boolean(cancelTarget)} onOpenChange={(o) => !o && setCancelTarget(null)} title={`Cancel ${cancelTarget?.orderNumber}?`}
        description="The customer will be notified and the items returned to stock." confirmLabel="Cancel order" destructive onConfirm={() => move(cancelTarget, 'cancelled')} />
    </AdminShell>
  );
}
