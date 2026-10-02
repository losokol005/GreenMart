const pino = require('pino');
const env = require('../config/env');

module.exports = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', '*.password', '*.passwordHash'],
    censor: '[redacted]',
  },
});
