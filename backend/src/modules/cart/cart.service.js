const AppError = require('../../shared/utils/AppError');
const Cart = require('./cart.model');
const Product = require('../products/product.model');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

exports.getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return cart.toObject();
};

exports.addItem = async (userId, { productId, quantity = 1 }) => {
  const product = await Product.findById(productId);
  if (!product || !product.available) throw new AppError('Producto no disponible', 404);
  if (product.stock < quantity) throw new AppError('Stock insuficiente', 400);
  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.productId.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
    if (existing.quantity > product.stock) {
      throw new AppError('Stock insuficiente', 400);
    }
    existing.price = product.price;
  } else {
    cart.items.push({
      productId: product._id,
      quantity,
      price: product.price,
      title: product.title,
      provider: product.provider,
    });
  }
  await cart.save();
  return cart.toObject();
};

exports.updateItem = async (userId, { productId, quantity }) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((item) => item.productId.toString() === productId);
  if (!item) throw new AppError('Producto no encontrado en el carrito', 404);
  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  } else {
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) throw new AppError('Stock insuficiente', 400);
    item.quantity = quantity;
    item.price = product.price;
  }
  await cart.save();
  return cart.toObject();
};

exports.removeItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  await cart.save();
  return cart.toObject();
};

exports.clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart.toObject();
};
