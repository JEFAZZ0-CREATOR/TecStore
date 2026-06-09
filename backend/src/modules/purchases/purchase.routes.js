const express = require('express');
const { authMiddleware } = require('../../shared/middlewares');
const purchaseController = require('./purchase.controller');

const router = express.Router();

router.use(authMiddleware);
router.post('/', purchaseController.createPurchase);
router.get('/stats', purchaseController.getStats);
router.get('/', purchaseController.listPurchases);
router.get('/:id', purchaseController.getPurchase);

module.exports = router;
