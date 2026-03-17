const { createClient } = require('redis');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const subscribeToEvents = async () => {
  // WHY alag client:
  // Redis mein subscribe mode mein client
  // sirf events sun sakta hai
  // Doosre kaam (get/set) ke liye alag client chahiye
  // Isliye naya client banate hain subscriber ke liye
  const subscriber = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  subscriber.on('error', (err) => 
    console.error('Subscriber Error:', err)
  );

  await subscriber.connect();
  console.log('📡 Course Service subscribed to events');

  // PAYMENT_COMPLETED event sun
  await subscriber.subscribe('PAYMENT_COMPLETED', async (message) => {
    try {
      const event = JSON.parse(message);
      console.log('[Event Received] PAYMENT_COMPLETED', event.data);

      const { studentId, courseId } = event.data;

      // Already enrolled check karo
      const existing = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId, courseId }
        }
      });

      if (existing) {
        console.log('Already enrolled — skip');
        return;
      }

      // Enroll karo
      await prisma.enrollment.create({
        data: { studentId, courseId }
      });

      console.log(`✅ Student ${studentId} enrolled in ${courseId}`);

    } catch (err) {
      console.error('[Subscriber Error]', err);
    }
  });
};

module.exports = { subscribeToEvents };