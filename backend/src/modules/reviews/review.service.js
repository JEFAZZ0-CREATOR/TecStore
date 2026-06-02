const Review = require('./review.model');

exports.addReview = async ({ productId, userId, rating, comment }) => {
  return Review.create({ productId, userId, rating, comment });
};

exports.getReviewsForProduct = async (productId) => Review.find({ productId }).lean();
