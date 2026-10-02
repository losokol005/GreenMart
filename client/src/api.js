const BASE = '/api/v1';
let token = localStorage.getItem('gm_token');
let onUnauthorized = () => {};

export const setToken = (t) => {
  token = t;
  if (t) localStorage.setItem('gm_token', t);
  else localStorage.removeItem('gm_token');
};
export const hasToken = () => Boolean(token);
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server. Please check your connection and try again.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) { setToken(null); onUnauthorized(); }
    const e = data?.error;
    const detail = e?.details?.[0] ? ` (${e.details[0].path}: ${e.details[0].message})` : '';
    throw new ApiError(res.status, e?.code, (e?.message || 'Request failed') + detail, e?.details);
  }
  return data;
}

export const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => v !== undefined && v !== '' && v !== null && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};
