import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Bell, LayoutDashboard, LogOut, LogIn, UserPlus, Tag, Store } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { shopHref, dealsHref, categoryHref } from './navItems';

const row = 'flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5 [&_svg]:text-primary';

export default function MobileNav({ open, onOpenChange, user, unread, categories, onLogout, onSearch }) {
  const [q, setQ] = useState('');
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <form role="search" className="relative mb-3" onSubmit={(e) => { e.preventDefault(); onSearch(q.trim()); }}>
            <label htmlFor="mobile-search" className="sr-only">Search products</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="mobile-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={60} placeholder="Search produce" className="pl-9" />
          </form>
          <nav aria-label="Mobile">
            <Link to={shopHref} className={row} onClick={close}><Store aria-hidden="true" /> Shop</Link>
            <Link to={dealsHref} className={row} onClick={close}><Tag aria-hidden="true" /> Deals</Link>
            {categories.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-4 text-xs font-semibold text-muted-foreground">Categories</p>
                {categories.map((c) => (
                  <Link key={c} to={categoryHref(c)} className="block rounded-md px-3 py-2.5 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={close}>{c}</Link>
                ))}
              </>
            )}
            <Separator className="my-3" />
            {user ? (
              <>
                <p className="truncate px-3 pb-1 text-xs text-muted-foreground">Signed in as {user.email}</p>
                <Link to="/orders" className={row} onClick={close}><Package aria-hidden="true" /> My orders</Link>
                <Link to="/notifications" className={row} onClick={close}>
                  <Bell aria-hidden="true" /> Order updates{unread > 0 && <span className="ml-auto rounded-full bg-soil px-2 text-xs font-semibold text-white">{unread}</span>}
                </Link>
                {user.role === 'admin' && <Link to="/admin/orders" className={row} onClick={close}><LayoutDashboard aria-hidden="true" /> Admin</Link>}
                <button type="button" className={`${row} w-full`} onClick={() => { close(); onLogout(); }}><LogOut aria-hidden="true" /> Log out</button>
              </>
            ) : (
              <div className="grid gap-2 px-1 pt-1">
                <Button asChild size="lg"><Link to="/login" onClick={close}><LogIn aria-hidden="true" /> Log in</Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/register" onClick={close}><UserPlus aria-hidden="true" /> Sign up</Link></Button>
              </div>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
