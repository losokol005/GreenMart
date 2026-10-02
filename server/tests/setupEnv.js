process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://placeholder/ignored'; // tests connect to an in-memory server
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
process.env.DELIVERY_FEE_CENTS = '10000';
