import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import { Loading } from './UI';

export function Protected({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
