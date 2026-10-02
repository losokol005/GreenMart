const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connect(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  // Ensure indexes (unique email, idempotency, order numbers) exist before serving traffic.
  await mongoose.syncIndexes();
}

async function disconnect() {
  await mongoose.disconnect();
}

const isReady = () => mongoose.connection.readyState === 1;

module.exports = { connect, disconnect, isReady };
