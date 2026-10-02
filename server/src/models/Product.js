const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    priceCents: { type: Number, required: true, min: 0, validate: Number.isInteger },
    unit: { type: String, enum: ['kg', 'bunch', 'piece', 'bag'], default: 'kg' },
    category: { type: String, trim: true, maxlength: 60, default: 'Vegetables' },
    // Optional "was" price. When greater than priceCents the product is on sale (powers Deals + discount badges).
    compareAtPriceCents: { type: Number, min: 1, validate: Number.isInteger },
    stock: { type: Number, required: true, min: 0, default: 0, validate: Number.isInteger },
    imageUrl: { type: String, trim: true, maxlength: 500 },
    // Soft delete: keeps order history intact.
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.index({ active: 1, category: 1, name: 1 });
productSchema.index({ name: 1 });

module.exports = mongoose.model('Product', productSchema);
