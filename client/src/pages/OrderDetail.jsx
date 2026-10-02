import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, FileText, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { formatDate, formatMoney } from '@/format';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Container from '@/components/common/Container';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { RowsSkeleton } from '@/components/common/LoadingSkeleton';
import OrderTimeline from '@/components/orders/OrderTimeline';
import StatusBadge from '@/components/orders/StatusBadge';

export default function OrderDetail() {
  const { id } = useParams();
  const justPlaced = useLocation().state?.justPlaced;
  const { data, error, loading, reload } = useAsync(() => api(`/orders/${id}`), [id]);
  const [cancelOpen, setCancelOpen] = useState(false);
  useTitle(data ? `Order ${data.order.orderNumber}` : 'Order');

  if (loading && !data) return <Container className="max-w-4xl py-8"><RowsSkeleton count={3} className="h-32" /></Container>;
  if (error) return <Container className="max-w-xl py-10"><ErrorState error={error} onRetry={reload} /></Container>;
  const o = data.order;

  const cancel = async () => {
    await api(`/orders/${id}/cancel`, { method: 'POST' });
    toast.success('Order cancelled');
    window.dispatchEvent(new Event('gm:notifications'));
    reload();
  };

  return (
    <Container className="max-w-4xl py-8">
      <PageHeader
        title={`Order ${o.orderNumber}`}
        description={`Placed ${formatDate(o.createdAt)}`}
        actions={<>
          <Button asChild variant="outline"><Link to={`/orders/${o.id}/receipt`}><FileText aria-hidden="true" /> Receipt</Link></Button>
          {o.status === 'pending' && <Button variant="outline" className="text-destructive" onClick={() => setCancelOpen(true)}>Cancel order</Button>}
        </>}
      />
      {justPlaced && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>Thank you! Your order has been placed.</AlertTitle>
          <AlertDescription>We'll update you here as it's confirmed and delivered. Please have cash ready on delivery.</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Items</CardTitle><StatusBadge status={o.status} />
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {o.items.map((i) => (
                    <TableRow key={i.product}>
                      <TableCell><p className="font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{formatMoney(i.priceCents)} / {i.unit}</p></TableCell>
                      <TableCell className="text-right">{i.quantity}</TableCell>
                      <TableCell className="text-right">{formatMoney(i.lineTotalCents)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow><TableCell colSpan={2}>Delivery</TableCell><TableCell className="text-right">{o.deliveryFeeCents === 0 ? 'Free' : formatMoney(o.deliveryFeeCents)}</TableCell></TableRow>
                  <TableRow><TableCell colSpan={2} className="font-bold">Total</TableCell><TableCell className="text-right font-bold">{formatMoney(o.totalCents)}</TableCell></TableRow>
                </TableFooter>
              </Table>
              <p className="px-3 pt-3 text-xs text-muted-foreground">Payment: cash on delivery — {o.paymentStatus === 'paid' ? 'paid' : 'not yet paid'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{o.delivery.fullName}</p>
              <p className="flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{o.delivery.address}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" aria-hidden="true" />{o.delivery.phone}</p>
              {o.delivery.notes && <p className="italic text-muted-foreground">“{o.delivery.notes}”</p>}
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
          <CardContent><OrderTimeline history={o.statusHistory} /></CardContent>
        </Card>
      </div>
      <ConfirmDialog open={cancelOpen} onOpenChange={setCancelOpen} title="Cancel this order?" description="Your items will be returned to stock. This can't be undone." confirmLabel="Cancel order" destructive onConfirm={cancel} />
    </Container>
  );
}
