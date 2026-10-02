import * as React from 'react';
import { cn } from '@/lib/utils';

const make = (name, base) => {
  const C = React.forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn(base, className)} {...props} />);
  C.displayName = name;
  return C;
};
export const Card = make('Card', 'rounded-lg border border-border bg-card text-foreground shadow-card');
export const CardHeader = make('CardHeader', 'flex flex-col gap-1.5 p-6');
export const CardTitle = React.forwardRef(({ className, as: Tag = 'h2', ...props }, ref) => (
  <Tag ref={ref} className={cn('text-xl font-semibold leading-tight', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';
export const CardDescription = make('CardDescription', 'text-sm text-muted-foreground');
export const CardContent = make('CardContent', 'p-6 pt-0');
export const CardFooter = make('CardFooter', 'flex items-center p-6 pt-0');
