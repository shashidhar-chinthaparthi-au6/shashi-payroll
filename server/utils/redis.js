const redis = require('redis');
const config = require('../config/config');

// Create a mock Redis client that never fails
const createMockRedisClient = () => {
  console.log('Using mock Redis client - Redis functionality disabled');
  return {
    get: (key) => {
      console.log(`Mock Redis GET: ${key}`);
      return Promise.resolve(null);
    },
    set: (key, value) => {
      console.log(`Mock Redis SET: ${key} = ${value}`);
      return Promise.resolve('OK');
    },
    del: (key) => {
      console.log(`Mock Redis DEL: ${key}`);
      return Promise.resolve(1);
    },
    quit: () => {
      console.log('Mock Redis QUIT');
      return Promise.resolve('OK');
    },
    on: () => {},
    connect: () => Promise.resolve(),
    connected: false,
    ready: false
  };
};

// Check if Redis is available and configured
const isRedisAvailable = () => {
  const env = process.env.NODE_ENV || 'development';
  const redisConfig = config[env].redis;
  
  // If Redis host is localhost and we're in production, skip Redis
  if (env === 'production' && redisConfig.host === 'localhost') {
    return false;
  }
  
  // If no Redis password is provided, skip Redis
  if (!process.env.REDIS_PASSWORD) {
    return false;
  }
  
  return true;
};

let client;

if (isRedisAvailable()) {
  try {
    const redisConfig = {
      host: config[process.env.NODE_ENV || 'development'].redis.host,
      port: config[process.env.NODE_ENV || 'development'].redis.port,
      password: process.env.REDIS_PASSWORD,
      retry_strategy: function(options) {
        // Fail fast - don't retry too much
        if (options.attempt > 3) {
          console.log('Redis connection failed, switching to mock client');
          return undefined;
        }
        return Math.min(options.attempt * 100, 1000);
      },
      connect_timeout: 5000,
      lazyConnect: true
    };

    client = redis.createClient(redisConfig);

    client.on('error', (err) => {
      console.log('Redis connection error, switching to mock client');
      // Replace with mock client on error
      client = createMockRedisClient();
    });
    
    client.on('connect', () => console.log('Redis Client Connected'));
    client.on('ready', () => console.log('Redis Client Ready'));
    client.on('end', () => console.log('Redis Client Disconnected'));

  } catch (error) {
    console.log('Redis initialization failed, using mock client');
    client = createMockRedisClient();
  }
} else {
  console.log('Redis not configured, using mock client');
  client = createMockRedisClient();
}

module.exports = client; 