import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import { useCart } from '../context/Cart';
import { api } from '../api';

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return undefined; }
    const poll = () => api('/notifications').then((r) => setUnread(r.unread)).catch(() => {});
    poll();
    const id = setInterval(poll, 60000);
    return () => clearInterval(id);
  }, [user]);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header className="header">
        <Link to="/" className="brand">🥬 GreenMart</Link>
        <nav aria-label="Main" className="nav">
          <NavLink to="/" end>Shop</NavLink>
          <NavLink to="/cart">Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
          {user && <NavLink to="/orders">My orders</NavLink>}
          {user && <NavLink to="/notifications">Alerts{unread > 0 && <span className="badge">{unread}</span>}</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/orders">Admin</NavLink>}
          {user ? (
            <button className="link" onClick={() => { logout(); navigate('/'); }}>Log out ({user.name.split(' ')[0]})</button>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Sign up</NavLink>
            </>
          )}
        </nav>
      </header>
      <main id="main" className="container"><Outlet /></main>
      <footer className="footer">GreenMart · Fresh from the farm</footer>
    </>
  );
}
