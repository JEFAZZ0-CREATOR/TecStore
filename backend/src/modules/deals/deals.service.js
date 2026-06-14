const Product = require('../products/product.model');
const { normalizeProduct } = require('../search/search.normalizer');

const cache = new Map();

exports.getDeals = async ({ minDiscount = 0, sort = 'discount', limit = 60 } = {}) => {
  const cacheKey = `deals:${minDiscount}:${sort}:${limit}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // 1. Productos locales con descuento (fuente principal)
  const localProducts = await Product.find({ discount: { $gt: minDiscount } })
    .sort({ discount: -1 })
    .lean();

  const seen   = new Set();
  const merged = [];

  const push = (raw) => {
    const p   = normalizeProduct(raw);
    const key = String(p.id || p._id || `${p.title}-${p.price}`);
    if (!seen.has(key) && p.price > 0) {
      seen.add(key);
      merged.push(p);
    }
  };

  localProducts.forEach(push);

  // 2. Cyberpuerta como complemento (único scraper funcional)
  try {
    const cyberpuerta = require('../../providers/cyberpuerta.provider');
    const queries = ['laptop oferta', 'gpu descuento', 'monitor oferta', 'ssd descuento'];
    const results = await Promise.allSettled(
      queries.map((q) => cyberpuerta.search({ q, perPage: 15 }))
    );
    results.forEach((r) => {
      if (r.status !== 'fulfilled') return;
      (r.value || [])
        .filter((p) => (p.discount || 0) > minDiscount)
        .forEach(push);
    });
  } catch (_) {}

  // Ordenar
  const sorted =
    sort === 'price'
      ? merged.sort((a, b) => a.price - b.price)
      : sort === 'savings'
      ? merged.sort((a, b) =>
          ((b.originalPrice || b.price) - b.price) - ((a.originalPrice || a.price) - a.price)
        )
      : merged.sort((a, b) => (b.discount || 0) - (a.discount || 0));

  const result = sorted.slice(0, limit);
  cache.set(cacheKey, result);
  setTimeout(() => cache.delete(cacheKey), 60_000);

  return result;
};