const { createClient } = require('redis');
require('dotenv').config();

// Create the Redis client using the specific host, port, and password
const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to the Redis Cloud instance
redisClient.connect().then(() => {
    console.log('Successfully connected to Redis Cloud! ✅');
});

module.exports = redisClient;