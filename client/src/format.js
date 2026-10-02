const money = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' });
export const formatMoney = (cents) => money.format((cents || 0) / 100);
export const formatDate = (d) => new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
export const STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};
