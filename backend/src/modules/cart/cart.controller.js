const { asyncHandler } = require('../../shared/utils/asyncHandler');
const cartService = require('./cart.service');

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json({ success: true, data: cart });
});

exports.addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  res.status(201).json({ success: true, data: cart });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, { productId: req.params.productId, quantity: req.body.quantity });
  res.json({ success: true, data: cart });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  res.json({ success: true, data: cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  res.json({ success: true, data: cart });
});
