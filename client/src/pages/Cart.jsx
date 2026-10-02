import { Link } from 'react-router-dom';
import { useCart } from '../context/Cart';
import { formatMoney } from '../format';
import { Empty } from '../components/UI';

export default function Cart() {
  const { items, setQty, remove, subtotalCents } = useCart();
  if (items.length === 0) return <><h1>Your cart</h1><Empty>Your cart is empty. <Link to="/">Browse fresh produce</Link></Empty></>;
  return (
    <>
      <h1>Your cart</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th><th><span className="sr-only">Remove</span></th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.productId}>
                <td>{i.name}</td>
                <td>{formatMoney(i.priceCents)} / {i.unit}</td>
                <td>
                  <label className="sr-only" htmlFor={`q-${i.productId}`}>Quantity of {i.name}</label>
                  <input id={`q-${i.productId}`} className="qty" type="number" min="1" max={i.stock} value={i.quantity}
                    onChange={(e) => setQty(i.productId, parseInt(e.target.value, 10))} />
                </td>
                <td>{formatMoney(i.priceCents * i.quantity)}</td>
                <td><button className="link" onClick={() => remove(i.productId)} aria-label={`Remove ${i.name}`}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="total">Subtotal: <strong>{formatMoney(subtotalCents)}</strong></p>
      <Link className="button primary" to="/checkout">Proceed to checkout</Link>
    </>
  );
}
