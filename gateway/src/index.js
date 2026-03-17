const express = require('express');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./middleware/logger.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const setupRoutes = require('./routes/proxy.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── WEBHOOK — Sabse pehle, koi middleware nahi ───────────────
app.post('/payments/webhook',
  express.raw({ type: '*/*' }),
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: () => '/payments/webhook',
    on: {
      proxyReq: (proxyReq, req) => {
        if (Buffer.isBuffer(req.body)) {
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', req.body.length);
          proxyReq.write(req.body);
        }
      },
      error: (err, req, res) => {
        console.error('Webhook proxy error:', err.message);
        res.status(503).json({ message: 'Payment service unavailable' });
      }
    }
  })
);

app.use(logger);
app.use(generalLimiter);

// ── BAAKI ROUTES ──────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    req.rawBody = '';
    req.body = {};
    return next();
  }

  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    try {
      req.body = data ? JSON.parse(data) : {};
    } catch(e) {
      req.body = {};
    }
    next();
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

setupRoutes(app);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('[Gateway Error]', err.message);
  res.status(500).json({ success: false, message: 'Gateway error' });
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log(`   Auth   → ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   User   → ${process.env.USER_SERVICE_URL}`);
  console.log(`   Course → ${process.env.COURSE_SERVICE_URL}`);
});