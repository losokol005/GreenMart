const request = require('supertest');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const db = require('../src/db');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Notification = require('../src/models/Notification');

let mongod; let app; let admin; let customer; let other; let avocado;
const delivery = { fullName: 'Jane Doe', phone: '+254700000000', address: 'Westlands, Nairobi' };
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

async function signup(email) {
  const res = await request(app).post('/api/v1/auth/register').send({ name: 'Test User', email, password: 'password123' });
  return res.body.token;
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await db.connect(mongod.getUri());
  app = createApp();
  await User.create({ name: 'Admin', email: 'admin@test.com', role: 'admin', passwordHash: await bcrypt.hash('adminpassword1', 4) });
  admin = (await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'adminpassword1' })).body.token;
  customer = await signup('jane@test.com');
  other = await signup('john@test.com');
});
afterAll(async () => { await db.disconnect(); await mongod.stop(); });
beforeEach(async () => {
  await Order.deleteMany({});
  await Notification.deleteMany({});
  await Product.deleteMany({});
  avocado = await Product.create({ name: 'Avocado', priceCents: 5000, unit: 'piece', stock: 10 });
});

const place = (token, qty = 2, key) => {
  const r = request(app).post('/api/v1/orders').set(bearer(token))
    .send({ items: [{ productId: String(avocado._id), quantity: qty }], delivery });
  return key ? r.set('Idempotency-Key', key) : r;
};

describe('auth', () => {
  test('register never grants admin, even if requested', async () => {
    const res = await request(app).post('/api/v1/auth/register')
      .send({ name: 'Eve', email: 'eve@test.com', password: 'password123', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.passwordHash).toBeUndefined();
  });
  test('duplicate email is rejected', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ name: 'X', email: 'jane@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });
  test('wrong password and unknown user give the same error', async () => {
    const a = await request(app).post('/api/v1/auth/login').send({ email: 'jane@test.com', password: 'wrongpassword' });
    const b = await request(app).post('/api/v1/auth/login').send({ email: 'nobody@test.com', password: 'wrongpassword' });
    expect(a.status).toBe(401);
    expect(b.body.error.message).toBe(a.body.error.message);
  });
  test('protected routes need a valid token', async () => {
    expect((await request(app).get('/api/v1/orders')).status).toBe(401);
    expect((await request(app).get('/api/v1/orders').set(bearer('garbage'))).status).toBe(401);
  });
});

describe('products and admin access control', () => {
  test('public can browse and search; inactive products are hidden', async () => {
    await Product.create({ name: 'Hidden Kale', priceCents: 100, stock: 1, active: false });
    const res = await request(app).get('/api/v1/products?q=avo');
    expect(res.status).toBe(200);
    expect(res.body.items.map((p) => p.name)).toEqual(['Avocado']);
    expect((await request(app).get('/api/v1/products?q=kale')).body.items).toHaveLength(0);
  });
  test('regex characters in search are treated literally', async () => {
    expect((await request(app).get('/api/v1/products?q=.*')).body.items).toHaveLength(0);
  });
  test('customers cannot use admin endpoints', async () => {
    expect((await request(app).get('/api/v1/admin/orders').set(bearer(customer))).status).toBe(403);
    const res = await request(app).post('/api/v1/admin/products').set(bearer(customer))
      .send({ name: 'X', priceCents: 1, unit: 'kg', stock: 1 });
    expect(res.status).toBe(403);
  });
  test('admin can create, update, adjust stock and soft-delete', async () => {
    const created = await request(app).post('/api/v1/admin/products').set(bearer(admin))
      .send({ name: 'Potatoes', priceCents: 8000, unit: 'kg', stock: 5 });
    expect(created.status).toBe(201);
    const id = created.body.product.id;
    expect((await request(app).patch(`/api/v1/admin/products/${id}`).set(bearer(admin)).send({ priceCents: 9000 })).body.product.priceCents).toBe(9000);
    expect((await request(app).post(`/api/v1/admin/products/${id}/stock-adjust`).set(bearer(admin)).send({ delta: -5 })).body.product.stock).toBe(0);
    expect((await request(app).post(`/api/v1/admin/products/${id}/stock-adjust`).set(bearer(admin)).send({ delta: -1 })).status).toBe(409);
    await request(app).delete(`/api/v1/admin/products/${id}`).set(bearer(admin));
    expect((await request(app).get(`/api/v1/products/${id}`)).status).toBe(404);
  });
  test('invalid input returns a structured 400', async () => {
    const res = await request(app).post('/api/v1/admin/products').set(bearer(admin)).send({ name: '', priceCents: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('orders', () => {
  test('places an order using server-side prices and decrements stock', async () => {
    const res = await place(customer, 2);
    expect(res.status).toBe(201);
    expect(res.body.order.subtotalCents).toBe(10000);
    expect(res.body.order.totalCents).toBe(20000); // + 10000 delivery fee from test env
    expect(res.body.order.orderNumber).toMatch(/^GM-\d{4}-\d{6}$/);
    expect((await Product.findById(avocado._id)).stock).toBe(8);
  });
  test('client-supplied prices are ignored', async () => {
    const res = await request(app).post('/api/v1/orders').set(bearer(customer))
      .send({ items: [{ productId: String(avocado._id), quantity: 1, priceCents: 1 }], delivery });
    expect(res.body.order.items[0].priceCents).toBe(5000);
  });
  test('rejects insufficient stock without changing stock', async () => {
    const res = await place(customer, 11);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
    expect((await Product.findById(avocado._id)).stock).toBe(10);
  });
  test('concurrent orders can never oversell', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => place(customer, 3)));
    const ok = results.filter((r) => r.status === 201).length;
    expect(ok).toBe(3);
    expect((await Product.findById(avocado._id)).stock).toBe(1);
  });
  test('the same Idempotency-Key never creates a second order', async () => {
    const [a, b] = await Promise.all([place(customer, 1, 'key-12345678'), place(customer, 1, 'key-12345678')]);
    expect(a.body.order.id).toBe(b.body.order.id);
    expect(await Order.countDocuments()).toBe(1);
    expect((await Product.findById(avocado._id)).stock).toBe(9);
  });
  test('customers cannot read other customers\' orders or receipts', async () => {
    const { body } = await place(customer, 1);
    expect((await request(app).get(`/api/v1/orders/${body.order.id}`).set(bearer(other))).status).toBe(404);
    expect((await request(app).get(`/api/v1/orders/${body.order.id}/receipt`).set(bearer(other))).status).toBe(404);
    expect((await request(app).get(`/api/v1/orders/${body.order.id}/receipt`).set(bearer(customer))).status).toBe(200);
    expect((await request(app).get('/api/v1/orders').set(bearer(other))).body.items).toHaveLength(0);
  });
  test('customer can cancel a pending order and stock is restored', async () => {
    const { body } = await place(customer, 4);
    const res = await request(app).post(`/api/v1/orders/${body.order.id}/cancel`).set(bearer(customer));
    expect(res.body.order.status).toBe('cancelled');
    expect((await Product.findById(avocado._id)).stock).toBe(10);
  });
  test('admin workflow: confirm -> dispatch -> deliver, with notifications and payment', async () => {
    const { body } = await place(customer, 1);
    const id = body.order.id;
    const patch = (status) => request(app).patch(`/api/v1/admin/orders/${id}/status`).set(bearer(admin)).send({ status });
    expect((await patch('delivered')).status).toBe(409); // cannot skip steps
    expect((await patch('confirmed')).status).toBe(200);
    expect((await patch('out_for_delivery')).status).toBe(200);
    // customer can no longer cancel once confirmed/dispatched
    expect((await request(app).post(`/api/v1/orders/${id}/cancel`).set(bearer(customer))).status).toBe(409);
    const done = await patch('delivered');
    expect(done.body.order.paymentStatus).toBe('paid');
    const notes = await request(app).get('/api/v1/notifications').set(bearer(customer));
    expect(notes.body.unread).toBe(4); // received, confirmed, out for delivery, delivered
  });
  test('reports summarise delivered revenue and low stock', async () => {
    const { body } = await place(customer, 9);
    for (const status of ['confirmed', 'out_for_delivery', 'delivered']) {
      await request(app).patch(`/api/v1/admin/orders/${body.order.id}/status`).set(bearer(admin)).send({ status });
    }
    const res = await request(app).get('/api/v1/admin/reports/summary').set(bearer(admin));
    expect(res.status).toBe(200);
    expect(res.body.deliveredRevenueCents).toBe(55000);
    expect(res.body.topProducts[0].name).toBe('Avocado');
    expect(res.body.lowStock.map((p) => p.name)).toContain('Avocado');
  });
});

describe('catalogue filters and deals', () => {
  beforeEach(async () => {
    await Product.create([
      { name: 'Cabbage', priceCents: 2000, stock: 5 },
      { name: 'Mango', priceCents: 9000, stock: 0, compareAtPriceCents: 12000 },
    ]);
  });
  const names = async (query) => (await request(app).get(`/api/v1/products${query}`)).body.items.map((p) => p.name);

  test('filters by price range (minor units)', async () => {
    expect(await names('?minPriceCents=3000&maxPriceCents=6000')).toEqual(['Avocado']);
  });
  test('filters by availability', async () => {
    expect(await names('?inStock=true')).toEqual(['Avocado', 'Cabbage']);
  });
  test('filters deals only', async () => {
    expect(await names('?onSale=1')).toEqual(['Mango']);
  });
  test('rejects an inverted price range', async () => {
    expect((await request(app).get('/api/v1/products?minPriceCents=900&maxPriceCents=100')).status).toBe(400);
  });
  test('original price must exceed the selling price', async () => {
    const make = (compareAtPriceCents) => request(app).post('/api/v1/admin/products').set(bearer(admin))
      .send({ name: 'Deal', priceCents: 5000, unit: 'kg', stock: 1, compareAtPriceCents });
    expect((await make(4000)).status).toBe(400);
    expect((await make(6000)).status).toBe(201);
  });
  test('admin can end a deal with null, and cannot raise price above the original price', async () => {
    const mango = await Product.findOne({ name: 'Mango' });
    const patch = (body) => request(app).patch(`/api/v1/admin/products/${mango._id}`).set(bearer(admin)).send(body);
    expect((await patch({ priceCents: 13000 })).status).toBe(400);
    const cleared = await patch({ compareAtPriceCents: null });
    expect(cleared.status).toBe(200);
    expect(cleared.body.product.compareAtPriceCents).toBeUndefined();
    expect(await names('?onSale=1')).toEqual([]);
  });
});

describe('platform', () => {
  test('health, readiness, unknown routes and malformed JSON', async () => {
    expect((await request(app).get('/health')).status).toBe(200);
    expect((await request(app).get('/ready')).status).toBe(200);
    expect((await request(app).get('/api/v1/nope')).status).toBe(404);
    const bad = await request(app).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{bad');
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('MALFORMED_JSON');
  });
});
