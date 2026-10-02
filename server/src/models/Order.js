const mongoose = require('mongoose');
const { STATUSES } = require('../services/orderStatus');

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // Snapshots: later product edits must not change past orders/receipts.
    name: { type: String, required: true },
    unit: { type: String, required: true },
    priceCents: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotalCents: { type: Number, required: true },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotalCents: { type: Number, required: true },
    deliveryFeeCents: { type: Number, required: true, default: 0 },
    totalCents: { type: Number, required: true },
    status: { type: String, enum: STATUSES, default: 'pending' },
    statusHistory: [historySchema],
    delivery: {
      fullName: { type: String, required: true, trim: true, maxlength: 100 },
      phone: { type: String, required: true, trim: true, maxlength: 20 },
      address: { type: String, required: true, trim: true, maxlength: 300 },
      notes: { type: String, trim: true, maxlength: 300, default: '' },
    },
    paymentMethod: { type: String, enum: ['cash_on_delivery'], default: 'cash_on_delivery' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    idempotencyKey: { type: String, maxlength: 100 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.idempotencyKey;
        return ret;
      },
    },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
// A retried checkout (same key) can never create a second order for the same user.
orderSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);

module.exports = mongoose.model('Order', orderSchema);
