const { asyncHandler } = require('../../shared/utils/asyncHandler');
const searchService = require('./search.service');

exports.search = asyncHandler(async (req, res) => {
  const result = await searchService.searchProducts(req.query);
  res.json({ success: true, data: result });
});
