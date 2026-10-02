import { cn } from '@/lib/utils';

export const Skeleton = ({ className, ...props }) => (
  <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-muted motion-reduce:animate-none', className)} {...props} />
);
