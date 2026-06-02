const { asyncHandler } = require('../../shared/utils/asyncHandler');
const orderService = require('./order.service');

exports.createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrderFromCart(req.user.id, req.body);
  res.status(201).json({ success: true, data: order });
});

exports.listOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrdersByUser(req.user.id);
  res.json({ success: true, data: orders });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user.id, req.params.id);
  res.json({ success: true, data: order });
});
