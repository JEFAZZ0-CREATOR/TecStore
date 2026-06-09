const { v4: uuidv4 } = require('uuid');
const AppError = require('../../shared/utils/AppError');
const Purchase = require('./purchase.model');
const { recordPrice } = require('../price-history/priceHistory.service');

const normalizeItem = (raw) => {
  const identifier = String(
    raw.identifier || raw.productId || raw._id || raw.id || raw.url || `${raw.title || raw.name}-${raw.price}`
  );
  const price = Number(raw.price) || 0;
  const quantity = Math.max(1, Number(raw.quantity) || 1);
  return {
    identifier,
    title: raw.title || raw.name || 'Producto',
    price,
    quantity,
    lineTotal: Number((price * quantity).toFixed(2)),
    provider: raw.provider || 'desconocido',
    url: raw.url || '',
    image: raw.image || '',
  };
};

exports.createPurchaseSession = async (userId, { items = [], source = 'cart' }) => {
  if (!items.length) throw new AppError('El carrito está vacío', 400);

  const normalized = items.map(normalizeItem);
  const subtotal = Number(normalized.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const itemCount = normalized.reduce((sum, item) => sum + item.quantity, 0);
  const providers = [...new Set(normalized.map((item) => item.provider).filter(Boolean))];
  const openedUrls = [...new Set(normalized.map((item) => item.url).filter((url) => url && url.startsWith('http')))];

  const purchase = await Purchase.create({
    userId,
    sessionId: uuidv4(),
    items: normalized,
    subtotal,
    itemCount,
    providerCount: providers.length,
    providers,
    openedUrls,
    source,
    purchasedAt: new Date(),
  });

  await Promise.allSettled(
    normalized.map((item) => recordPrice({
      identifier: item.identifier,
      title: item.title,
      provider: item.provider,
      price: item.price,
    }))
  );

  return purchase.toObject();
};

exports.getPurchasesForUser = async (userId, { limit = 100, skip = 0 } = {}) => (
  Purchase.find({ userId })
    .sort({ purchasedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
);

exports.getPurchaseById = async (userId, purchaseId) => {
  const purchase = await Purchase.findOne({ _id: purchaseId, userId }).lean();
  if (!purchase) throw new AppError('Registro de compra no encontrado', 404);
  return purchase;
};

exports.getPurchaseStats = async (userId) => {
  const purchases = await Purchase.find({ userId }).sort({ purchasedAt: 1 }).lean();

  const totalSpent = Number(purchases.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2));
  const totalSessions = purchases.length;
  const totalItems = purchases.reduce((sum, p) => sum + p.itemCount, 0);

  const byProvider = {};
  const byMonth = {};
  const byDayOfWeek = { Dom: 0, Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0 };
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  purchases.forEach((purchase) => {
    const date = new Date(purchase.purchasedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth[monthKey] = (byMonth[monthKey] || 0) + purchase.subtotal;
    byDayOfWeek[dayLabels[date.getDay()]] += purchase.itemCount;

    purchase.items.forEach((item) => {
      const key = item.provider || 'desconocido';
      byProvider[key] = (byProvider[key] || 0) + item.lineTotal;
    });
  });

  const monthlySeries = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount: Number(amount.toFixed(2)) }));

  const providerSeries = Object.entries(byProvider)
    .sort(([, a], [, b]) => b - a)
    .map(([provider, amount]) => ({ provider, amount: Number(amount.toFixed(2)) }));

  const weekdaySeries = dayLabels.map((day) => ({ day, count: byDayOfWeek[day] }));

  const recent = purchases.slice(-7).map((p) => ({
    date: p.purchasedAt,
    amount: p.subtotal,
    items: p.itemCount,
  }));

  const calendarMap = {};
  const now = new Date();
  for (let i = 89; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    calendarMap[key] = { date: key, count: 0, amount: 0 };
  }

  purchases.forEach((purchase) => {
    const key = new Date(purchase.purchasedAt).toISOString().slice(0, 10);
    if (!calendarMap[key]) {
      calendarMap[key] = { date: key, count: 0, amount: 0 };
    }
    calendarMap[key].count += 1;
    calendarMap[key].amount = Number((calendarMap[key].amount + purchase.subtotal).toFixed(2));
  });

  const calendarActivity = Object.values(calendarMap);

  const topProducts = {};
  purchases.forEach((purchase) => {
    purchase.items.forEach((item) => {
      const key = item.title;
      if (!topProducts[key]) {
        topProducts[key] = { title: item.title, provider: item.provider, total: 0, quantity: 0 };
      }
      topProducts[key].total += item.lineTotal;
      topProducts[key].quantity += item.quantity;
    });
  });

  const topProductSeries = Object.values(topProducts)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((p) => ({ ...p, total: Number(p.total.toFixed(2)) }));

  return {
    totalSpent,
    totalSessions,
    totalItems,
    averagePerSession: totalSessions ? Number((totalSpent / totalSessions).toFixed(2)) : 0,
    monthlySeries,
    providerSeries,
    weekdaySeries,
    calendarActivity,
    topProductSeries,
    recent,
  };
};
