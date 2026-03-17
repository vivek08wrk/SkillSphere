const rateLimit = require('express-rate-limit');

// WHY rate limiting:
// Bina iske koi bhi bot 10000 requests/second maar sakta hai
// Tumhara server crash ho jaayega ya DB overwhelm ho jaayega

// General API limit — sabke liye
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes ka window
  max: 100,                    // 100 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes'
  }
});

// Auth routes ke liye strict limit
// WHY alag limiter: Brute force password attack rokne ke liye
// Koi 1000 baar login try nahi kar sakta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // sirf 10 login attempts per 15 min
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});

module.exports = { generalLimiter, authLimiter };