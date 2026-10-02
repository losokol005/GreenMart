const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate, signToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const s = require('../validation/schemas');

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

router.post('/register', authLimiter, validate(s.register), asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (await User.exists({ email })) throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  // Role is never taken from the request: public sign-ups are always customers.
  const user = await User.create({ name, email, phone, passwordHash: await bcrypt.hash(password, 12), role: 'customer' });
  res.status(201).json({ user, token: signToken(user) });
}));

router.post('/login', authLimiter, validate(s.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok || !user.active) throw new AppError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password');
  res.json({ user, token: signToken(user) });
}));

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
