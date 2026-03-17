const { createClient } = require('redis');

// Redis client ek baar banao, poori app mein reuse karo
// WHY: Har request pe naya connection banana expensive hai
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connection errors handle karo
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis connected');
});

// Connect karo
const connectRedis = async () => {
  await client.connect();
};

module.exports = { client, connectRedis };