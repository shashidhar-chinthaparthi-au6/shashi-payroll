const redis = require('redis');
const config = require('../config/config');

const client = redis.createClient({
  host: config[process.env.NODE_ENV || 'development'].redis.host,
  port: config[process.env.NODE_ENV || 'development'].redis.port
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

module.exports = client; 