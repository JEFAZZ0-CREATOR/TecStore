const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const { addFavorite, getFavoritesForUser } = require('./favorite.service');
const router = express.Router();

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const favorite = await addFavorite({ userId: req.user.id, productId: req.body.productId });
  res.status(201).json({ success: true, data: favorite });
}));

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const data = await getFavoritesForUser(req.user.id);
  res.json({ success: true, data });
}));

module.exports = router;
