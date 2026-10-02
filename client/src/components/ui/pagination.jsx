import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

// Compact window of page numbers: 1 … 4 5 [6] 7 8 … 20
function windowed(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('gap-' + n);
    out.push(n);
  });
  return out;
}

export function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft aria-hidden="true" /> <span className="hidden sm:inline">Previous</span>
      </Button>
      {windowed(page, pages).map((n) =>
        typeof n === 'string' ? (
          <span key={n} aria-hidden="true" className="px-1 text-muted-foreground">…</span>
        ) : (
          <Button key={n} variant={n === page ? 'default' : 'ghost'} size="sm" className="min-w-9 px-2" aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined} onClick={() => n !== page && onPageChange(n)}>
            {n}
          </Button>
        )
      )}
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <span className="hidden sm:inline">Next</span> <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
