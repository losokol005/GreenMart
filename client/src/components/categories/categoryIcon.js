import { Apple, Carrot, Leaf, Sprout, Salad, Wheat } from 'lucide-react';

// Picks an icon from the category name. Categories come from the database, so this is keyword-based.
export function categoryIcon(name = '') {
  const n = name.toLowerCase();
  if (/leaf|green|spinach|kale/.test(n)) return Leaf;
  if (/root|carrot|potato/.test(n)) return Carrot;
  if (/fruit|avocado|apple/.test(n)) return Apple;
  if (/herb|organic|sprout/.test(n)) return Sprout;
  if (/grain|cereal|wheat/.test(n)) return Wheat;
  return Salad;
}
