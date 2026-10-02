const router = require('express').Router();
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { pageMeta } = require('../utils/pagination');
const validate = require('../middleware/validate');
const s = require('../validation/schemas');

async function listProducts({ q, category, page, limit, minPriceCents, maxPriceCents, inStock, onSale }, { includeInactive }) {
  const filter = includeInactive ? {} : { active: true };
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };
  if (category) filter.category = category;
  if (minPriceCents !== undefined || maxPriceCents !== undefined) {
    filter.priceCents = {};
    if (minPriceCents !== undefined) filter.priceCents.$gte = minPriceCents;
    if (maxPriceCents !== undefined) filter.priceCents.$lte = maxPriceCents;
  }
  if (inStock) filter.stock = { $gt: 0 };
  // Missing/null compareAtPriceCents sorts below any number in BSON, so those products never match.
  if (onSale) filter.$expr = { $gt: ['$compareAtPriceCents', '$priceCents'] };
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { items, ...pageMeta(page, limit, total) };
}

router.get('/', validate(s.productQuery, 'query'), asyncHandler(async (req, res) => {
  res.json(await listProducts(req.query, { includeInactive: false }));
}));

router.get('/categories', asyncHandler(async (_req, res) => {
  res.json({ items: (await Product.distinct('category', { active: true })).sort() });
}));

router.get('/:id', validate(s.idParam, 'params'), asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, active: true });
  if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  res.json({ product });
}));

module.exports = router;
module.exports.listProducts = listProducts;
