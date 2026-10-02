import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const FavoritesContext = createContext(null);
export const useFavorites = () => useContext(FavoritesContext);

const KEY = 'gm_favorites';
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

// Favourites are stored on this device only (no backend support yet).
export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ } }, [ids]);
  const toggle = useCallback((id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])), []);
  const value = useMemo(() => ({ ids, has: (id) => ids.includes(id), toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
