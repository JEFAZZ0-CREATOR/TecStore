const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const cartController = require('./cart.controller');

const router = express.Router();
router.use(authMiddleware);
router.get('/', asyncHandler(cartController.getCart));
router.post('/', asyncHandler(cartController.addItem));
router.put('/:productId', asyncHandler(cartController.updateItem));
router.delete('/:productId', asyncHandler(cartController.removeItem));
router.delete('/', asyncHandler(cartController.clearCart));

module.exports = router;
