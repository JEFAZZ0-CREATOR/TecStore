const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const { asyncHandler } = require('../../shared/utils/asyncHandler');
const priceHistoryService = require('./priceHistory.service');

const router = express.Router();

router.get('/summary', authMiddleware, asyncHandler(async (req, res) => {
  const data = await priceHistoryService.getSummaryForUser(req.user.id);
  res.json({ success: true, data });
}));

router.get('/:identifier', authMiddleware, asyncHandler(async (req, res) => {
  const history = await priceHistoryService.getHistoryByIdentifier(req.params.identifier);
  res.json({ success: true, data: { history } });
}));

module.exports = router;
