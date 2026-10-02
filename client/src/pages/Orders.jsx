import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, qs } from '../api';
import { useAsync } from '../useAsync';
import { formatMoney, formatDate, STATUS_LABEL } from '../format';
import { Loading, ErrorMessage, Empty, Pager } from '../components/UI';

export default function Orders() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useAsync(() => api(`/orders${qs({ page, limit: 10 })}`), [page]);
  return (
    <>
      <h1>My orders</h1>
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <Loading />}
      {data && data.items.length === 0 && <Empty>No orders yet. <Link to="/">Start shopping</Link></Empty>}
      <ul className="list">
        {(data?.items || []).map((o) => (
          <li key={o.id} className="card row">
            <div>
              <Link to={`/orders/${o.id}`}><strong>{o.orderNumber}</strong></Link>
              <p className="muted">{formatDate(o.createdAt)} · {o.items.length} item(s)</p>
            </div>
            <div><span className={`status ${o.status}`}>{STATUS_LABEL[o.status]}</span> <strong>{formatMoney(o.totalCents)}</strong></div>
          </li>
        ))}
      </ul>
      <Pager data={data} onPage={setPage} />
    </>
  );
}
