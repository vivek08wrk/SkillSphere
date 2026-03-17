const express = require('express');
const dotenv = require('dotenv');

// .env file load karo — SABSE PEHLE yeh hona chahiye
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ──────────────────────────────────────────────
app.use(express.json());
// WHY: Request body ko automatically JSON parse karo
// Bina iske req.body undefined aayega

// ── ROUTES ─────────────────────────────────────────────────
app.use('/auth', require('./routes/auth.routes'));

// ── HEALTH CHECK ────────────────────────────────────────────
// WHY: API Gateway check karta hai service alive hai ya nahi
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'auth',
    timestamp: new Date().toISOString()
  });
});

// ── GLOBAL ERROR HANDLER ────────────────────────────────────
// WHY 4 parameters: Express isi se identify karta hai error handler middleware
app.use((err, req, res, next) => {
  console.error(`[Auth Service Error] ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth Service running on port ${PORT}`);
});