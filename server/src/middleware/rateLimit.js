const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const make = (windowMs, max, code) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    handler: (_req, res) =>
      res.status(429).json({ error: { code, message: 'Too many requests, please try again later' } }),
  });

module.exports = {
  authLimiter: make(15 * 60 * 1000, 20, 'RATE_LIMITED'),
  apiLimiter: make(60 * 1000, 300, 'RATE_LIMITED'),
};
