const cron = require('node-cron');
const Product = require('../../modules/products/product.model');
const { recordPrice } = require('./priceHistory.service');

cron.schedule('0 */4 * * *', async () => {
  const products = await Product.find().lean();
  for (const product of products) {
    await recordPrice({ productId: product._id, price: product.price });
  }
});

module.exports = cron;
