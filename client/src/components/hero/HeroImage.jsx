import { Apple, Carrot, Leaf, Sprout } from 'lucide-react';
import { siteConfig } from '@/config/site';

// Swap in a real photo by setting `heroImage` in src/config/site.js. Until then, show a simple illustration.
export default function HeroImage() {
  if (siteConfig.heroImage) {
    return (
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <img src={siteConfig.heroImage} alt={siteConfig.heroImageAlt} fetchpriority="high" decoding="async" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div role="img" aria-label="Illustration of fresh produce growing from the soil" className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="absolute right-8 top-6 h-14 w-14 rounded-full bg-soil-light/30" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-[28%] flex items-end justify-center gap-4 sm:gap-8" aria-hidden="true">
        <Carrot className="h-16 w-16 -rotate-12 text-soil-light sm:h-24 sm:w-24" strokeWidth={1.5} />
        <Leaf className="h-24 w-24 text-primary sm:h-36 sm:w-36" strokeWidth={1.5} />
        <Apple className="h-16 w-16 text-leaf sm:h-24 sm:w-24" strokeWidth={1.5} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-soil" aria-hidden="true">
        <div className="flex justify-around px-4">
          {Array.from({ length: 7 }, (_, i) => <Sprout key={i} className="-mt-5 h-8 w-8 text-fresh" />)}
        </div>
      </div>
    </div>
  );
}
