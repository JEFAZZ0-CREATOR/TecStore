const providers = require('../../providers');
const { normalizeProduct } = require('./search.normalizer');
const { cacheService } = require('../../cache/cache.service');
const AppError = require('../../shared/utils/AppError');

exports.searchProducts = async ({ q, category, minPrice, maxPrice, provider }) => {
  if (!q) {
    throw new AppError('El parámetro q es requerido', 400);
  }
  const cacheKey = `search:${q}:${category || ''}:${minPrice || ''}:${maxPrice || ''}:${provider || ''}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  const items = await providers.searchAll({ q, category, provider });
  const normalized = items.map(normalizeProduct);
  const filtered = normalized.filter((item) => {
    let keep = true;
    if (category) keep = keep && item.category?.toLowerCase() === category.toLowerCase();
    if (minPrice) keep = keep && item.price >= Number(minPrice);
    if (maxPrice) keep = keep && item.price <= Number(maxPrice);
    return keep;
  });

  cacheService.set(cacheKey, filtered, 30);
  return filtered;
};
