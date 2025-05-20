require('dotenv').config();

module.exports = {
  development: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll_dev'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret'
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*'
    }
  },
  staging: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll_staging'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'staging_jwt_secret'
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*'
    }
  },
  production: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll_prod'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'prod_jwt_secret'
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*'
    }
  },
  test: {
    mongodb: {
      uri: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/payroll_test'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'test_jwt_secret'
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*'
    }
  }
}; 