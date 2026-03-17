const { client } = require('../redis');

// WHY publisher alag file mein:
// Event publishing ek alag concern hai
// Controller mein directly likhne se code messy hoga

const publishEvent = async (eventName, data) => {
  try {
    const event = {
      eventName,
      data,
      timestamp: new Date().toISOString()
    };

    // Redis PUBLISH command
    // Channel = eventName (jaise "PAYMENT_COMPLETED")
    // Message = event data (JSON string)
    await client.publish(eventName, JSON.stringify(event));
    
    console.log(`[Event Published] ${eventName}`, data);
  } catch (err) {
    console.error(`[Event Publish Error] ${eventName}`, err);
  }
};

module.exports = { publishEvent };