// WHY logger: Production mein bina logs ke kuch bhi debug nahi hoga
// Har request ka record rehna chahiye — kab aaya, kya tha, kitna time laga

const logger = (req, res, next) => {
  const start = Date.now();

  // Response finish hone ke baad log karo
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

module.exports = logger;