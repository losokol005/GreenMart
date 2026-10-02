import { useState } from 'react';
import { api, qs } from '../api';
import { useAsync } from '../useAsync';
import { useCart } from '../context/Cart';
import { formatMoney } from '../format';
import { Loading, ErrorMessage, Empty, Pager } from '../components/UI';

export default function Products() {
  const [q, setQ] = useState('');
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { add, items } = useCart();
  const [added, setAdded] = useState('');

  const cats = useAsync(() => api('/products/categories'), []);
  const list = useAsync(() => api(`/products${qs({ q, category, page, limit: 12 })}`), [q, category, page]);

  const inCart = (id) => items.find((i) => i.productId === id)?.quantity || 0;

  return (
    <>
      <h1>Fresh produce</h1>
      <form className="toolbar" role="search" onSubmit={(e) => { e.preventDefault(); setPage(1); setQ(input.trim()); }}>
        <label className="sr-only" htmlFor="search">Search products</label>
        <input id="search" type="search" placeholder="Search avocados, potatoes, greens…" value={input} maxLength={60} onChange={(e) => setInput(e.target.value)} />
        <label className="sr-only" htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }}>
          <option value="">All categories</option>
          {(cats.data?.items || []).map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="primary" type="submit">Search</button>
      </form>
      <p className="sr-only" role="status">{added}</p>
      <ErrorMessage error={list.error} onRetry={list.reload} />
      {list.loading && !list.data && <Loading />}
      {list.data && list.data.items.length === 0 && <Empty>No products found. Try a different search.</Empty>}
      <ul className="grid">
        {(list.data?.items || []).map((p) => (
          <li key={p.id} className="card">
            {p.imageUrl && <img src={p.imageUrl} alt="" loading="lazy" />}
            <h2>{p.name}</h2>
            <p className="muted">{p.category}</p>
            <p className="price">{formatMoney(p.priceCents)} <small>/ {p.unit}</small></p>
            <p className={p.stock <= 5 ? 'warn' : 'muted'}>{p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock'}</p>
            <button className="primary" disabled={p.stock === 0 || inCart(p.id) >= p.stock}
              onClick={() => { add(p, 1); setAdded(`${p.name} added to cart`); }}>
              {inCart(p.id) >= p.stock && p.stock > 0 ? 'Max in cart' : 'Add to cart'}
            </button>
          </li>
        ))}
      </ul>
      <Pager data={list.data} onPage={setPage} />
    </>
  );
}
