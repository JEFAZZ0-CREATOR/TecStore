const Product = require('../modules/products/product.model');
const { recordPrice } = require('../modules/price-history/priceHistory.service');

exports.run = async () => {
  const products = await Product.find().lean();
  for (const product of products) {
    await recordPrice({ productId: product._id, price: product.price });
  }
};
