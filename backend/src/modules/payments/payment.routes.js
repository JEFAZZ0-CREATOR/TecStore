const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const paymentController = require('./payment.controller');

const router = express.Router();
router.use(authMiddleware);
router.post('/checkout', asyncHandler(paymentController.checkout));
router.post('/confirm', asyncHandler(paymentController.confirm));

module.exports = router;
