import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { Toaster } from '@/components/ui/sonner';

// Scrolls to top / hash target on navigation and moves focus to <main> for keyboard & screen-reader users.
function RouteEffects() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    if (!first.current) document.getElementById('main')?.focus({ preventScroll: true });
    first.current = false;
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { pathname } = useLocation();
  // On the full cart/checkout pages the drawer would be redundant.
  const openCart = () => { if (!pathname.startsWith('/cart') && !pathname.startsWith('/checkout')) setCartOpen(true); };

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg">Skip to content</a>
      <RouteEffects />
      <Navbar onCartClick={openCart} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none"><Outlet /></main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <Toaster />
    </div>
  );
}
