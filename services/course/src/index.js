const express = require('express');
const dotenv = require('dotenv');
const { connectRedis } = require('./redis');
const { subscribeToEvents } = require('./events/subscriber');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.use('/courses', require('./routes/course.routes'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'course',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(`[Course Service Error] ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const start = async () => {
  await connectRedis();
  await subscribeToEvents();
  app.listen(PORT, () => {
    console.log(`📚 Course Service running on port ${PORT}`);
  });
};

start();