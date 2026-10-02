import { api } from '@/api';
import { useAsync } from '@/useAsync';

// One shared request: navbar, home page and shop all need the category list.
let cached = null;
const load = () => {
  if (!cached) cached = api('/products/categories').catch((e) => { cached = null; throw e; });
  return cached;
};

export const useCategories = () => useAsync(load, []);
