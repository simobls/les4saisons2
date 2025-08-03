const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  getPaymentHistory,
  handleWebhook
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');

const router = express.Router();

// Webhook route (must be before other middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-intent', protect, validatePayment, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/history', protect, getPaymentHistory);

// Admin only routes
router.post('/refund', protect, adminOnly, processRefund);

module.exports = router;