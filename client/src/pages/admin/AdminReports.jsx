import { useState } from 'react';
import { api, qs } from '../../api';
import { useAsync } from '../../useAsync';
import { formatMoney, STATUS_LABEL } from '../../format';
import { Loading, ErrorMessage, Empty } from '../../components/UI';
import AdminNav from './AdminNav';

const iso = (d) => d.toISOString().slice(0, 10);

export default function AdminReports() {
  const today = new Date();
  const [from, setFrom] = useState(iso(new Date(today.getTime() - 29 * 86400000)));
  const [to, setTo] = useState(iso(today));
  const { data, error, loading, reload } = useAsync(
    () => api(`/admin/reports/summary${qs({ from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` })}`), [from, to]);

  return (
    <>
      <h1>Reports</h1>
      <AdminNav />
      <div className="toolbar">
        <label>From <input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} /></label>
        <label>To <input type="date" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} /></label>
      </div>
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <Loading />}
      {data && (
        <>
          <div className="stats">
            <div className="card"><p className="muted">Delivered revenue</p><p className="big">{formatMoney(data.deliveredRevenueCents)}</p></div>
            <div className="card"><p className="muted">Delivered orders</p><p className="big">{data.deliveredOrders}</p></div>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <div className="card" key={k}><p className="muted">{v}</p><p className="big">{data.ordersByStatus[k] || 0}</p></div>
            ))}
          </div>
          <h2>Top products</h2>
          {data.topProducts.length === 0 ? <Empty>No sales in this period.</Empty> : (
            <ol>{data.topProducts.map((p) => <li key={p.productId}>{p.name} — {p.quantity} sold ({formatMoney(p.salesCents)})</li>)}</ol>
          )}
          <h2>Low stock (≤ {data.lowStockThreshold})</h2>
          {data.lowStock.length === 0 ? <Empty>Nothing running low.</Empty> : (
            <ul>{data.lowStock.map((p) => <li key={p.id}>{p.name}: <strong>{p.stock}</strong> left</li>)}</ul>
          )}
        </>
      )}
    </>
  );
}
