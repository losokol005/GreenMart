const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const env = require('./config/env');
const logger = require('./utils/logger');
const db = require('./db');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');

function createApp() {
  const app = express();
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1); // behind nginx / load balancer
  app.disable('x-powered-by');

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const id = req.headers['x-request-id'] || crypto.randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      autoLogging: { ignore: (req) => req.url === '/health' },
    })
  );
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()) }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/ready', (_req, res) =>
    db.isReady() ? res.json({ status: 'ready' }) : res.status(503).json({ status: 'database unavailable' })
  );

  app.use('/api/v1', apiLimiter);
  app.get('/api/v1/config', (_req, res) =>
    res.json({ storeName: env.STORE_NAME, currency: 'KES', deliveryFeeCents: env.DELIVERY_FEE_CENTS })
  );
  app.use('/api/v1/auth', require('./routes/auth'));
  app.use('/api/v1/products', require('./routes/products'));
  app.use('/api/v1/orders', require('./routes/orders'));
  app.use('/api/v1/notifications', require('./routes/notifications'));
  app.use('/api/v1/admin', require('./routes/admin'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
