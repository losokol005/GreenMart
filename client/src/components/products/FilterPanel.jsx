import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/*
 * Filters the backend supports today: price range, availability, deals.
 * NOT supported yet (no data on products): "Organic". To add it later, add a boolean field to the
 * Product model + query param, then one more checkbox below.
 */
function Check({ id, checked, onChange, children }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-input accent-[rgb(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      {children}
    </label>
  );
}

export default function FilterPanel({ values, onApply, onReset, idPrefix = 'f' }) {
  const [draft, setDraft] = useState({ minPrice: values.minPrice, maxPrice: values.maxPrice, inStock: values.inStock, onSale: values.onSale });
  const [error, setError] = useState('');
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  const apply = (e) => {
    e.preventDefault();
    const min = draft.minPrice === '' ? null : Number(draft.minPrice);
    const max = draft.maxPrice === '' ? null : Number(draft.maxPrice);
    if ([min, max].some((n) => n !== null && (!Number.isFinite(n) || n < 0))) return setError('Enter valid prices.');
    if (min !== null && max !== null && min > max) return setError('Minimum price cannot be higher than the maximum.');
    setError('');
    return onApply(draft);
  };

  return (
    <form onSubmit={apply} className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Price (KES)</legend>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor={`${idPrefix}-min`} className="sr-only">Minimum price</Label>
            <Input id={`${idPrefix}-min`} inputMode="numeric" type="number" min="0" placeholder="Min" value={draft.minPrice} onChange={(e) => set('minPrice')(e.target.value)} aria-invalid={Boolean(error) || undefined} />
          </div>
          <span aria-hidden="true" className="text-muted-foreground">–</span>
          <div className="flex-1">
            <Label htmlFor={`${idPrefix}-max`} className="sr-only">Maximum price</Label>
            <Input id={`${idPrefix}-max`} inputMode="numeric" type="number" min="0" placeholder="Max" value={draft.maxPrice} onChange={(e) => set('maxPrice')(e.target.value)} aria-invalid={Boolean(error) || undefined} />
          </div>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">Availability &amp; offers</legend>
        <Check id={`${idPrefix}-stock`} checked={draft.inStock} onChange={set('inStock')}>In stock only</Check>
        <Check id={`${idPrefix}-sale`} checked={draft.onSale} onChange={set('onSale')}>Deals only</Check>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Apply filters</Button>
        <Button type="button" variant="outline" onClick={onReset}>Reset</Button>
      </div>
    </form>
  );
}
