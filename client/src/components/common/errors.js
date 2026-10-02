import { WifiOff, ServerCrash, Lock, ShieldAlert, AlertCircle, Clock } from 'lucide-react';

// Turns an ApiError (or any Error) into something a shopper can act on.
export function describeError(error) {
  const status = error?.status;
  if (status === 0 || error?.code === 'NETWORK') {
    return { icon: WifiOff, title: "You seem to be offline", text: "We couldn't reach GreenMart. Check your internet connection and try again.", retry: true };
  }
  if (status === 401) return { icon: Lock, title: 'Please sign in', text: 'Your session has expired or you need to sign in to continue.', login: true };
  if (status === 403) return { icon: ShieldAlert, title: "You don't have access", text: "Your account isn't allowed to view this page." };
  if (status === 429) return { icon: Clock, title: 'Too many requests', text: 'Please wait a moment and try again.', retry: true };
  if (status === 400 || status === 422) return { icon: AlertCircle, title: 'Please check your input', text: error.message, retry: false };
  if (status >= 500) {
    return { icon: ServerCrash, title: 'GreenMart is having trouble', text: "Our service is temporarily unavailable. This isn't caused by anything you did — please try again shortly.", retry: true };
  }
  return { icon: AlertCircle, title: 'Something went wrong', text: error?.message || 'An unexpected error occurred.', retry: true };
}
