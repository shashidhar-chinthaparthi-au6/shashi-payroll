const redis = require('redis');
const config = require('../config/config');

const client = redis.createClient({
  host: config[process.env.NODE_ENV || 'development'].redis.host,
  port: config[process.env.NODE_ENV || 'development'].redis.port,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
client.connect().catch(console.error);

module.exports = client; 