const { client } = require('./redis');

const CACHE_TTL = 3600;

const getCache = async (key) => {
  try {
    const data = await client.get(key);
    if (data) {
      console.log(`[Cache HIT] ${key}`);
      return JSON.parse(data);
    }
    console.log(`[Cache MISS] ${key}`);
    return null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

const setCache = async (key, data, ttl = CACHE_TTL) => {
  try {
    await client.setEx(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error('Cache set error:', err);
  }
};

const deleteCache = async (key) => {
  try {
    await client.del(key);
    console.log(`[Cache DELETED] ${key}`);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};

module.exports = { getCache, setCache, deleteCache };