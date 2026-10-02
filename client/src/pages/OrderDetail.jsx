import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../useAsync';
import { formatMoney, formatDate, STATUS_LABEL } from '../format';
import { Loading, ErrorMessage } from '../components/UI';

export default function OrderDetail() {
  const { id } = useParams();
  const { data, error, loading, reload } = useAsync(() => api(`/orders/${id}`), [id]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function cancel() {
    if (busy || !window.confirm('Cancel this order?')) return;
    setBusy(true); setActionError(null);
    try { await api(`/orders/${id}/cancel`, { method: 'POST' }); reload(); } catch (e) { setActionError(e); }
    setBusy(false);
  }

  if (loading && !data) return <Loading />;
  if (error) return <ErrorMessage error={error} onRetry={reload} />;
  const o = data.order;
  return (
    <>
      <h1>Order {o.orderNumber}</h1>
      <p><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span> · placed {formatDate(o.createdAt)} · Payment: {o.paymentStatus === 'paid' ? 'Paid' : 'Cash on delivery'}</p>
      <ErrorMessage error={actionError} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
          <tbody>{o.items.map((i) => <tr key={i.product}><td>{i.name}</td><td>{formatMoney(i.priceCents)} / {i.unit}</td><td>{i.quantity}</td><td>{formatMoney(i.lineTotalCents)}</td></tr>)}</tbody>
          <tfoot>
            <tr><td colSpan="3">Delivery</td><td>{formatMoney(o.deliveryFeeCents)}</td></tr>
            <tr><td colSpan="3"><strong>Total</strong></td><td><strong>{formatMoney(o.totalCents)}</strong></td></tr>
          </tfoot>
        </table>
      </div>
      <h2>Delivery</h2>
      <p>{o.delivery.fullName} · {o.delivery.phone}<br />{o.delivery.address}{o.delivery.notes && <><br /><em>{o.delivery.notes}</em></>}</p>
      <h2>Progress</h2>
      <ol className="timeline">{o.statusHistory.map((h, n) => <li key={n}>{STATUS_LABEL[h.status]} <span className="muted">— {formatDate(h.at)}</span></li>)}</ol>
      <p className="actions">
        <Link className="button" to={`/orders/${o.id}/receipt`}>View receipt</Link>
        {o.status === 'pending' && <button className="danger" onClick={cancel} disabled={busy}>Cancel order</button>}
      </p>
    </>
  );
}
