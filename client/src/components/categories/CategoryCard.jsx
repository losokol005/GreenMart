import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function CategoryCard({ to, icon: Icon, label, accent = false }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex h-full flex-col items-center gap-3 rounded-lg border border-border bg-card p-4 text-center shadow-card transition-all duration-200 hover:border-primary/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={cn('flex h-12 w-12 items-center justify-center rounded-full transition-colors', accent ? 'bg-soil/10 text-soil group-hover:bg-soil/20' : 'bg-accent text-primary group-hover:bg-primary/15')}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold leading-tight">{label}</span>
      </Link>
    </li>
  );
}
