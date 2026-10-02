import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { api, qs } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { formatMoney, STATUS_LABEL } from '@/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import AdminShell from '@/components/admin/AdminShell';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => iso(new Date(Date.now() - (n - 1) * 86400000));

function Stat({ label, value }) {
  return <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></CardContent></Card>;
}

export default function AdminReports() {
  useTitle('Admin · Reports');
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(iso(new Date()));
  const { data, error, loading, reload } = useAsync(
    () => api(`/admin/reports/summary${qs({ from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` })}`), [from, to]);
  const maxQty = Math.max(1, ...(data?.topProducts || []).map((p) => p.quantity));

  return (
    <AdminShell title="Reports" description="Sales and stock at a glance.">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5"><Label htmlFor="r-from">From</Label><Input id="r-from" type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="r-to">To</Label><Input id="r-to" type="date" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} /></div>
        <div className="flex gap-2" role="group" aria-label="Quick ranges">
          {[7, 30, 90].map((n) => <Button key={n} type="button" variant="outline" onClick={() => { setFrom(daysAgo(n)); setTo(iso(new Date())); }}>Last {n} days</Button>)}
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="status" aria-label="Loading report">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>}
      {data && (
        <div className={`space-y-8 ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          <section aria-label="Totals" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Delivered revenue" value={formatMoney(data.deliveredRevenueCents)} />
            <Stat label="Delivered orders" value={data.deliveredOrders} />
            {Object.entries(STATUS_LABEL).map(([k, v]) => <Stat key={k} label={v} value={data.ordersByStatus[k] || 0} />)}
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top products</CardTitle></CardHeader>
              <CardContent>
                {data.topProducts.length === 0 ? <p className="text-sm text-muted-foreground">No sales in this period.</p> : (
                  <ol className="space-y-4">
                    {data.topProducts.map((p) => (
                      <li key={p.productId}>
                        <div className="flex justify-between gap-2 text-sm"><span className="font-medium">{p.name}</span><span className="text-muted-foreground">{p.quantity} sold · {formatMoney(p.salesCents)}</span></div>
                        <div className="mt-1.5 h-2 rounded-full bg-muted" aria-hidden="true"><div className="h-2 rounded-full bg-primary" style={{ width: `${(p.quantity / maxQty) * 100}%` }} /></div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Low stock <span className="text-sm font-normal text-muted-foreground">(≤ {data.lowStockThreshold})</span></CardTitle></CardHeader>
              <CardContent>
                {data.lowStock.length === 0 ? <p className="text-sm text-muted-foreground">Nothing is running low.</p> : (
                  <ul className="divide-y divide-border">
                    {data.lowStock.map((p) => (
                      <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                        <span>{p.name}</span>
                        <span className={`flex items-center gap-1.5 font-semibold ${p.stock === 0 ? 'text-destructive' : 'text-soil'}`}>{p.stock === 0 && <AlertTriangle className="h-4 w-4" aria-hidden="true" />}{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {data && data.deliveredOrders === 0 && Object.keys(data.ordersByStatus).length === 0 && (
        <div className="mt-6"><EmptyState title="No orders in this period">Try a wider date range.</EmptyState></div>
      )}
    </AdminShell>
  );
}
