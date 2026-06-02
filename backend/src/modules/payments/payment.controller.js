const { asyncHandler } = require('../../shared/utils/asyncHandler');
const paymentService = require('./payment.service');
const orderService = require('../orders/order.service');

exports.checkout = asyncHandler(async (req, res) => {
  const { orderId, currency } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId es requerido' });
  }
  const order = await orderService.getOrderById(req.user.id, orderId);
  const paymentIntent = await paymentService.createPaymentIntent({
    amount: Math.round(order.total * 100),
    currency: currency || 'usd',
    metadata: { orderId: order._id.toString(), userId: req.user.id },
  });
  res.json({ success: true, data: { order, paymentIntent } });
});

exports.confirm = asyncHandler(async (req, res) => {
  const { paymentId, orderId } = req.body;
  if (!paymentId || !orderId) {
    return res.status(400).json({ success: false, message: 'paymentId y orderId son requeridos' });
  }
  const payment = await paymentService.retrievePayment(paymentId);
  if (payment.status === 'succeeded') {
    await orderService.markOrderPaid(orderId);
  }
  res.json({ success: true, data: payment });
});
