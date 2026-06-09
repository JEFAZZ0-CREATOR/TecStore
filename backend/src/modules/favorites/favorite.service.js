const Favorite = require('./favorite.model');
const mongoose = require('mongoose');
const AppError = require('../../shared/utils/AppError');

const safeObjectId = (value) => {
  if (!value) return null;
  const str = String(value);
  if (mongoose.Types.ObjectId.isValid(str) && str.length === 24) return str;
  return null;
};

exports.addFavorite = async ({ userId, productId, productData, identifier }) => {
  const itemIdentifier = String(
    identifier || productData?.id || productData?.url || productId || productData?.title || ''
  ).trim();

  if (!itemIdentifier) throw new AppError('Identificador de favorito inválido', 400);

  const existing = await Favorite.findOne({ userId, identifier: itemIdentifier }).lean();
  if (existing) return existing;

  return Favorite.create({
    userId,
    productId: safeObjectId(productId) || safeObjectId(productData?._id) || safeObjectId(productData?.id),
    identifier: itemIdentifier,
    productData: productData || {},
  });
};

exports.getFavoritesForUser = async (userId) => Favorite.find({ userId }).sort({ createdAt: -1 }).lean();

exports.removeFavorite = async (userId, identifierOrId) => {
  if (!identifierOrId) throw new AppError('Identificador de favorito inválido', 400);

  const decoded = decodeURIComponent(String(identifierOrId));
  let favorite = await Favorite.findOneAndDelete({ userId, identifier: decoded });

  if (!favorite && mongoose.Types.ObjectId.isValid(decoded)) {
    favorite = await Favorite.findOneAndDelete({ userId, _id: decoded });
  }

  if (!favorite) throw new AppError('Favorito no encontrado', 404);
  return favorite.toObject();
};

exports.isFavoriteForUser = async (userId, identifierOrId) => {
  if (!identifierOrId) return false;
  const decoded = decodeURIComponent(String(identifierOrId));
  const favorite = await Favorite.findOne({ userId, identifier: decoded }).lean();
  if (favorite) return true;
  if (mongoose.Types.ObjectId.isValid(decoded)) {
    const byId = await Favorite.findOne({ userId, _id: decoded }).lean();
    return Boolean(byId);
  }
  return false;
};
