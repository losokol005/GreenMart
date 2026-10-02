import * as React from 'react';
import { cn } from '@/lib/utils';

// Wrapper scrolls horizontally on small screens so the page itself never overflows.
export const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
));
Table.displayName = 'Table';
const part = (Tag, base) => {
  const C = React.forwardRef(({ className, ...props }, ref) => <Tag ref={ref} className={cn(base, className)} {...props} />);
  C.displayName = Tag;
  return C;
};
export const TableHeader = part('thead', '[&_tr]:border-b');
export const TableBody = part('tbody', '[&_tr:last-child]:border-0');
export const TableFooter = part('tfoot', 'border-t bg-muted/40 font-medium');
export const TableRow = part('tr', 'border-b border-border');
export const TableHead = part('th', 'h-10 px-3 text-left align-middle text-xs font-semibold text-muted-foreground');
export const TableCell = part('td', 'px-3 py-3 align-middle');
