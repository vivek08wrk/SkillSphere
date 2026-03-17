const express = require('express');
const dotenv = require('dotenv');
const { subscribeToEvents } = require('./events/subscriber');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[Notification Error] ${err.message}`);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

// Start
const start = async () => {
  await subscribeToEvents();
  app.listen(PORT, () => {
    console.log(`🔔 Notification Service running on port ${PORT}`);
  });
};

start();