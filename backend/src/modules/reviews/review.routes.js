const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const { addReview, getReviewsForProduct } = require('./review.service');
const router = express.Router();

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const review = await addReview({ ...req.body, userId: req.user.id });
  res.status(201).json({ success: true, data: review });
}));

router.get('/product/:productId', asyncHandler(async (req, res) => {
  const reviews = await getReviewsForProduct(req.params.productId);
  res.json({ success: true, data: reviews });
}));

module.exports = router;
