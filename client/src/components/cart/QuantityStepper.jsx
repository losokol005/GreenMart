import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuantityStepper({ name, value, max, onChange }) {
  return (
    <div role="group" aria-label={`Quantity of ${name}`} className="inline-flex items-center rounded-md border border-input bg-card">
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled={value <= 1} onClick={() => onChange(value - 1)} aria-label={`Decrease quantity of ${name}`}><Minus aria-hidden="true" /></Button>
      <span className="min-w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">{value}</span>
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`Increase quantity of ${name}`}><Plus aria-hidden="true" /></Button>
    </div>
  );
}
