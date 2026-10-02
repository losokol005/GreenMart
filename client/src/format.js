const whole = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fractional = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "KES 350" for whole shillings, "KES 350.50" otherwise.
export const formatMoney = (cents) => {
  const c = cents || 0;
  return (c % 100 === 0 ? whole : fractional).format(c / 100);
};
export const formatDate = (d) => new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
export const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

export const isOnSale = (p) => Boolean(p.compareAtPriceCents && p.compareAtPriceCents > p.priceCents);
export const discountPercent = (p) => (isOnSale(p) ? Math.round((1 - p.priceCents / p.compareAtPriceCents) * 100) : 0);
