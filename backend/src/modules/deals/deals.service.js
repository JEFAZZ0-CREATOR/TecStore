const providers = require('../../providers');
const Product = require('../products/product.model');
const { normalizeProduct } = require('../search/search.normalizer');
const { cacheService } = require('../../cache/cache.service');

// Queries específicas que regresan productos con descuento real en los providers
const DEAL_QUERIES = [
  'laptop oferta',
  'gpu descuento',
  'monitor gaming rebaja',
  'cpu intel amd oferta',
  'ssd disco duro oferta',
  'memoria ram oferta',
  'teclado mouse gamer descuento',
];

exports.getDeals = async ({ minDiscount = 0, sort = 'discount', limit = 60 } = {}) => {
  const cacheKey = `deals:min${minDiscount}:sort${sort}:lim${limit}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  // 1. Productos locales con descuento
  const localProducts = await Product.find({ discount: { $gt: minDiscount } })
    .sort({ discount: -1 })
    .limit(50)
    .lean();

  // 2. Resultados externos de múltiples queries en paralelo
  const externalResults = await Promise.allSettled(
    DEAL_QUERIES.map((q) =>
      providers.searchAll({ q, perPage: 20 })
    )
  );

  const seen = new Set();
  const merged = [];

  const push = (item) => {
    const key = item.id || item._id || item.externalId || `${item.title}-${item.price}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  };

  // Locales primero
  localProducts.map(normalizeProduct).forEach(push);

  // Externos: solo los que tienen discount > 0 real
  externalResults.forEach((r) => {
    if (r.status !== 'fulfilled') return;
    const items = Array.isArray(r.value) ? r.value : [];
    items
      .map(normalizeProduct)
      .filter((p) => (p.discount || 0) > minDiscount && p.price > 0)
      .forEach(push);
  });

  // Ordenar
  let sorted;
  if (sort === 'discount') {
    sorted = merged.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (sort === 'savings') {
    sorted = merged.sort(
      (a, b) =>
        ((b.originalPrice || b.price) - b.price) -
        ((a.originalPrice || a.price) - a.price)
    );
  } else if (sort === 'price') {
    sorted = merged.sort((a, b) => a.price - b.price);
  } else {
    sorted = merged;
  }

  const result = sorted.slice(0, limit);
  cacheService.set(cacheKey, result, 60); // cache 60 segundos
  return result;
};