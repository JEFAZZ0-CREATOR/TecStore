const cron = require('node-cron');
const Product = require('../modules/products/product.model');
const { recordPrice } = require('../modules/price-history/priceHistory.service');

cron.schedule('0 0 * * *', async () => {
  const products = await Product.find().lean();
  for (const product of products) {
    await recordPrice({ productId: product._id, price: product.price });
  }
});

module.exports = cron;
