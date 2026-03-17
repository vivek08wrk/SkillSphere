const { createClient } = require('redis');
const { sendEmail } = require('../emailSender');
const { paymentSuccessEmail, welcomeEmail } = require('../templates/email.templates');

const subscribeToEvents = async () => {
  const subscriber = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  subscriber.on('error', (err) =>
    console.error('Subscriber Error:', err)
  );

  await subscriber.connect();
  console.log('📡 Notification Service subscribed to events');

  // PAYMENT_COMPLETED event
  await subscriber.subscribe('PAYMENT_COMPLETED', async (message) => {
    try {
      const event = JSON.parse(message);
      console.log('\n[Event Received] PAYMENT_COMPLETED');

      const email = paymentSuccessEmail(event.data);
      await sendEmail(email);

    } catch (err) {
      console.error('[Notification Error]', err.message);
    }
  });

  // USER_REGISTERED event
  await subscriber.subscribe('USER_REGISTERED', async (message) => {
    try {
      const event = JSON.parse(message);
      console.log('\n[Event Received] USER_REGISTERED');

      const email = welcomeEmail(event.data);
      await sendEmail(email);

    } catch (err) {
      console.error('[Notification Error]', err.message);
    }
  });
};

module.exports = { subscribeToEvents };