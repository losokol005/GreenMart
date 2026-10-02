const router = require('express').Router();
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { pageMeta } = require('../utils/pagination');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { createOrder, transitionOrder, buildReceipt } = require('../services/orderService');
const s = require('../validation/schemas');

router.use(authenticate);

// Customers can only ever see their own orders; others look like "not found" (no id enumeration).
async function loadOwnOrder(req) {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.user = req.user._id;
  const order = await Order.findOne(filter);
  if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found');
  return order;
}

router.post('/', validate(s.orderCreate), asyncHandler(async (req, res) => {
  const key = req.get('Idempotency-Key');
  if (key && !/^[\w-]{8,100}$/.test(key)) throw new AppError(400, 'VALIDATION_ERROR', 'Invalid Idempotency-Key');
  const { order, created } = await createOrder(req.user._id, req.body, key);
  res.status(created ? 201 : 200).json({ order });
}));

router.get('/', validate(s.orderQuery, 'query'), asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ items, ...pageMeta(page, limit, total) });
}));

router.get('/:id', validate(s.idParam, 'params'), asyncHandler(async (req, res) => {
  res.json({ order: await loadOwnOrder(req) });
}));

router.get('/:id/receipt', validate(s.idParam, 'params'), asyncHandler(async (req, res) => {
  const order = await loadOwnOrder(req);
  await order.populate('user', 'name email');
  res.json({ receipt: buildReceipt(order, order.user) });
}));

// Customers may cancel only while the order is still pending.
router.post('/:id/cancel', validate(s.idParam, 'params'), asyncHandler(async (req, res) => {
  const order = await loadOwnOrder(req);
  if (req.user.role !== 'admin' && order.status !== 'pending') {
    throw new AppError(409, 'INVALID_TRANSITION', 'Only pending orders can be cancelled. Please contact the store.');
  }
  res.json({ order: await transitionOrder(order, 'cancelled', req.user._id) });
}));

module.exports = router;
