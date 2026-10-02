import { cn } from '@/lib/utils';

// Brand lockups live in /public/brand. "dark" is the light-on-dark version for the footer.
const SRC = { default: '/brand/logo.png', dark: '/brand/logo-dark.png', large: '/brand/logo-large.png' };
const SIZE = { default: [347, 96], dark: [353, 96], large: [867, 240] };

export default function Logo({ variant = 'default', className }) {
  const [width, height] = SIZE[variant];
  return <img src={SRC[variant]} width={width} height={height} alt="GreenMart" className={cn('h-10 w-auto', className)} />;
}
