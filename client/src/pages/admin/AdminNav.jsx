import { NavLink } from 'react-router-dom';
export default () => (
  <nav className="subnav" aria-label="Admin">
    <NavLink to="/admin/orders">Orders</NavLink>
    <NavLink to="/admin/products">Products &amp; stock</NavLink>
    <NavLink to="/admin/reports">Reports</NavLink>
  </nav>
);
