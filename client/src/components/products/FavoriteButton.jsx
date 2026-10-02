import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/context/Favorites';

export default function FavoriteButton({ product, className }) {
  const { has, toggle } = useFavorites();
  const active = has(product.id);
  return (
    <button
      type="button"
      onClick={() => toggle(product.id)}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
      className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-card/95 shadow-card transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    >
      <Heart className={cn('h-4 w-4 transition-colors', active ? 'fill-destructive text-destructive' : 'text-foreground')} aria-hidden="true" />
    </button>
  );
}
