import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Field from '@/components/auth/Field';

const UNITS = ['kg', 'bunch', 'piece', 'bag'];
const BLANK = { name: '', description: '', price: '', compareAt: '', unit: 'kg', category: 'Vegetables', stock: '0', imageUrl: '' };
// Server field names -> form field names (for showing server-side validation errors inline)
const FIELD = { priceCents: 'price', compareAtPriceCents: 'compareAt' };

const toForm = (p) => p ? {
  name: p.name, description: p.description || '', price: String(p.priceCents / 100), compareAt: p.compareAtPriceCents ? String(p.compareAtPriceCents / 100) : '',
  unit: p.unit, category: p.category, stock: String(p.stock), imageUrl: p.imageUrl || '',
} : BLANK;

export default function ProductFormDialog({ open, onOpenChange, product, onSaved }) {
  const editing = Boolean(product);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setForm(toForm(product)); setErrors({}); setFormError(''); } }, [open, product]);
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: undefined }); };

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const found = {};
    const priceCents = Math.round(parseFloat(form.price) * 100);
    const compareAt = form.compareAt === '' ? null : Math.round(parseFloat(form.compareAt) * 100);
    if (!form.name.trim()) found.name = 'Enter a product name.';
    if (!Number.isFinite(priceCents) || priceCents < 0) found.price = 'Enter a valid price.';
    if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt <= priceCents)) found.compareAt = 'Must be higher than the selling price.';
    if (!form.category.trim()) found.category = 'Enter a category.';
    if (!editing && !(Number.isInteger(Number(form.stock)) && Number(form.stock) >= 0)) found.stock = 'Enter a whole number, 0 or more.';
    setErrors(found); setFormError('');
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`pf-${first}`)?.focus(); return; }

    const body = { name: form.name.trim(), description: form.description.trim(), priceCents, compareAtPriceCents: compareAt, unit: form.unit, category: form.category.trim(), imageUrl: form.imageUrl.trim() };
    if (!editing) body.stock = Number(form.stock);
    setBusy(true);
    try {
      if (editing) await api(`/admin/products/${product.id}`, { method: 'PATCH', body });
      else await api('/admin/products', { method: 'POST', body });
      toast.success(editing ? 'Product updated' : 'Product added');
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const fe = {};
      (err.details || []).forEach((d) => { if (d.path) fe[FIELD[d.path] || d.path] = d.message; });
      setErrors(fe);
      setFormError(Object.keys(fe).length ? 'Please check the highlighted fields.' : err.message);
    }
    setBusy(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${product.name}` : 'Add product'}</DialogTitle>
          <DialogDescription>Prices are in Kenyan shillings (KES).</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          {formError && <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertDescription>{formError}</AlertDescription></Alert>}
          <Field id="pf-name" label="Name" error={errors.name}>{(p) => <Input {...p} value={form.name} onChange={set('name')} maxLength={120} />}</Field>
          <Field id="pf-description" label="Description (optional)" error={errors.description}>{(p) => <Textarea {...p} value={form.description} onChange={set('description')} maxLength={1000} rows={2} />}</Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pf-price" label="Price (KES)" error={errors.price}>{(p) => <Input {...p} type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={set('price')} />}</Field>
            <Field id="pf-compareAt" label="Original price (optional)" error={errors.compareAt} hint="Set higher than the price to show a discount.">{(p) => <Input {...p} type="number" min="0" step="0.01" inputMode="decimal" value={form.compareAt} onChange={set('compareAt')} />}</Field>
            <div className="space-y-1.5">
              <label htmlFor="pf-unit" className="text-sm font-medium leading-none">Unit</label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger id="pf-unit"><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Field id="pf-category" label="Category" error={errors.category}>{(p) => <Input {...p} value={form.category} onChange={set('category')} maxLength={60} />}</Field>
          </div>
          {!editing
            ? <Field id="pf-stock" label="Starting stock" error={errors.stock}>{(p) => <Input {...p} type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={set('stock')} />}</Field>
            : <p className="text-sm text-muted-foreground">Current stock: <strong>{product.stock}</strong>. Use “Adjust stock” on the list to change it safely.</p>}
          <Field id="pf-imageUrl" label="Image URL (optional)" error={errors.imageUrl}>{(p) => <Input {...p} type="url" value={form.imageUrl} onChange={set('imageUrl')} maxLength={500} placeholder="https://…" />}</Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />} {busy ? 'Saving…' : 'Save product'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
