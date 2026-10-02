const env = require('./config/env');
const logger = require('./utils/logger');
const db = require('./db');
const { createApp } = require('./app');

async function main() {
  await db.connect(env.MONGO_URI);
  const server = createApp().listen(env.PORT, () => logger.info({ port: env.PORT }, 'GreenMart API listening'));

  const shutdown = (signal) => {
    logger.info({ signal }, 'shutting down');
    server.close(async () => {
      await db.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'failed to start');
  process.exit(1);
});
