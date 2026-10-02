import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, Truck, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Container from '@/components/common/Container';
import HeroImage from './HeroImage';
import { shopHref } from '@/components/navigation/navItems';

const TRUST = [
  { icon: Sprout, title: 'Fresh from local farms', text: 'Produce sourced from trusted suppliers' },
  { icon: Truck, title: 'Delivered to your door', text: 'Track every order from confirmation to delivery' },
  { icon: Banknote, title: 'Pay on delivery', text: 'Cash when your produce arrives' },
];

export default function Hero() {
  return (
    <>
      <section className="border-b border-border bg-cream" aria-labelledby="hero-title">
        <Container className="grid items-center gap-8 py-10 md:grid-cols-2 lg:gap-14 lg:py-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sprout className="h-4 w-4" aria-hidden="true" /> Farm to table, made simple
            </p>
            <h1 id="hero-title" className="mt-4 text-balance text-4xl font-bold text-forest sm:text-5xl lg:text-6xl">
              Fresh from the farm. <span className="block text-primary">Delivered to your door.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Shop fresh fruits, vegetables, greens and everyday essentials from trusted local suppliers.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to={shopHref}>Shop Fresh Produce <ArrowRight aria-hidden="true" /></Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#categories">Explore Categories</a></Button>
            </div>
          </div>
          <HeroImage />
        </Container>
      </section>
      <section aria-label="Why GreenMart" className="border-b border-border bg-card">
        <Container>
          <ul className="grid gap-4 py-5 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <div><p className="text-sm font-semibold">{title}</p><p className="text-sm text-muted-foreground">{text}</p></div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
