const PriceHistory = require('./priceHistory.model');
const Purchase = require('../purchases/purchase.model');
const Favorite = require('../favorites/favorite.model');
const mongoose = require('mongoose');

exports.recordPrice = async ({ productId, identifier, title, provider, price }) => {
  const payload = {
    price,
    recordedAt: new Date(),
  };

  if (productId && mongoose.Types.ObjectId.isValid(productId) && String(productId).length === 24) {
    payload.productId = productId;
  }
  if (identifier) payload.identifier = String(identifier);
  if (title) payload.title = title;
  if (provider) payload.provider = provider;

  return PriceHistory.create(payload);
};

exports.getHistoryForProduct = async (productId) => (
  PriceHistory.find({ productId }).sort({ recordedAt: 1 }).lean()
);

exports.getHistoryByIdentifier = async (identifier) => {
  const decoded = decodeURIComponent(identifier);
  const history = await PriceHistory.find({
    $or: [
      { identifier: decoded },
      ...(mongoose.Types.ObjectId.isValid(decoded) ? [{ productId: decoded }] : []),
    ],
  }).sort({ recordedAt: 1 }).lean();

  if (history.length) return history;

  const purchases = await Purchase.find({ 'items.identifier': decoded }).lean();
  const fromPurchases = purchases.flatMap((purchase) =>
    purchase.items
      .filter((item) => item.identifier === decoded)
      .map((item) => ({
        identifier: item.identifier,
        title: item.title,
        provider: item.provider,
        price: item.price,
        recordedAt: purchase.purchasedAt,
        source: 'purchase',
      }))
  );

  return fromPurchases.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
};

exports.getSummaryForUser = async (userId) => {
  const favorites = await Favorite.find({ userId }).lean();
  const purchases = await Purchase.find({ userId }).sort({ purchasedAt: -1 }).lean();

  const tracked = new Map();

  favorites.forEach((fav) => {
    const key = fav.identifier;
    tracked.set(key, {
      identifier: key,
      title: fav.productData?.title || fav.productData?.name || 'Producto',
      provider: fav.productData?.provider || '—',
      image: fav.productData?.image || '',
      prices: [],
    });
  });

  purchases.forEach((purchase) => {
    purchase.items.forEach((item) => {
      const key = item.identifier;
      if (!tracked.has(key)) {
        tracked.set(key, {
          identifier: key,
          title: item.title,
          provider: item.provider,
          image: item.image || '',
          prices: [],
        });
      }
      tracked.get(key).prices.push({
        price: item.price,
        recordedAt: purchase.purchasedAt,
      });
    });
  });

  const dbHistory = await PriceHistory.find({
    identifier: { $in: [...tracked.keys()] },
  }).sort({ recordedAt: 1 }).lean();

  dbHistory.forEach((row) => {
    if (!tracked.has(row.identifier)) return;
    tracked.get(row.identifier).prices.push({
      price: row.price,
      recordedAt: row.recordedAt,
    });
  });

  const products = [...tracked.values()].map((product) => {
    const sorted = product.prices.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    const priceValues = sorted.map((p) => p.price);
    const current = priceValues.length ? priceValues[priceValues.length - 1] : null;
    const min = priceValues.length ? Math.min(...priceValues) : null;
    const max = priceValues.length ? Math.max(...priceValues) : null;
    const avg = priceValues.length
      ? Number((priceValues.reduce((s, v) => s + v, 0) / priceValues.length).toFixed(2))
      : null;

    return {
      ...product,
      prices: sorted,
      currentPrice: current,
      minPrice: min,
      maxPrice: max,
      avgPrice: avg,
      change: priceValues.length >= 2
        ? Number((priceValues[priceValues.length - 1] - priceValues[0]).toFixed(2))
        : 0,
    };
  });

  const allPrices = products.flatMap((p) => p.prices.map((x) => x.price));
  const globalMin = allPrices.length ? Math.min(...allPrices) : 0;
  const globalMax = allPrices.length ? Math.max(...allPrices) : 0;
  const globalAvg = allPrices.length
    ? Number((allPrices.reduce((s, v) => s + v, 0) / allPrices.length).toFixed(2))
    : 0;

  return {
    products,
    stats: {
      trackedProducts: products.length,
      totalRecords: allPrices.length,
      globalMin,
      globalMax,
      globalAvg,
    },
  };
};
