const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const { publishEvent } = require('../events/publisher');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── CREATE PAYMENT INTENT ────────────────────────────────────
const createPayment = async (req, res, next) => {
  try {
    const studentId = req.headers['x-user-id'];
    const { courseId, amount } = req.body;

    if (!courseId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'courseId and amount are required'
      });
    }

    // Step 1: Stripe Payment Intent banao
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe paisa cents mein leta hai
      currency: 'inr',
      payment_method_types: ['card'], 
      metadata: {
        courseId,
        studentId
      }
    });

    // Step 2: DB mein PENDING save karo
    const payment = await prisma.payment.create({
      data: {
        studentId,
        courseId,
        amount,
        status: 'PENDING',
        stripePaymentId: paymentIntent.id  // ← Save karo
      }
    });

    // Step 3: Client Secret bhejo frontend ko
    res.status(201).json({
      success: true,
      message: 'Payment intent created',
      data: {
        clientSecret: paymentIntent.client_secret,  // ← Frontend use karega
        paymentId: payment.id
      }
    });

  } catch (error) {
    next(error);
  }
};

// ── STRIPE WEBHOOK ───────────────────────────────────────────
// Stripe hamare server ko batata hai payment success/fail hua
const handleWebhook = async (req, res) => {
  let event;

  try {
    // Development mein signature skip karo
    // Production mein verify karenge
    const payload = req.body;
    
    if (Buffer.isBuffer(payload)) {
      event = JSON.parse(payload.toString());
    } else if (typeof payload === 'string') {
      event = JSON.parse(payload);
    } else {
      event = payload; // Already parsed object
    }

    console.log('[Webhook] Event received:', event.type);

  } catch (err) {
    console.error('Webhook parse error:', err.message);
    return res.status(400).json({ message: 'Webhook error' });
  }

  // Payment success hua!
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { courseId, studentId } = paymentIntent.metadata;

    try {
      await prisma.payment.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'SUCCESS' }
      });

      await publishEvent('PAYMENT_COMPLETED', {
        paymentId: paymentIntent.id,
        studentId,
        courseId,
        amount: paymentIntent.amount / 100
      });

      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: 'FAILED' }
    });
    console.log(`❌ Payment failed: ${paymentIntent.id}`);
  }

  res.json({ received: true });
};

// ── GET MY PAYMENTS ──────────────────────────────────────────
const getMyPayments = async (req, res, next) => {
  try {
    const studentId = req.headers['x-user-id'];

    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPayment, handleWebhook, getMyPayments };