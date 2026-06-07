const Favorite = require('./favorite.model');
const mongoose = require('mongoose');

exports.addFavorite = async ({ userId, productId, productData, identifier }) => {
  const itemIdentifier = identifier || productId || productData?.id || productData?.url || productData?.title;
  if (!itemIdentifier) throw new Error('Identificador de favorito inválido');

  const existing = await Favorite.findOne({ userId, identifier: itemIdentifier }).lean();
  if (existing) return existing;

  return Favorite.create({
    userId,
    productId: productId || null,
    identifier: itemIdentifier,
    productData: productData || {},
  });
};

exports.getFavoritesForUser = async (userId) => Favorite.find({ userId }).lean();

exports.removeFavorite = async (userId, identifierOrId) => {
  if (!identifierOrId) throw new Error('Identificador de favorito inválido');

  let favorite = await Favorite.findOneAndDelete({ userId, identifier: identifierOrId });
  if (!favorite && mongoose.Types.ObjectId.isValid(identifierOrId)) {
    favorite = await Favorite.findOneAndDelete({ userId, _id: identifierOrId });
  }
  if (!favorite) throw new Error('Favorito no encontrado');
  return favorite.toObject();
};

exports.isFavoriteForUser = async (userId, identifierOrId) => {
  if (!identifierOrId) return false;
  const favorite = await Favorite.findOne({ userId, identifier: identifierOrId }).lean();
  if (favorite) return true;
  if (mongoose.Types.ObjectId.isValid(identifierOrId)) {
    const byId = await Favorite.findOne({ userId, _id: identifierOrId }).lean();
    return Boolean(byId);
  }
  return false;
};
