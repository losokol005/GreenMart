import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { Protected } from './components/Guards';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Receipt from './pages/Receipt';
import Notifications from './pages/Notifications';
import { Login, Register } from './pages/AuthForms';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminReports from './pages/admin/AdminReports';

const NotFound = () => <><h1>Page not found</h1><p><Link to="/">Back to the shop</Link></p></>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Products />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="orders" element={<Protected><Orders /></Protected>} />
        <Route path="orders/:id" element={<Protected><OrderDetail /></Protected>} />
        <Route path="orders/:id/receipt" element={<Protected><Receipt /></Protected>} />
        <Route path="notifications" element={<Protected><Notifications /></Protected>} />
        <Route path="admin" element={<Protected role="admin"><AdminOrders /></Protected>} />
        <Route path="admin/orders" element={<Protected role="admin"><AdminOrders /></Protected>} />
        <Route path="admin/products" element={<Protected role="admin"><AdminProducts /></Protected>} />
        <Route path="admin/reports" element={<Protected role="admin"><AdminReports /></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
