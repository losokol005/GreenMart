import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Container from '@/components/common/Container';
import PageHeader from '@/components/common/PageHeader';

const TABS = [
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products & stock' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function AdminShell({ title, description, actions, children }) {
  return (
    <Container className="py-8">
      <PageHeader title={title} description={description} actions={actions} />
      <nav aria-label="Admin sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => cn('-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', isActive ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      {children}
    </Container>
  );
}
