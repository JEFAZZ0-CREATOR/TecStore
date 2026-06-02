const Favorite = require('./favorite.model');

exports.addFavorite = async ({ userId, productId }) => {
  const existing = await Favorite.findOne({ userId, productId }).lean();
  if (existing) return existing;
  return Favorite.create({ userId, productId });
};

exports.getFavoritesForUser = async (userId) => Favorite.find({ userId }).lean();
