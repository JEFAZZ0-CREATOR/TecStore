// backend/src/modules/deals/deals.service.js
const providers = require('../../providers');

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
  id: raw.id || raw._id || `${raw.title}-${raw.price}`,
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

  const results = await Promise.allSettled(
    DEAL_QUERIES.map((q) => providers.searchAll({ q, perPage: 20 }))
  );

  const seen = new Set();
  const merged = [];

  results.forEach((r) => {
    if (r.status !== 'fulfilled') return;
    const items = Array.isArray(r.value) ? r.value : [];
    items.forEach((raw) => {
      const p = normalize(raw);
      const key = p.id;
      if (!seen.has(key) && p.price > 0) {
        seen.add(key);
        merged.push(p);
      }
    });
  });

  const sorted =
    sort === 'price'
      ? merged.sort((a, b) => a.price - b.price)
      : sort === 'savings'
      ? merged.sort((a, b) => (b.originalPrice - b.price || 0) - (a.originalPrice - a.price || 0))
      : merged.sort((a, b) => (b.discount || 0) - (a.discount || 0));

  const result = sorted.slice(0, limit);

  cache.set(cacheKey, result);
  setTimeout(() => cache.delete(cacheKey), 60_000);

  return result;
};