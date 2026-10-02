import { useState } from 'react';
import { api, qs } from '../../api';
import { useAsync } from '../../useAsync';
import { formatMoney } from '../../format';
import { Loading, ErrorMessage, Empty, Pager } from '../../components/UI';
import AdminNav from './AdminNav';

const BLANK = { name: '', description: '', price: '', unit: 'kg', category: 'Vegetables', stock: '0', imageUrl: '' };

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null = closed, 'new' or product
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { data, error: loadError, loading, reload } = useAsync(() => api(`/admin/products${qs({ page, limit: 20 })}`), [page]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function open(p) {
    setError(null);
    setEditing(p || 'new');
    setForm(p ? { name: p.name, description: p.description || '', price: String(p.priceCents / 100), unit: p.unit, category: p.category, stock: String(p.stock), imageUrl: p.imageUrl || '' } : BLANK);
  }

  async function save(e) {
    e.preventDefault();
    if (saving) return;
    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) return setError(new Error('Enter a valid price'));
    const body = { name: form.name, description: form.description, priceCents, unit: form.unit, category: form.category, stock: parseInt(form.stock, 10) || 0, imageUrl: form.imageUrl };
    setSaving(true); setError(null);
    try {
      if (editing === 'new') await api('/admin/products', { method: 'POST', body });
      else await api(`/admin/products/${editing.id}`, { method: 'PATCH', body });
      setEditing(null); reload();
    } catch (err) { setError(err); }
    setSaving(false);
  }

  const run = async (fn) => { setError(null); try { await fn(); reload(); } catch (err) { setError(err); } };
  const adjust = (p) => {
    const raw = window.prompt(`Adjust stock for ${p.name} (use a negative number to remove). Current: ${p.stock}`, '10');
    const delta = parseInt(raw, 10);
    if (raw !== null && delta) run(() => api(`/admin/products/${p.id}/stock-adjust`, { method: 'POST', body: { delta } }));
  };

  return (
    <>
      <h1>Products &amp; stock</h1>
      <AdminNav />
      <button className="primary" onClick={() => open(null)}>Add product</button>
      <ErrorMessage error={loadError || error} onRetry={reload} />
      {editing && (
        <form className="form card" onSubmit={save}>
          <h2>{editing === 'new' ? 'New product' : `Edit ${editing.name}`}</h2>
          <label>Name<input required maxLength={120} value={form.name} onChange={set('name')} /></label>
          <label>Description<textarea maxLength={1000} rows={2} value={form.description} onChange={set('description')} /></label>
          <label>Price (KES)<input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} /></label>
          <label>Unit<select value={form.unit} onChange={set('unit')}>{['kg', 'bunch', 'piece', 'bag'].map((u) => <option key={u}>{u}</option>)}</select></label>
          <label>Category<input required maxLength={60} value={form.category} onChange={set('category')} /></label>
          <label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={set('stock')} /></label>
          <label>Image URL (optional)<input type="url" maxLength={500} value={form.imageUrl} onChange={set('imageUrl')} /></label>
          <p className="actions">
            <button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </p>
        </form>
      )}
      {loading && !data && <Loading />}
      {data && data.items.length === 0 && <Empty>No products yet.</Empty>}
      {data && data.items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'inactive'}>
                  <td>{p.name}<br /><small className="muted">{p.category}</small></td>
                  <td>{formatMoney(p.priceCents)} / {p.unit}</td>
                  <td className={p.stock <= 10 ? 'warn' : ''}>{p.stock}</td>
                  <td>{p.active ? 'Active' : 'Hidden'}</td>
                  <td className="actions">
                    <button onClick={() => open(p)}>Edit</button>
                    <button onClick={() => adjust(p)}>Adjust stock</button>
                    {p.active
                      ? <button className="danger" onClick={() => window.confirm(`Hide ${p.name} from the shop?`) && run(() => api(`/admin/products/${p.id}`, { method: 'DELETE' }))}>Hide</button>
                      : <button onClick={() => run(() => api(`/admin/products/${p.id}`, { method: 'PATCH', body: { active: true } }))}>Restore</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager data={data} onPage={setPage} />
    </>
  );
}
