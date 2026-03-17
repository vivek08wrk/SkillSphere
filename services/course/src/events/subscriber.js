const { createClient } = require('redis');
const { PrismaClient } = require('@prisma/client');
const { deleteCache } = require('../cache');  

const prisma = new PrismaClient();

const subscribeToEvents = async () => {
  const subscriber = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  subscriber.on('error', (err) => 
    console.error('Subscriber Error:', err)
  );

  await subscriber.connect();
  console.log('📡 Course Service subscribed to events');

  await subscriber.subscribe('PAYMENT_COMPLETED', async (message) => {
    try {
      const event = JSON.parse(message);
      console.log('[Event Received] PAYMENT_COMPLETED', event);

      const { studentId, courseId } = event.data;  

      // Already enrolled check
      const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } }
      });

      if (existing) {
        console.log('Already enrolled — skipping');
        return;
      }

      // Enroll karo
      await prisma.enrollment.create({
        data: { studentId, courseId }
      });

      // ← Cache delete karo — yahi fix hai!
      await deleteCache(`enrollments:${studentId}`);

      console.log(`✅ Student ${studentId} enrolled in ${courseId}`);

    } catch (err) {
      console.error('[Subscriber Error]', err);
    }
  });
};

module.exports = { subscribeToEvents };