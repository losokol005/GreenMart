import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, children, actions, className }) {
  return (
    <div role="status" className={cn('flex flex-col items-center rounded-lg border border-dashed border-input bg-card px-6 py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      {children && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</p>}
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
