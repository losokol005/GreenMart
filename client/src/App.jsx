import { Routes, Route, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Protected } from '@/components/Guards';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import Cart from '@/pages/Cart';
import Help from '@/pages/Help';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Receipt from '@/pages/Receipt';
import Notifications from '@/pages/Notifications';
import { Login, Register } from '@/pages/AuthForms';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminReports from '@/pages/admin/AdminReports';

const NotFound = () => (
  <div className="mx-auto max-w-xl px-4 py-16">
    <EmptyState icon={Compass} title="Page not found" actions={<Button asChild><Link to="/shop">Back to the shop</Link></Button>}>
      We couldn't find the page you were looking for.
    </EmptyState>
  </div>
);

const L = (el, role) => <Protected role={role}>{el}</Protected>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="cart" element={<Cart />} />
        <Route path="help" element={<Help />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="checkout" element={L(<Checkout />)} />
        <Route path="orders" element={L(<Orders />)} />
        <Route path="orders/:id" element={L(<OrderDetail />)} />
        <Route path="orders/:id/receipt" element={L(<Receipt />)} />
        <Route path="notifications" element={L(<Notifications />)} />
        <Route path="admin" element={L(<AdminOrders />, 'admin')} />
        <Route path="admin/orders" element={L(<AdminOrders />, 'admin')} />
        <Route path="admin/products" element={L(<AdminProducts />, 'admin')} />
        <Route path="admin/reports" element={L(<AdminReports />, 'admin')} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
