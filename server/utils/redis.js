const redis = require('redis');
const config = require('../config/config');

const client = redis.createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${config[process.env.NODE_ENV || 'development'].redis.host}:${config[process.env.NODE_ENV || 'development'].redis.port}`
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
client.connect().catch(console.error);

module.exports = client; 