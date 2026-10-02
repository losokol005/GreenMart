import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from './EmptyState';
import { describeError } from './errors';

export default function ErrorState({ error, onRetry }) {
  if (!error) return null;
  const d = describeError(error);
  return (
    <EmptyState
      icon={d.icon}
      title={d.title}
      actions={
        <>
          {d.login && <Button asChild><Link to="/login">Log in</Link></Button>}
          {d.retry && onRetry && <Button variant="outline" onClick={onRetry}><RefreshCw aria-hidden="true" /> Try again</Button>}
        </>
      }
    >
      {d.text}
    </EmptyState>
  );
}
