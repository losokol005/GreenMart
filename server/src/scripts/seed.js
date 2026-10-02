// Usage: ADMIN_PASSWORD=... npm run seed
// Creates the first admin (if missing) and sample products (only if the catalogue is empty).
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const db = require('../db');
const User = require('../models/User');
const Product = require('../models/Product');

const SAMPLE = [
  { name: 'Hass Avocado', category: 'Fruits & Avocados', unit: 'piece', priceCents: 5000, compareAtPriceCents: 6500, stock: 200 },
  { name: 'Potatoes', category: 'Root Vegetables', unit: 'kg', priceCents: 8000, stock: 150 },
  { name: 'Kale (Sukuma Wiki)', category: 'Leafy Greens', unit: 'bunch', priceCents: 3000, stock: 120 },
  { name: 'Spinach', category: 'Leafy Greens', unit: 'bunch', priceCents: 3500, stock: 100 },
  { name: 'Tomatoes', category: 'Vegetables', unit: 'kg', priceCents: 12000, compareAtPriceCents: 15000, stock: 80 },
  { name: 'Red Onions', category: 'Vegetables', unit: 'kg', priceCents: 10000, stock: 90 },
  { name: 'Carrots', category: 'Root Vegetables', unit: 'kg', priceCents: 9000, stock: 70 },
];

(async () => {
  await db.connect(env.MONGO_URI);
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (email && password.length >= 12) {
    if (!(await User.exists({ email }))) {
      await User.create({ name: 'Administrator', email, role: 'admin', passwordHash: await bcrypt.hash(password, 12) });
      console.log(`Created admin ${email}`);
    } else console.log('Admin already exists');
  } else {
    console.log('Skipped admin: set ADMIN_EMAIL and ADMIN_PASSWORD (min 12 chars) to create one.');
  }
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(SAMPLE);
    console.log(`Inserted ${SAMPLE.length} sample products`);
  }
  await db.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
