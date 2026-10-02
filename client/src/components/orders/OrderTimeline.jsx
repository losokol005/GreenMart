import { Check } from 'lucide-react';
import { formatDate, STATUS_LABEL } from '@/format';

export default function OrderTimeline({ history }) {
  return (
    <ol className="space-y-4">
      {history.map((h, i) => {
        const last = i === history.length - 1;
        return (
          <li key={`${h.status}-${i}`} className="relative flex gap-3">
            {!last && <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-0.5rem)] w-px bg-border" />}
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${last ? 'bg-primary text-white' : 'bg-accent text-primary'}`}>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">{STATUS_LABEL[h.status]}</p>
              <p className="text-xs text-muted-foreground">{formatDate(h.at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
