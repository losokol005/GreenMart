import { useEffect } from 'react';

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · GreenMart` : 'GreenMart · Fresh from the farm';
  }, [title]);
}
