const providers = require('../../providers');
const Product = require('../products/product.model');

const DEAL_QUERIES = [
  'laptop oferta',
  'gpu descuento',
  'monitor gaming rebaja',
  'cpu intel amd oferta',
  'ssd disco duro oferta',
  'memoria ram oferta',
  'teclado mouse gamer descuento',
];

const normalize = (raw) => ({
  id: String(raw.id || raw._id || `${raw.title}-${raw.price}`),
  title: raw.title,
  name: raw.title,
  description: raw.description || raw.title || '',
  provider: raw.provider,
  image: raw.image || raw.thumbnail || '',
  price: raw.price || 0,
  originalPrice: raw.originalPrice || null,
  discount:
    raw.discount ||
    (raw.originalPrice && raw.price
      ? Math.round(((raw.originalPrice - raw.price) / raw.originalPrice) * 100)
      : 0),
  rating: raw.rating || 0,
  available: raw.available ?? true,
  url: raw.url,
  category: raw.category || 'componentes',
  specs: raw.specs || {},
  source: raw.source || 'external',
});

const cache = new Map();

exports.getDeals = async ({ minDiscount = 0, sort = 'discount', limit = 60 } = {}) => {
  const cacheKey = `deals:${minDiscount}:${sort}:${limit}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // 1. Productos locales con descuento (rápido, siempre disponible)
  const localProducts = await Product.find({ discount: { $gt: minDiscount } })
    .sort({ discount: -1 })
    .limit(50)
    .lean();

  // 2. Providers externos en paralelo
  const externalResults = await Promise.allSettled(
    DEAL_QUERIES.map((q) => providers.searchAll({ q, perPage: 20 }))
  );

  const seen = new Set();
  const merged = [];

  const push = (raw) => {
    const p = normalize(raw);
    if (!seen.has(p.id) && p.price > 0) {
      seen.add(p.id);
      merged.push(p);
    }
  };

  // Locales primero (tienen prioridad)
  localProducts.forEach(push);

  // Externos: solo los que tienen descuento real
  externalResults.forEach((r) => {
    if (r.status !== 'fulfilled') return;
    const items = Array.isArray(r.value) ? r.value : [];
    items.filter((p) => (p.discount || 0) > minDiscount).forEach(push);
  });

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