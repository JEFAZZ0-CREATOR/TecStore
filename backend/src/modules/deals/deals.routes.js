const { Router } = require('express');
const { getDeals } = require('./deals.controller');

const router = Router();

// GET /api/v1/deals?minDiscount=10&sort=discount&limit=60
router.get('/', getDeals);

module.exports = router;