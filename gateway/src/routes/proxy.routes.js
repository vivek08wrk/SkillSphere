const { createProxyMiddleware } = require('http-proxy-middleware');
const { verifyToken } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

const rewriteBody = (proxyReq, req) => {
  if (req.method === 'GET' || req.method === 'DELETE') return;
  const bodyData = req.rawBody || '{}';
  const byteLength = Buffer.byteLength(bodyData, 'utf8');
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', byteLength);
  proxyReq.write(bodyData, 'utf8');
};

const forwardUserHeaders = (proxyReq, req) => {
  // req.headers se directly lo — req.user nahi
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  
  if (userId) proxyReq.setHeader('x-user-id', userId);
  if (userRole) proxyReq.setHeader('x-user-role', userRole);
  
  rewriteBody(proxyReq, req);
};

const optionalAuth = (req, res, next) => {
  // Token hai toh verify karo — nahi hai toh bhi chalne do
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

const setupRoutes = (app) => {

  // AUTH ROUTES — No token needed
  app.use('/auth', authLimiter, createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'Auth service unavailable' });
      },
      proxyReq: rewriteBody
    }
  }));

  // USER ROUTES — Token required
  app.use('/users', verifyToken, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/users${path}`,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'User service unavailable' });
      },
      proxyReq: forwardUserHeaders
    }
  }));

  // COURSE ROUTES:
  // GET /courses → Public (no token)
  // GET /courses/my-enrollments → Token required
  // POST/PUT → Token required
  app.use('/courses', optionalAuth, createProxyMiddleware({
    target: process.env.COURSE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/courses${path}`,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'Course service unavailable' });
      },
      proxyReq: forwardUserHeaders
    }
  }));

  // ── WEBHOOK ROUTE ─────────────────────────────────────────────
app.use('/payments/webhook', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: () => `/payments/webhook`,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ success: false, message: 'Payment service unavailable' });
    },
    proxyReq: (proxyReq, req) => {
      // Buffer directly forward karo — parse mat karo
      const body = req.rawBody;
      if (body && Buffer.isBuffer(body)) {
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', body.length);
        proxyReq.write(body);
      }
    }
  }
}));

  // PAYMENT ROUTES — Token required
  app.use('/payments', verifyToken, createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/payments${path}`,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ success: false, message: 'Payment service unavailable' });
      },
      proxyReq: forwardUserHeaders
    }
  }));

};

module.exports = setupRoutes;