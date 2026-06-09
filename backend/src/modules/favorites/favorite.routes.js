const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const { addFavorite, getFavoritesForUser, removeFavorite, isFavoriteForUser } = require('./favorite.service');
const router = express.Router();

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const favorite = await addFavorite({
    userId: req.user.id,
    productId: req.body.productId,
    productData: req.body.productData,
    identifier: req.body.identifier,
  });
  res.status(201).json({ success: true, data: favorite });
}));

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const data = await getFavoritesForUser(req.user.id);
  res.json({ success: true, data });
}));

router.get('/check/:identifier', authMiddleware, asyncHandler(async (req, res) => {
  const isFavorite = await isFavoriteForUser(req.user.id, req.params.identifier);
  res.json({ success: true, data: { isFavorite } });
}));

router.delete('/:identifier', authMiddleware, asyncHandler(async (req, res) => {
  const favorite = await removeFavorite(req.user.id, decodeURIComponent(req.params.identifier));
  res.json({ success: true, data: favorite });
}));

module.exports = router;
