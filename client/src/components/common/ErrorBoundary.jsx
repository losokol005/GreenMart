import { Component } from 'react';
import { Button } from '@/components/ui/button';

// Last line of defence: a rendering bug must never produce a blank page.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('UI error:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">The page hit an unexpected problem. Reloading usually fixes it.</p>
        <Button onClick={() => window.location.assign('/')}>Back to GreenMart</Button>
      </div>
    );
  }
}
