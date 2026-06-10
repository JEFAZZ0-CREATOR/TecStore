const { asyncHandler } = require('../../shared/utils/asyncHandler');
const User    = require('../auth/auth.model');
const Order   = require('../orders/order.model');
const Product = require('../products/product.model');
const AppError = require('../../shared/utils/AppError');

// ── Dashboard stats ────────────────────────────────────────────────────────
exports.getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersMonth,
    newUsersWeek,
    totalOrders,
    ordersThisWeek,
    revenueAgg,
    revenueWeekAgg,
    ordersByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      newUsersMonth,
      newUsersWeek,
      totalOrders,
      ordersThisWeek,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      revenueThisWeek: revenueWeekAgg[0]?.total ?? 0,
      ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    },
  });
});

// ── Users list ─────────────────────────────────────────────────────────────
exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();

  const orderCounts = await Order.aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 }, total: { $sum: '$total' } } },
  ]);
  const orderMap = orderCounts.reduce((acc, o) => {
    acc[o._id.toString()] = { count: o.count, total: o.total };
    return acc;
  }, {});

  const enriched = users.map((u) => ({
    ...u,
    orderCount: orderMap[u._id.toString()]?.count ?? 0,
    totalSpent:  orderMap[u._id.toString()]?.total ?? 0,
  }));

  res.json({ success: true, data: enriched });
});

// ── Single user detail + orders ────────────────────────────────────────────
exports.getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) throw new AppError('Usuario no encontrado', 404);

  const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean();
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  res.json({ success: true, data: { user, orders, totalSpent } });
});

// ── Update user role ───────────────────────────────────────────────────────
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'customer'].includes(role)) {
    throw new AppError('Rol inválido', 400);
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, select: '-password' }
  ).lean();
  if (!user) throw new AppError('Usuario no encontrado', 404);
  res.json({ success: true, data: user });
});

// ── Delete user ────────────────────────────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  res.json({ success: true, message: 'Usuario eliminado correctamente' });
});

// ── All orders (admin view) ────────────────────────────────────────────────
exports.listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();

  const userIds = [...new Set(orders.map((o) => o.userId?.toString()).filter(Boolean))];
  const users = await User.find({ _id: { $in: userIds } }).select('name email avatarUrl').lean();
  const userMap = users.reduce((acc, u) => { acc[u._id.toString()] = u; return acc; }, {});

  const enriched = orders.map((o) => ({
    ...o,
    user: userMap[o.userId?.toString()] ?? null,
  }));

  res.json({ success: true, data: enriched });
});

// ── Update order status ────────────────────────────────────────────────────
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'paid', 'shipped', 'cancelled'];
  if (!allowed.includes(status)) throw new AppError('Estado inválido', 400);

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).lean();
  if (!order) throw new AppError('Orden no encontrada', 404);
  res.json({ success: true, data: order });
});

// ── Products list (admin) ──────────────────────────────────────────────────
exports.listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  // Enrich with order count per product
  const orderItems = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', orderCount: { $sum: 1 }, unitsSold: { $sum: '$items.quantity' } } },
  ]);
  const orderMap = orderItems.reduce((acc, o) => {
    acc[o._id?.toString()] = { orderCount: o.orderCount, unitsSold: o.unitsSold };
    return acc;
  }, {});

  const enriched = products.map(p => ({
    ...p,
    orderCount: orderMap[p._id?.toString()]?.orderCount ?? 0,
    unitsSold:  orderMap[p._id?.toString()]?.unitsSold  ?? 0,
  }));

  res.json({ success: true, data: enriched });
});

// ── Toggle product availability ────────────────────────────────────────────
exports.toggleProductAvailability = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  product.available = !product.available;
  await product.save();
  res.json({ success: true, data: product.toObject() });
});

// ── Delete product ─────────────────────────────────────────────────────────
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Producto no encontrado', 404);
  res.json({ success: true, message: 'Producto eliminado correctamente' });
});

// ── Analytics ──────────────────────────────────────────────────────────────
exports.getAnalytics = asyncHandler(async (req, res) => {
  const days = 14;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Revenue + order count per day (last 14 days)
  const ordersPerDay = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        count:   { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Users registered per day
  const usersPerDay = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top 8 products by order count
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id:       '$items.productId',
        title:     { $first: '$items.title' },
        unitsSold: { $sum: '$items.quantity' },
        revenue:   { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 8 },
  ]);

  // Revenue by provider (store)
  const revenueByProvider = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products', localField: 'items.productId',
        foreignField: '_id', as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmpty: true } },
    {
      $group: {
        _id:     { $ifNull: ['$product.provider', 'Desconocido'] },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        count:   { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 6 },
  ]);

  // Order status distribution
  const statusDist = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: { ordersPerDay, usersPerDay, topProducts, revenueByProvider, statusDist },
  });
});

// ── Recent activity feed ───────────────────────────────────────────────────
exports.getActivity = asyncHandler(async (req, res) => {
  const [recentUsers, recentOrders] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(15).select('name email createdAt lastLoginAt avatarUrl role').lean(),
    Order.find().sort({ createdAt: -1 }).limit(15).lean(),
  ]);

  const userIds = [...new Set(recentOrders.map(o => o.userId?.toString()).filter(Boolean))];
  const users   = await User.find({ _id: { $in: userIds } }).select('name email avatarUrl').lean();
  const userMap = users.reduce((acc, u) => { acc[u._id.toString()] = u; return acc; }, {});

  const events = [
    ...recentUsers.map(u => ({
      type: 'new_user',
      date: u.createdAt,
      user: u,
      message: `${u.name} se registró`,
    })),
    ...recentOrders.map(o => ({
      type: 'new_order',
      date: o.createdAt,
      user: userMap[o.userId?.toString()] ?? null,
      orderId: o._id,
      total: o.total,
      status: o.status,
      message: `Nueva orden por $${Number(o.total ?? 0).toFixed(2)}`,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);

  res.json({ success: true, data: events });
});
