import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Search, ShoppingCart, User, LogOut, Package, Bell, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/Auth';
import { useCart } from '@/context/Cart';
import { useCategories } from '@/hooks/useCategories';
import { useUnread } from '@/hooks/useUnread';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Logo from '@/components/common/Logo';
import MobileNav from './MobileNav';
import { shopHref, dealsHref, categoryHref } from './navItems';

const linkClass = (active) =>
  cn('rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', active ? 'text-primary' : 'text-foreground');

export default function Navbar({ onCartClick }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const unread = useUnread(user);
  const categories = useCategories();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const onDeals = pathname === '/shop' && search.includes('onSale=1');
  const onShop = pathname === '/shop' && !onDeals;

  const submitSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
  };
  const doLogout = () => { logout(); navigate('/'); toast.success('You have been logged out'); };

  return (
    <header className="site-chrome sticky top-0 z-40 border-b border-border bg-card/95 shadow-nav backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Link to="/" aria-label="GreenMart home" className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo className="h-9 sm:h-10" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <Link to={shopHref} className={linkClass(onShop)} aria-current={onShop ? 'page' : undefined}>Shop</Link>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(linkClass(false), 'inline-flex items-center gap-1')}>
              Categories <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(categories.data?.items || []).map((c) => (
                <DropdownMenuItem key={c} asChild><Link to={categoryHref(c)}>{c}</Link></DropdownMenuItem>
              ))}
              {categories.loading && <DropdownMenuLabel>Loading…</DropdownMenuLabel>}
              {!categories.loading && !categories.data?.items?.length && <DropdownMenuLabel>No categories yet</DropdownMenuLabel>}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to={shopHref}>All products</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to={dealsHref} className={linkClass(onDeals)} aria-current={onDeals ? 'page' : undefined}>Deals</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <form role="search" onSubmit={submitSearch} className="relative hidden lg:block">
            <label htmlFor="nav-search" className="sr-only">Search products</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="nav-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={60} placeholder="Search produce" className="w-44 pl-9 xl:w-64" />
          </form>

          <Button variant="ghost" size="icon" className="relative" onClick={onCartClick} aria-label={count ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart, empty'}>
            <ShoppingCart className="!size-5" aria-hidden="true" />
            {count > 0 && (
              <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-soil px-1 text-[11px] font-bold text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Button>

          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="!size-5" aria-hidden="true" />
                  <span className="max-w-[8rem] truncate">{user ? user.name.split(' ')[0] : 'Account'}</span>
                  {unread > 0 && <span className="h-2 w-2 rounded-full bg-soil" aria-label={`${unread} unread updates`} />}
                  <ChevronDown aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link to="/orders"><Package aria-hidden="true" /> My orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/notifications"><Bell aria-hidden="true" /> Order updates{unread > 0 && <span className="ml-auto rounded-full bg-soil px-1.5 text-xs font-semibold text-white">{unread}</span>}</Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && <DropdownMenuItem asChild><Link to="/admin/orders"><LayoutDashboard aria-hidden="true" /> Admin</Link></DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={doLogout}><LogOut aria-hidden="true" /> Log out</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild><Link to="/login"><LogIn aria-hidden="true" /> Log in</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/register"><UserPlus aria-hidden="true" /> Sign up</Link></DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="!size-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <MobileNav open={menuOpen} onOpenChange={setMenuOpen} user={user} unread={unread} categories={categories.data?.items || []} onLogout={doLogout} onSearch={(term) => { navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop'); setMenuOpen(false); }} />
    </header>
  );
}
