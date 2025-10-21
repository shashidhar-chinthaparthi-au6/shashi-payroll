const redis = require('redis');
const config = require('../config/config');

// Create Redis client with better error handling
let client;

try {
  const redisConfig = {
    host: config[process.env.NODE_ENV || 'development'].redis.host,
    port: config[process.env.NODE_ENV || 'development'].redis.port,
    password: process.env.REDIS_PASSWORD,
    retry_strategy: function(options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        console.log('Redis connection refused, retrying...');
        return Math.min(options.attempt * 100, 3000);
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        console.log('Redis retry time exhausted, continuing without Redis');
        return undefined;
      }
      if (options.attempt > 10) {
        console.log('Redis max retry attempts reached, continuing without Redis');
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    },
    connect_timeout: 10000,
    lazyConnect: true
  };

  client = redis.createClient(redisConfig);

  client.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
    // Don't crash the app if Redis fails
  });
  
  client.on('connect', () => console.log('Redis Client Connected'));
  client.on('ready', () => console.log('Redis Client Ready'));
  client.on('end', () => console.log('Redis Client Disconnected'));

  // Gracefully handle Redis connection failures
  client.on('close', () => {
    console.log('Redis connection closed');
  });

} catch (error) {
  console.error('Failed to create Redis client:', error.message);
  // Create a mock client that doesn't crash the app
  client = {
    get: () => Promise.resolve(null),
    set: () => Promise.resolve('OK'),
    del: () => Promise.resolve(1),
    quit: () => Promise.resolve('OK'),
    on: () => {},
    connect: () => Promise.resolve()
  };
}

module.exports = client; 