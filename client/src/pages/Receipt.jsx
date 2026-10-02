import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { formatDate, formatMoney } from '@/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Container from '@/components/common/Container';
import ErrorState from '@/components/common/ErrorState';
import Logo from '@/components/common/Logo';
import { RowsSkeleton } from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/orders/StatusBadge';

export default function Receipt() {
  const { id } = useParams();
  const { data, error, loading, reload } = useAsync(() => api(`/orders/${id}/receipt`), [id]);
  useTitle(data ? `Receipt ${data.receipt.receiptNumber}` : 'Receipt');
  if (loading && !data) return <Container className="max-w-2xl py-8"><RowsSkeleton count={2} className="h-48" /></Container>;
  if (error) return <Container className="max-w-xl py-10"><ErrorState error={error} onRetry={reload} /></Container>;
  const r = data.receipt;
  return (
    <Container className="max-w-2xl py-8">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost"><Link to={`/orders/${id}`}><ArrowLeft aria-hidden="true" /> Back to order</Link></Button>
        <Button onClick={() => window.print()}><Printer aria-hidden="true" /> Print / save as PDF</Button>
      </div>
      <Card className="print:border-0 print:shadow-none">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Logo className="h-10" />
              <p className="mt-2 text-sm text-muted-foreground">{r.store.address}{r.store.phone && ` · ${r.store.phone}`}</p>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold">Receipt</h1>
              <p className="text-sm font-medium">{r.receiptNumber}</p>
              <p className="text-xs text-muted-foreground">{formatDate(r.issuedAt)}</p>
              <StatusBadge status={r.status} className="mt-1" />
            </div>
          </header>
          <Separator />
          <section className="grid gap-4 text-sm sm:grid-cols-2">
            <div><h2 className="mb-1 text-xs font-semibold text-muted-foreground">Customer</h2><p className="font-medium">{r.customer.name}</p><p className="text-muted-foreground">{r.customer.email}</p></div>
            <div><h2 className="mb-1 text-xs font-semibold text-muted-foreground">Deliver to</h2><p className="font-medium">{r.delivery.fullName}</p><p className="text-muted-foreground">{r.delivery.address}</p><p className="text-muted-foreground">{r.delivery.phone}</p></div>
          </section>
          <Table>
            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {r.items.map((i) => (
                <TableRow key={i.product}><TableCell>{i.name}</TableCell><TableCell className="text-right">{i.quantity} {i.unit}</TableCell><TableCell className="text-right">{formatMoney(i.priceCents)}</TableCell><TableCell className="text-right">{formatMoney(i.lineTotalCents)}</TableCell></TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow><TableCell colSpan={3}>Subtotal</TableCell><TableCell className="text-right">{formatMoney(r.subtotalCents)}</TableCell></TableRow>
              <TableRow><TableCell colSpan={3}>Delivery</TableCell><TableCell className="text-right">{r.deliveryFeeCents === 0 ? 'Free' : formatMoney(r.deliveryFeeCents)}</TableCell></TableRow>
              <TableRow><TableCell colSpan={3} className="text-base font-bold">Total</TableCell><TableCell className="text-right text-base font-bold">{formatMoney(r.totalCents)}</TableCell></TableRow>
            </TableFooter>
          </Table>
          <p className="text-sm text-muted-foreground">Payment: cash on delivery — <strong className="text-foreground">{r.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}</strong></p>
          <p className="text-center text-xs text-muted-foreground">Thank you for shopping with GreenMart.</p>
        </CardContent>
      </Card>
    </Container>
  );
}
