const AppError = require('../../shared/utils/AppError');
const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const Product = require('../products/product.model');

exports.createOrderFromCart = async (userId, payload = {}) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || !cart.items.length) throw new AppError('El carrito está vacío', 400);

  const items = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      throw new AppError(`Stock insuficiente para ${item.title}`, 400);
    }
    product.stock -= item.quantity;
    await product.save();

    items.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
      title: product.title,
    });

    subtotal += product.price * item.quantity;
  }

  const shipping = Number(payload.shipping || 0);
  const tax = Math.round(subtotal * 0.12 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  const order = await Order.create({
    userId,
    items,
    subtotal,
    tax,
    shipping,
    total,
    status: 'pending',
    paymentStatus: 'unpaid',
  });

  cart.items = [];
  await cart.save();

  return order.toObject();
};

exports.getOrdersByUser = async (userId) => Order.find({ userId }).lean();

exports.getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId }).lean();
  if (!order) throw new AppError('Orden no encontrada', 404);
  return order;
};

exports.markOrderPaid = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Orden no encontrada', 404);
  order.paymentStatus = 'paid';
  order.status = 'paid';
  await order.save();
  return order.toObject();
};
