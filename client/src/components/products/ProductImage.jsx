import { useState } from 'react';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

// Consistent box + object-cover (never distorts). Falls back to a leaf placeholder when there is no
// image or it fails to load, so there are never broken-image icons.
export default function ProductImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div aria-hidden="true" className={cn('flex items-center justify-center bg-cream text-soil-light', className)}>
        <Leaf className="h-1/3 w-1/3 max-h-12 max-w-12" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn('object-cover', className)} />;
}
