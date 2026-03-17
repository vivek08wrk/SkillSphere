const router = require('express').Router();
const express = require('express');
const { 
  createPayment, 
  handleWebhook, 
  getMyPayments 
} = require('../controllers/payment.controller');

// Webhook handler export karo — index.js use karega
router.webhookHandler = [
  express.raw({ type: 'application/json' }),
  handleWebhook
];

router.post('/', createPayment);
router.get('/', getMyPayments);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;