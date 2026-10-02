import { useState } from 'react';
import { api, qs } from '../../api';
import { useAsync } from '../../useAsync';
import { formatMoney, formatDate, STATUS_LABEL } from '../../format';
import { Loading, ErrorMessage, Empty, Pager } from '../../components/UI';
import AdminNav from './AdminNav';

const NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['out_for_delivery', 'cancelled'], out_for_delivery: ['delivered'], delivered: [], cancelled: [] };
const VERB = { confirmed: 'Confirm', out_for_delivery: 'Dispatch', delivered: 'Mark delivered', cancelled: 'Cancel' };

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const { data, error, loading, reload } = useAsync(() => api(`/admin/orders${qs({ status, page, limit: 15 })}`), [status, page]);

  async function move(o, to) {
    if (busyId) return;
    if (to === 'cancelled' && !window.confirm(`Cancel order ${o.orderNumber}? Stock will be restored.`)) return;
    setBusyId(o.id); setActionError(null);
    try { await api(`/admin/orders/${o.id}/status`, { method: 'PATCH', body: { status: to } }); } catch (e) { setActionError(e); }
    setBusyId(null);
    reload();
  }

  return (
    <>
      <h1>Orders</h1>
      <AdminNav />
      <label>Filter by status{' '}
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <ErrorMessage error={error || actionError} onRetry={reload} />
      {loading && !data && <Loading />}
      {data && data.items.length === 0 && <Empty>No orders match.</Empty>}
      <ul className="list">
        {(data?.items || []).map((o) => (
          <li key={o.id} className="card">
            <div className="row">
              <strong>{o.orderNumber}</strong>
              <span><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span> <strong>{formatMoney(o.totalCents)}</strong></span>
            </div>
            <p className="muted">{formatDate(o.createdAt)} · {o.user?.name} · {o.delivery.phone}</p>
            <p>{o.delivery.address}{o.delivery.notes && ` (${o.delivery.notes})`}</p>
            <p>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
            <p className="actions">
              {NEXT[o.status].map((to) => (
                <button key={to} className={to === 'cancelled' ? 'danger' : 'primary'} disabled={busyId === o.id} onClick={() => move(o, to)}>{VERB[to]}</button>
              ))}
            </p>
          </li>
        ))}
      </ul>
      <Pager data={data} onPage={setPage} />
    </>
  );
}
