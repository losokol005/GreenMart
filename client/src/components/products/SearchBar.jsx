import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL = 'all'; // Radix Select does not allow an empty-string item value

export default function SearchBar({ q, category, categories, onSearch, onClear, hasFilters, loading }) {
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  return (
    <form role="search" className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); onSearch({ q: text.trim() }); }}>
      <div className="relative flex-1">
        <label htmlFor="shop-search" className="sr-only">Search products</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input id="shop-search" type="search" value={text} maxLength={60} onChange={(e) => setText(e.target.value)} placeholder="Search avocados, potatoes, greens…" className="pl-9" />
      </div>
      <div className="sm:w-52">
        <Select value={category || ALL} onValueChange={(v) => onSearch({ category: v === ALL ? '' : v })}>
          <SelectTrigger aria-label="Category"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1 sm:flex-none" disabled={loading}><Search aria-hidden="true" /> Search</Button>
        {hasFilters && <Button type="button" variant="ghost" onClick={onClear}><X aria-hidden="true" /> Clear</Button>}
      </div>
    </form>
  );
}
