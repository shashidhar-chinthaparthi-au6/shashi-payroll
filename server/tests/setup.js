process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/payroll_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = 6379;
process.env.CORS_ORIGIN = '*';

// Mock config
jest.mock('../config/config', () => ({
  test: {
    mongodb: {
      uri: process.env.MONGODB_URI
    },
    jwt: {
      secret: process.env.JWT_SECRET
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    cors: {
      origin: process.env.CORS_ORIGIN
    }
  }
})); 