import { Loader2 } from 'lucide-react';

export default function PageSpinner({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> {label}
    </div>
  );
}
