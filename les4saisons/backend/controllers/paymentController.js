const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id.toString(),
        orderNumber: order.orderNumber
      }
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment intent'
    });
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found'
      });
    }

    // Update order with payment details
    const order = await Order.findByIdAndUpdate(
      paymentIntent.metadata.orderId,
      {
        paymentStatus: paymentIntent.status === 'succeeded' ? 'paid' : 'failed',
        'paymentDetails.stripePaymentIntentId': paymentIntent.id,
        'paymentDetails.transactionId': paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'confirmed' : 'pending'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If payment succeeded, emit notification to admin
    if (paymentIntent.status === 'succeeded') {
      const io = req.app.get('io');
      io.to('admin-room').emit('payment-confirmed', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: paymentIntent.amount / 100,
        customerName: order.customerInfo.name
      });
    }

    res.status(200).json({
      success: true,
      message: paymentIntent.status === 'succeeded' ? 'Payment confirmed' : 'Payment failed',
      data: {
        paymentStatus: paymentIntent.status,
        order
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment'
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.paymentDetails.stripePaymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this order'
      });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentDetails.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || 'requested_by_customer'
    });

    // Update order
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id, paymentStatus: { $in: ['paid', 'refunded'] } };

    // If admin, get all payments
    if (req.user.role === 'admin') {
      query = { paymentStatus: { $in: ['paid', 'refunded'] } };
    }

    const orders = await Order.find(query)
      .select('orderNumber customerInfo total paymentStatus paymentDetails createdAt')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment history'
    });
  }
};

// @desc    Webhook handler for Stripe events
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Update order status
      await Order.findByIdAndUpdate(
        paymentIntent.metadata.orderId,
        {
          paymentStatus: 'paid',
          status: 'confirmed',
          'paymentDetails.transactionId': paymentIntent.id
        }
      );
      
      console.log('Payment succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      // Update order status
      await Order.findByIdAndUpdate(
        failedPayment.metadata.orderId,
        {
          paymentStatus: 'failed'
        }
      );
      
      console.log('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  processRefund,
  getPaymentHistory,
  handleWebhook
};