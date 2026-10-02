const router = require('express').Router();
const env = require('../config/env');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { pageMeta } = require('../utils/pagination');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { transitionOrder } = require('../services/orderService');
const { listProducts } = require('./products');
const s = require('../validation/schemas');

router.use(authenticate, requireRole('admin'));

// ---- products / inventory ----
router.get('/products', validate(s.productQuery, 'query'), asyncHandler(async (req, res) => {
  res.json(await listProducts(req.query, { includeInactive: true }));
}));

router.post('/products', validate(s.productCreate), asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.imageUrl) delete body.imageUrl;
  if (body.compareAtPriceCents == null) delete body.compareAtPriceCents;
  res.status(201).json({ product: await Product.create(body) });
}));

router.patch('/products/:id', validate(s.idParam, 'params'), validate(s.productUpdate), asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  const { compareAtPriceCents, ...fields } = req.body;
  const update = { $set: fields };
  if (compareAtPriceCents === null) update.$unset = { compareAtPriceCents: '' }; // null clears the deal
  else if (compareAtPriceCents !== undefined) fields.compareAtPriceCents = compareAtPriceCents;

  const nextPrice = fields.priceCents ?? existing.priceCents;
  const nextCompare = compareAtPriceCents === undefined ? existing.compareAtPriceCents : compareAtPriceCents;
  if (nextCompare != null && nextCompare <= nextPrice) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Original price must be higher than the selling price (clear it to end the deal)');
  }
  if (Object.keys(fields).length === 0) delete update.$set;
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  res.json({ product });
}));

// Atomic relative stock change; refuses to go below zero.
router.post('/products/:id/stock-adjust', validate(s.idParam, 'params'), validate(s.stockAdjust), asyncHandler(async (req, res) => {
  const { delta } = req.body;
  const filter = { _id: req.params.id };
  if (delta < 0) filter.stock = { $gte: -delta };
  const product = await Product.findOneAndUpdate(filter, { $inc: { stock: delta } }, { new: true });
  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    throw exists ? new AppError(409, 'INSUFFICIENT_STOCK', 'Stock cannot go below zero') : new AppError(404, 'NOT_FOUND', 'Product not found');
  }
  res.json({ product });
}));

// Soft delete: order history keeps referencing the product.
router.delete('/products/:id', validate(s.idParam, 'params'), asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: { active: false } }, { new: true });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  res.json({ product });
}));

// ---- orders ----
router.get('/orders', validate(s.orderQuery, 'query'), asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ items, ...pageMeta(page, limit, total) });
}));

router.patch('/orders/:id/status', validate(s.idParam, 'params'), validate(s.statusUpdate), asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');
  res.json({ order: await transitionOrder(order, req.body.status, req.user._id) });
}));

// ---- reports ----
router.get('/reports/summary', validate(s.reportQuery, 'query'), asyncHandler(async (req, res) => {
  const to = req.query.to || new Date();
  const from = req.query.from || new Date(to.getTime() - 30 * 24 * 3600 * 1000);
  if (from > to) throw new AppError(400, 'VALIDATION_ERROR', '"from" must be before "to"');
  const range = { createdAt: { $gte: from, $lte: to } };

  const [byStatus, revenue, topProducts, lowStock] = await Promise.all([
    Order.aggregate([{ $match: range }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { ...range, status: 'delivered' } },
      { $group: { _id: null, revenueCents: { $sum: '$totalCents' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { ...range, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, salesCents: { $sum: '$items.lineTotalCents' } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
    Product.find({ active: true, stock: { $lte: env.LOW_STOCK_THRESHOLD } }).sort({ stock: 1 }).limit(20),
  ]);

  res.json({
    range: { from, to },
    ordersByStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])),
    deliveredRevenueCents: revenue[0]?.revenueCents || 0,
    deliveredOrders: revenue[0]?.orders || 0,
    topProducts: topProducts.map((p) => ({ productId: p._id, name: p.name, quantity: p.quantity, salesCents: p.salesCents })),
    lowStock,
    lowStockThreshold: env.LOW_STOCK_THRESHOLD,
  });
}));

module.exports = router;
