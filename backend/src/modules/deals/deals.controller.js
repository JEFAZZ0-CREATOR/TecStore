const { asyncHandler } = require('../../shared/utils/asyncHandler');
const dealsService = require('./deals.service');

exports.getDeals = asyncHandler(async (req, res) => {
  const { minDiscount = 0, sort = 'discount', limit = 60 } = req.query;

  const deals = await dealsService.getDeals({
    minDiscount: Number(minDiscount),
    sort,
    limit: Math.min(Number(limit), 100),
  });

  res.json({
    status: 'success',
    data: {
      items: deals,
      meta: { total: deals.length, minDiscount: Number(minDiscount), sort },
    },
  });
});