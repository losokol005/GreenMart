import { cn } from '@/lib/utils';
import { STATUS_LABEL } from '@/format';

const STYLE = {
  pending: 'bg-soil/10 text-soil',
  confirmed: 'bg-accent text-primary',
  out_for_delivery: 'bg-primary/10 text-primary',
  delivered: 'bg-primary text-white',
  cancelled: 'bg-destructive/10 text-destructive',
};

// Always shows the text label, so status is never conveyed by colour alone.
export default function StatusBadge({ status, className }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', STYLE[status], className)}>{STATUS_LABEL[status] || status}</span>;
}
