const authRoutes = require('../../modules/auth/auth.routes');
const userRoutes = require('../../modules/users/user.routes');
const productRoutes = require('../../modules/products/product.routes');
const searchRoutes = require('../../modules/search/search.routes');
const categoryRoutes = require('../../modules/categories/category.routes');
const reviewRoutes = require('../../modules/reviews/review.routes');
const favoriteRoutes = require('../../modules/favorites/favorite.routes');
const cartRoutes = require('../../modules/cart/cart.routes');
const orderRoutes = require('../../modules/orders/order.routes');
const paymentRoutes = require('../../modules/payments/payment.routes');

module.exports = (router) => {
  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);
  router.use('/products', productRoutes);
  router.use('/search', searchRoutes);
  router.use('/categories', categoryRoutes);
  router.use('/reviews', reviewRoutes);
  router.use('/favorites', favoriteRoutes);
  router.use('/cart', cartRoutes);
  router.use('/orders', orderRoutes);
  router.use('/payments', paymentRoutes);
};
