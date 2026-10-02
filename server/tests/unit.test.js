const { canTransition } = require('../src/services/orderStatus');
const { mergeItems, computeTotals } = require('../src/services/pricing');
const schemas = require('../src/validation/schemas');

describe('order status transitions', () => {
  test('allows the happy path', () => {
    expect(canTransition('pending', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'out_for_delivery')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered')).toBe(true);
  });
  test('allows cancelling before dispatch only', () => {
    expect(canTransition('pending', 'cancelled')).toBe(true);
    expect(canTransition('confirmed', 'cancelled')).toBe(true);
    expect(canTransition('out_for_delivery', 'cancelled')).toBe(false);
  });
  test('final states are final and steps cannot be skipped', () => {
    expect(canTransition('delivered', 'pending')).toBe(false);
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
    expect(canTransition('pending', 'delivered')).toBe(false);
  });
});

describe('pricing', () => {
  test('merges duplicate product lines', () => {
    expect(mergeItems([{ productId: 'a', quantity: 1 }, { productId: 'b', quantity: 2 }, { productId: 'a', quantity: 3 }]))
      .toEqual([{ productId: 'a', quantity: 4 }, { productId: 'b', quantity: 2 }]);
  });
  test('computes totals in integer minor units', () => {
    expect(computeTotals([{ priceCents: 1999, quantity: 3 }, { priceCents: 5, quantity: 2 }], 100))
      .toEqual({ subtotalCents: 6007, deliveryFeeCents: 100, totalCents: 6107 });
  });
});

describe('validation schemas', () => {
  const id = 'a'.repeat(24);
  const delivery = { fullName: 'Jane', phone: '+254700000000', address: 'Nairobi' };
  test('rejects empty, zero, fractional and oversized quantities', () => {
    for (const items of [[], [{ productId: id, quantity: 0 }], [{ productId: id, quantity: 1.5 }], [{ productId: id, quantity: 5000 }]]) {
      expect(schemas.orderCreate.safeParse({ items, delivery }).success).toBe(false);
    }
  });
  test('rejects malformed product ids', () => {
    expect(schemas.orderCreate.safeParse({ items: [{ productId: '$ne', quantity: 1 }], delivery }).success).toBe(false);
  });
  test('register normalises email and enforces password length', () => {
    expect(schemas.register.parse({ name: 'A', email: ' A@B.COM ', password: 'longenough' }).email).toBe('a@b.com');
    expect(schemas.register.safeParse({ name: 'A', email: 'a@b.com', password: 'short' }).success).toBe(false);
  });
  test('product update needs at least one field', () => {
    expect(schemas.productUpdate.safeParse({}).success).toBe(false);
  });
});
