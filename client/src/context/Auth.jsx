import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, hasToken, setUnauthorizedHandler } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasToken());

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (!hasToken()) return;
    api('/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const r = await api(path, { method: 'POST', body });
    setToken(r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const value = {
    user,
    loading,
    login: (b) => authenticate('/auth/login', b),
    register: (b) => authenticate('/auth/register', b),
    logout: () => { setToken(null); setUser(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
