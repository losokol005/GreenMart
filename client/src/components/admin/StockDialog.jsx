import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Field from '@/components/auth/Field';

// Relative, atomic stock change (safe even while customers are ordering).
export default function StockDialog({ product, onClose, onSaved }) {
  const [delta, setDelta] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setDelta(''); setError(''); }, [product]);
  const n = Number(delta);
  const valid = delta !== '' && Number.isInteger(n) && n !== 0;
  const result = product && valid ? product.stock + n : null;

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!valid) return setError('Enter a whole number, e.g. 20 to add or -5 to remove.');
    if (result < 0) return setError(`Only ${product.stock} in stock — you can't remove ${-n}.`);
    setBusy(true); setError('');
    try {
      await api(`/admin/products/${product.id}/stock-adjust`, { method: 'POST', body: { delta: n } });
      toast.success(`${product.name}: stock is now ${result}`);
      onClose(); onSaved();
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={(o) => !busy && !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>{product?.name} — currently {product?.stock} in stock.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field id="stock-delta" label="Change by" error={error} hint="Use a negative number to remove stock.">
            {(p) => <Input {...p} type="number" step="1" inputMode="numeric" value={delta} onChange={(e) => { setDelta(e.target.value); setError(''); }} autoFocus />}
          </Field>
          {result !== null && result >= 0 && <p className="text-sm text-muted-foreground">New stock: <strong className="text-foreground">{result}</strong></p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />} Update stock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
