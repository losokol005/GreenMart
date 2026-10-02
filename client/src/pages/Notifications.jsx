import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../useAsync';
import { formatDate } from '../format';
import { Loading, ErrorMessage, Empty } from '../components/UI';

export default function Notifications() {
  const { data, error, loading, reload } = useAsync(() => api('/notifications'), []);
  const markAll = async () => { await api('/notifications/read-all', { method: 'POST' }).catch(() => {}); reload(); };
  return (
    <>
      <h1>Order updates</h1>
      <ErrorMessage error={error} onRetry={reload} />
      {loading && !data && <Loading />}
      {data && data.items.length === 0 && <Empty>No updates yet.</Empty>}
      {data && data.unread > 0 && <button onClick={markAll}>Mark all as read</button>}
      <ul className="list">
        {(data?.items || []).map((n) => (
          <li key={n.id} className={`card ${n.read ? '' : 'unread'}`}>
            {n.order ? <Link to={`/orders/${n.order}`}>{n.message}</Link> : n.message}
            <p className="muted">{formatDate(n.createdAt)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
