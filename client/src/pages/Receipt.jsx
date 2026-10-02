import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../useAsync';
import { formatMoney, formatDate, STATUS_LABEL } from '../format';
import { Loading, ErrorMessage } from '../components/UI';

export default function Receipt() {
  const { id } = useParams();
  const { data, error, loading, reload } = useAsync(() => api(`/orders/${id}/receipt`), [id]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  const r = data.receipt;
  return (
    <article className="receipt">
      <header>
        <h1>{r.store.name}</h1>
        <p>{r.store.address}{r.store.phone && ` · ${r.store.phone}`}</p>
        <p><strong>Receipt {r.receiptNumber}</strong><br />{formatDate(r.issuedAt)} · {STATUS_LABEL[r.status]}</p>
      </header>
      <p>Customer: {r.customer.name} ({r.customer.email})<br />Deliver to: {r.delivery.address}</p>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>{r.items.map((i) => <tr key={i.product}><td>{i.name}</td><td>{i.quantity} {i.unit}</td><td>{formatMoney(i.priceCents)}</td><td>{formatMoney(i.lineTotalCents)}</td></tr>)}</tbody>
        <tfoot>
          <tr><td colSpan="3">Subtotal</td><td>{formatMoney(r.subtotalCents)}</td></tr>
          <tr><td colSpan="3">Delivery</td><td>{formatMoney(r.deliveryFeeCents)}</td></tr>
          <tr><td colSpan="3"><strong>Total</strong></td><td><strong>{formatMoney(r.totalCents)}</strong></td></tr>
        </tfoot>
      </table>
      <p>Payment: Cash on delivery — {r.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}</p>
      <p className="no-print actions">
        <button className="primary" onClick={() => window.print()}>Print / save as PDF</button>
        <Link className="button" to={`/orders/${id}`}>Back to order</Link>
      </p>
    </article>
  );
}
