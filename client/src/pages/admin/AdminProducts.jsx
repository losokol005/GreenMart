import { useState } from 'react';
import { PackageSearch, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { api, qs } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { formatMoney, isOnSale } from '@/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminShell from '@/components/admin/AdminShell';
import ProductFormDialog from '@/components/admin/ProductFormDialog';
import StockDialog from '@/components/admin/StockDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { RowsSkeleton } from '@/components/common/LoadingSkeleton';
import ProductImage from '@/components/products/ProductImage';

export default function AdminProducts() {
  useTitle('Admin · Products');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [text, setText] = useState('');
  const [form, setForm] = useState({ open: false, product: null });
  const [stockFor, setStockFor] = useState(null);
  const [hideFor, setHideFor] = useState(null);
  const { data, error, loading, reload } = useAsync(() => api(`/admin/products${qs({ q, page, limit: 20 })}`), [q, page]);

  const restore = async (p) => {
    try { await api(`/admin/products/${p.id}`, { method: 'PATCH', body: { active: true } }); toast.success(`${p.name} is visible in the shop again`); reload(); }
    catch (e) { toast.error(e.message); }
  };
  const hide = async () => { await api(`/admin/products/${hideFor.id}`, { method: 'DELETE' }); toast.success(`${hideFor.name} hidden from the shop`); reload(); };

  return (
    <AdminShell title="Products & stock" description="Manage your catalogue, prices and inventory."
      actions={<Button onClick={() => setForm({ open: true, product: null })}><Plus aria-hidden="true" /> Add product</Button>}>
      <form role="search" className="mb-4 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setQ(text.trim()); }}>
        <div className="relative flex-1">
          <label htmlFor="admin-product-search" className="sr-only">Search products</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="admin-product-search" type="search" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} placeholder="Search by name" className="pl-9" />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {loading && !data && <RowsSkeleton count={5} className="h-14" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.items.length === 0 && (
        <EmptyState icon={PackageSearch} title={q ? 'No matching products' : 'No products yet'} actions={!q && <Button onClick={() => setForm({ open: true, product: null })}>Add your first product</Button>}>
          {q ? 'Try a different search.' : 'Add products so customers can start ordering.'}
        </EmptyState>
      )}
      {data && data.items.length > 0 && (
        <div className={`rounded-lg border border-border bg-card shadow-card ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          <Table>
            <TableHeader>
              <TableRow><TableHead className="w-14"><span className="sr-only">Image</span></TableHead><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((p) => (
                <TableRow key={p.id} className={p.active ? '' : 'bg-muted/40 text-muted-foreground'}>
                  <TableCell><ProductImage src={p.imageUrl} alt="" className="h-10 w-10 rounded-md" /></TableCell>
                  <TableCell><p className="font-medium text-foreground">{p.name}</p><p className="text-xs">{p.category}</p></TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatMoney(p.priceCents)} / {p.unit}
                    {isOnSale(p) && <><s className="ml-1 text-xs">{formatMoney(p.compareAtPriceCents)}</s> <Badge variant="soil" className="ml-1">Deal</Badge></>}
                  </TableCell>
                  <TableCell className={p.stock <= 10 ? 'font-semibold text-soil' : ''}>{p.stock}{p.stock === 0 && ' (out)'}</TableCell>
                  <TableCell>{p.active ? <Badge variant="soft">Active</Badge> : <Badge variant="muted">Hidden</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setForm({ open: true, product: p })} aria-label={`Edit ${p.name}`}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => setStockFor(p)} aria-label={`Adjust stock for ${p.name}`}>Stock</Button>
                      {p.active
                        ? <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setHideFor(p)} aria-label={`Hide ${p.name}`}>Hide</Button>
                        : <Button size="sm" variant="ghost" onClick={() => restore(p)} aria-label={`Restore ${p.name}`}>Restore</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />}

      <ProductFormDialog open={form.open} product={form.product} onOpenChange={(o) => setForm((f) => ({ ...f, open: o }))} onSaved={reload} />
      <StockDialog product={stockFor} onClose={() => setStockFor(null)} onSaved={reload} />
      <ConfirmDialog open={Boolean(hideFor)} onOpenChange={(o) => !o && setHideFor(null)} title={`Hide ${hideFor?.name}?`}
        description="It will disappear from the shop but stay in past orders. You can restore it any time." confirmLabel="Hide product" destructive onConfirm={hide} />
    </AdminShell>
  );
}
