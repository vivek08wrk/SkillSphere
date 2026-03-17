const express = require('express');
const dotenv = require('dotenv');
const { connectRedis } = require('./redis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// ── WEBHOOK — Raw body chahiye, express.json() se pehle ──────
app.post('/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/payment.routes').webhookHandler
);

// ── BAAKI ROUTES — JSON parse karo ───────────────────────────
app.use(express.json());
app.use('/payments', require('./routes/payment.routes'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'payment',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(`[Payment Service Error] ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const start = async () => {
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`💳 Payment Service running on port ${PORT}`);
  });
};

start();