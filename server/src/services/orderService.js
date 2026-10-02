const env = require('../config/env');
const AppError = require('../utils/AppError');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { nextSequence } = require('../models/Counter');
const { canTransition, STATUS_MESSAGES } = require('./orderStatus');
const { mergeItems, computeTotals } = require('./pricing');

async function releaseStock(lines) {
  if (!lines.length) return;
  await Product.bulkWrite(
    lines.map((l) => ({ updateOne: { filter: { _id: l.productId }, update: { $inc: { stock: l.quantity } } } }))
  );
}

async function nextOrderNumber() {
  const seq = await nextSequence('order');
  return `GM-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;
}

/**
 * Creates an order. Prices always come from the database, never from the client.
 * Stock is reserved with atomic conditional updates (no oversell under concurrency)
 * and rolled back if anything fails. An optional idempotency key makes retries safe.
 */
async function createOrder(userId, { items, delivery }, idempotencyKey) {
  if (idempotencyKey) {
    const existing = await Order.findOne({ user: userId, idempotencyKey });
    if (existing) return { order: existing, created: false };
  }

  const lines = mergeItems(items);
  const products = await Product.find({ _id: { $in: lines.map((l) => l.productId) }, active: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));
  for (const l of lines) {
    if (!byId.has(l.productId)) {
      throw new AppError(409, 'PRODUCT_UNAVAILABLE', 'One or more products are no longer available');
    }
  }

  const reserved = [];
  try {
    for (const l of lines) {
      const res = await Product.updateOne(
        { _id: l.productId, active: true, stock: { $gte: l.quantity } },
        { $inc: { stock: -l.quantity } }
      );
      if (res.modifiedCount !== 1) {
        throw new AppError(409, 'INSUFFICIENT_STOCK', `Not enough stock for ${byId.get(l.productId).name}`);
      }
      reserved.push(l);
    }

    const orderItems = lines.map((l) => {
      const p = byId.get(l.productId);
      return {
        product: p._id,
        name: p.name,
        unit: p.unit,
        priceCents: p.priceCents,
        quantity: l.quantity,
        lineTotalCents: p.priceCents * l.quantity,
      };
    });
    const totals = computeTotals(orderItems, env.DELIVERY_FEE_CENTS);

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      user: userId,
      items: orderItems,
      ...totals,
      delivery,
      statusHistory: [{ status: 'pending', by: userId }],
      idempotencyKey: idempotencyKey || undefined,
    });

    await Notification.create({
      user: userId,
      order: order._id,
      message: `Your order ${order.orderNumber} has been received.`,
    });
    return { order, created: true };
  } catch (err) {
    await releaseStock(reserved);
    if (err && err.code === 11000 && idempotencyKey) {
      // A concurrent duplicate request won the race; return its order instead.
      const existing = await Order.findOne({ user: userId, idempotencyKey });
      if (existing) return { order: existing, created: false };
    }
    throw err;
  }
}

/**
 * Moves an order to a new status. The update is conditional on the current status,
 * so two simultaneous transitions cannot both succeed.
 */
async function transitionOrder(order, toStatus, actorId) {
  if (!canTransition(order.status, toStatus)) {
    throw new AppError(409, 'INVALID_TRANSITION', `Cannot change order from ${order.status} to ${toStatus}`);
  }
  const set = { status: toStatus };
  if (toStatus === 'delivered') set.paymentStatus = 'paid'; // cash collected on delivery

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { $set: set, $push: { statusHistory: { status: toStatus, by: actorId, at: new Date() } } },
    { new: true }
  );
  if (!updated) throw new AppError(409, 'CONFLICT', 'Order was changed by someone else. Reload and try again.');

  if (toStatus === 'cancelled') {
    await releaseStock(updated.items.map((i) => ({ productId: i.product, quantity: i.quantity })));
  }
  await Notification.create({
    user: updated.user,
    order: updated._id,
    message: `Your order ${updated.orderNumber} ${STATUS_MESSAGES[toStatus]}.`,
  });
  return updated;
}

function buildReceipt(order, customer) {
  return {
    store: { name: env.STORE_NAME, address: env.STORE_ADDRESS, phone: env.STORE_PHONE },
    receiptNumber: order.orderNumber,
    issuedAt: order.createdAt,
    status: order.status,
    customer: { name: customer.name, email: customer.email },
    delivery: order.delivery,
    items: order.items,
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
  };
}

module.exports = { createOrder, transitionOrder, buildReceipt };
