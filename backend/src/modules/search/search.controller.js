const { asyncHandler } = require('../../shared/utils/asyncHandler');
const searchService = require('./search.service');

exports.search = asyncHandler(async (req, res) => {
  const result = await searchService.searchProducts(req.query);
  if (result && result.items) {
    return res.json({ success: true, data: result });
  }
  res.json({ success: true, data: { items: result, meta: { page: 1, perPage: result.length, hasMore: false } } });
});
