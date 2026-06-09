const Product = require('./product.model');
const AppError = require('../../shared/utils/AppError');

exports.getProducts = async (query) => {
  const filter = {};

  if (query.provider) {
    filter.provider = new RegExp(`^${query.provider}$`, 'i');
  }

  if (query.category) {
    filter.category = new RegExp(`^${query.category}$`, 'i');
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.hasDiscount === 'true' || query.hasDiscount === true) {
    filter.discount = { $gt: 0 };
  }

  if (query.available !== undefined) {
    filter.available = query.available === 'true' || query.available === true;
  }

  const limit = query.limit ? Math.min(Number(query.limit), 100) : 50;
  const sortField = query.sort === 'discount' ? { discount: -1 } : { createdAt: -1 };

  return Product.find(filter).sort(sortField).limit(limit).lean();
};

exports.getProductById = async (id) => {
  const product = await Product.findById(id).lean();
  if (!product) {
    throw new AppError('Producto no encontrado', 404);
  }
  return product;
};

exports.createProduct = async (payload) => {
  const product = await Product.create(payload);
  return product.toObject();
};

exports.updateProduct = async (id, payload) => {
  const product = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!product) {
    throw new AppError('Producto no encontrado', 404);
  }
  return product;
};

exports.deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id).lean();
  if (!product) {
    throw new AppError('Producto no encontrado', 404);
  }
  return product;
};
