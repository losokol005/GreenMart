import { Link } from 'react-router-dom';
import { useAuth } from '@/context/Auth';
import Logo from '@/components/common/Logo';
import { shopHref, dealsHref } from '@/components/navigation/navItems';

const link = 'rounded-sm text-sm text-cream/80 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fresh';

function Column({ title, children }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-white">{title}</h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="site-chrome mt-16 border-t-4 border-soil bg-forest text-cream">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo variant="dark" className="h-10" />
          <p className="mt-3 max-w-xs text-sm text-cream/80">Fresh from the farm.</p>
        </div>
        <Column title="Shop">
          <li><Link className={link} to={shopHref}>Shop</Link></li>
          <li><Link className={link} to="/#categories">Categories</Link></li>
          <li><Link className={link} to={dealsHref}>Deals</Link></li>
        </Column>
        <Column title="Customer Service">
          <li><Link className={link} to="/help#contact">Contact</Link></li>
          <li><Link className={link} to="/help">Help</Link></li>
          <li><Link className={link} to="/help#delivery">Delivery</Link></li>
        </Column>
        <Column title="Account">
          {!user && <li><Link className={link} to="/login">Login</Link></li>}
          {!user && <li><Link className={link} to="/register">Sign up</Link></li>}
          <li><Link className={link} to="/orders">Orders</Link></li>
        </Column>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-cream/70">© {new Date().getFullYear()} GreenMart. All rights reserved.</div>
    </footer>
  );
}
