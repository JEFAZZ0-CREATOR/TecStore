const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const orderController = require('./order.controller');

const router = express.Router();
router.use(authMiddleware);
router.post('/', asyncHandler(orderController.createOrder));
router.get('/', asyncHandler(orderController.listOrders));
router.get('/:id', asyncHandler(orderController.getOrder));

module.exports = router;
