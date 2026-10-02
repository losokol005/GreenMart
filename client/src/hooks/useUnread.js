import { useEffect, useState } from 'react';
import { api } from '@/api';

// Unread order-update count for the signed-in user (refreshes every minute; failures are silent).
export function useUnread(user) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!user) { setUnread(0); return undefined; }
    const poll = () => api('/notifications').then((r) => setUnread(r.unread)).catch(() => {});
    poll();
    const id = setInterval(poll, 60000);
    window.addEventListener('gm:notifications', poll);
    return () => { clearInterval(id); window.removeEventListener('gm:notifications', poll); };
  }, [user]);
  return unread;
}
