import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { api } from '@/api';
import { useAsync } from '@/useAsync';
import { useTitle } from '@/hooks/useTitle';
import { siteConfig } from '@/config/site';
import { formatMoney } from '@/format';
import Container from '@/components/common/Container';

const h2 = 'scroll-mt-24 text-xl font-semibold';

export default function Help() {
  useTitle('Help & delivery');
  const { data } = useAsync(() => api('/config'), []);
  const { email, phone, address } = siteConfig.contact;
  const hasContact = email || phone || address;
  return (
    <Container className="max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Help &amp; delivery</h1>
      <div className="mt-8 space-y-10 leading-relaxed">
        <section aria-labelledby="delivery">
          <h2 id="delivery" className={h2}>Delivery &amp; payment</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Delivery fee: <strong className="text-foreground">{data ? (data.deliveryFeeCents === 0 ? 'Free' : formatMoney(data.deliveryFeeCents)) : '…'}</strong> per order.</li>
            <li>Payment is <strong className="text-foreground">cash on delivery</strong>. Pay when your produce arrives.</li>
            <li>After you order, follow progress under <Link className="text-primary underline" to="/orders">My orders</Link>: pending → confirmed → out for delivery → delivered. You'll also get an update each time the status changes.</li>
          </ul>
        </section>
        <section aria-labelledby="orders">
          <h2 id="orders" className={h2}>Changing or cancelling an order</h2>
          <p className="mt-3 text-muted-foreground">You can cancel an order yourself while it is still pending. Once it has been confirmed, please contact us and we'll help.</p>
        </section>
        <section aria-labelledby="contact">
          <h2 id="contact" className={h2}>Contact us</h2>
          {hasContact ? (
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {email && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" aria-hidden="true" /><a className="underline" href={`mailto:${email}`}>{email}</a></li>}
              {phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" aria-hidden="true" /><a className="underline" href={`tel:${phone}`}>{phone}</a></li>}
              {address && <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" aria-hidden="true" />{address}</li>}
            </ul>
          ) : (
            <p className="mt-3 text-muted-foreground">Contact details have not been added yet. Store owners: set them in <code>client/src/config/site.js</code>.</p>
          )}
        </section>
      </div>
    </Container>
  );
}
