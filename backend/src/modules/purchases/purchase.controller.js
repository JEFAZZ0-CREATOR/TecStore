const { asyncHandler } = require('../../shared/utils/asyncHandler');
const purchaseService = require('./purchase.service');

exports.createPurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.createPurchaseSession(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Compra registrada', data: purchase });
});

exports.listPurchases = asyncHandler(async (req, res) => {
  const purchases = await purchaseService.getPurchasesForUser(req.user.id, {
    limit: Number(req.query.limit) || 100,
    skip: Number(req.query.skip) || 0,
  });
  res.json({ success: true, data: purchases });
});

exports.getPurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.getPurchaseById(req.user.id, req.params.id);
  res.json({ success: true, data: purchase });
});

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await purchaseService.getPurchaseStats(req.user.id);
  res.json({ success: true, data: stats });
});
