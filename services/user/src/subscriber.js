const { createClient } = require('redis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const subscribeToEvents = async () => {
  const subscriber = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  subscriber.on('error', (err) => console.error('Subscriber Error:', err));
  await subscriber.connect();
  console.log('✅ Event Subscriber connected');

  await subscriber.subscribe('USER_REGISTERED', async (message) => {
    try {
      const event = JSON.parse(message);
      const { userId, email, role, password, name } = event.data;
      console.log('[Event Received] USER_REGISTERED -', email);
      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (existing) return;
      await prisma.user.create({
        data: { id: userId, email, role, firstName: name || null, password: password || '' }
      });
      console.log('[User Created]', email);
    } catch (err) {
      console.error('[Subscriber Error]', err.message);
    }
  });
};

module.exports = { subscribeToEvents };
