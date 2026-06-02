const PriceHistory = require('./priceHistory.model');

exports.recordPrice = async ({ productId, price }) => PriceHistory.create({ productId, price });

exports.getHistoryForProduct = async (productId) => PriceHistory.find({ productId }).lean();
