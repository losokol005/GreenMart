const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const page = z.coerce.number().int().min(1).default(1);
const limit = z.coerce.number().int().min(1).max(100).default(20);
const trimmed = (max, min = 1) => z.string().trim().min(min).max(max);

const register = z.object({
  name: trimmed(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Invalid phone number').optional(),
  password: z.string().min(8).max(72), // bcrypt ignores bytes past 72
});

const login = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72),
});

const productBody = z.object({
  name: trimmed(120),
  description: z.string().trim().max(1000).optional(),
  priceCents: z.number().int().min(0).max(100_000_000),
  unit: z.enum(['kg', 'bunch', 'piece', 'bag']),
  category: trimmed(60).optional(),
  stock: z.number().int().min(0).max(1_000_000),
  imageUrl: z.string().trim().url().max(500).regex(/^https?:\/\//i).optional().or(z.literal('')),
  active: z.boolean().optional(),
});
const productCreate = productBody;
const productUpdate = productBody.partial().refine((v) => Object.keys(v).length > 0, 'No fields to update');
const stockAdjust = z.object({ delta: z.number().int().min(-1_000_000).max(1_000_000).refine((n) => n !== 0) });

const productQuery = z.object({
  q: z.string().trim().max(60).optional(),
  category: z.string().trim().max(60).optional(),
  page,
  limit,
});

const orderCreate = z.object({
  items: z
    .array(z.object({ productId: objectId, quantity: z.number().int().min(1).max(1000) }))
    .min(1)
    .max(50),
  delivery: z.object({
    fullName: trimmed(100),
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Invalid phone number'),
    address: trimmed(300),
    notes: z.string().trim().max(300).optional(),
  }),
});

const orderQuery = z.object({
  status: z.enum(['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
  page,
  limit,
});
const statusUpdate = z.object({ status: z.enum(['confirmed', 'out_for_delivery', 'delivered', 'cancelled']) });
const idParam = z.object({ id: objectId });
const reportQuery = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() });

module.exports = {
  register, login, productCreate, productUpdate, stockAdjust, productQuery,
  orderCreate, orderQuery, statusUpdate, idParam, reportQuery, page, limit,
};
