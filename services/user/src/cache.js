const { client } = require('./redis');

// WHY alag cache.js file:
// Redis commands har jagah likhne ki jagah
// ek helper banao — reusable, clean code

const CACHE_TTL = 3600; // 1 hour in seconds

// Cache se data lo
const getCache = async (key) => {
  try {
    const data = await client.get(key);
    if (data) {
      console.log(`[Cache HIT] ${key}`);
      return JSON.parse(data);
      // WHY parse: Redis mein string store hota hai
      // JSON.parse se wapas object banao
    }
    console.log(`[Cache MISS] ${key}`);
    return null;
  } catch (err) {
    // Cache fail ho toh app crash mat karo
    // Sirf DB se fetch karo
    console.error('Cache get error:', err);
    return null;
  }
};

// Cache mein data save karo
const setCache = async (key, data, ttl = CACHE_TTL) => {
  try {
    await client.setEx(
      key,
      ttl,
      JSON.stringify(data)
      // WHY stringify: Redis sirf strings store karta hai
    );
    // setEx = set with expiry
    // WHY TTL: Cache hamesha fresh rehna chahiye
    // Stale data serve nahi karna
  } catch (err) {
    console.error('Cache set error:', err);
  }
};

// Cache delete karo (jab data update ho)
const deleteCache = async (key) => {
  try {
    await client.del(key);
    console.log(`[Cache DELETED] ${key}`);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};

module.exports = { getCache, setCache, deleteCache };