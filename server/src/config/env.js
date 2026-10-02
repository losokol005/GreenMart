require('dotenv').config();

const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),
  DELIVERY_FEE_CENTS: z.coerce.number().int().min(0).default(0),
  LOW_STOCK_THRESHOLD: z.coerce.number().int().min(0).default(10),
  STORE_NAME: z.string().default('GreenMart'),
  STORE_ADDRESS: z.string().default(''),
  STORE_PHONE: z.string().default(''),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast with a readable message; never print the values themselves.
  const problems = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ');
  throw new Error(`Invalid environment configuration:\n  ${problems}`);
}

module.exports = Object.freeze(parsed.data);
