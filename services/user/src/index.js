const express = require('express');
const dotenv = require('dotenv');
const { connectRedis } = require("./redis");
const { subscribeToEvents } = require("./subscriber");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Routes
app.use('/users', require('./routes/user.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[User Service Error] ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Redis connect karo phir server start karo
// WHY async startup: Redis connect hone ke baad hi
// requests accept karo — warna cache kaam nahi karega
const start = async () => {
  await connectRedis();
  await subscribeToEvents();
  app.listen(PORT, () => {
    console.log(`👤 User Service running on port ${PORT}`);
  });
};

start();