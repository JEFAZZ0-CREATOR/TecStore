const providers = require('../../providers');
const Product = require('../products/product.model');
const { normalizeProduct } = require('./search.normalizer');
const { cacheService } = require('../../cache/cache.service');
const Category = require('../categories/category.model');

const escapeRegex = (text = '') => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

exports.searchProducts = async ({ q = '', category, minPrice, maxPrice, provider, page = 1, perPage = 25 }) => {
  const cacheKey = `search:${q}:${category || ''}:${minPrice || ''}:${maxPrice || ''}:${provider || ''}:page${page}:per${perPage}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  const pageNum    = Math.max(1, Number(page));
  const perPageNum = Math.min(Number(perPage) || 25, 100);

  // Resolver categoría si viene como ObjectId
  let categoryName = category;
  try {
    const mongoose = require('mongoose');
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      const catDoc = await Category.findById(category).lean();
      if (catDoc?.name) categoryName = catDoc.name;
    }
  } catch (_) {}

  const applyFilters = (items) =>
    items.filter((item) => {
      if (categoryName && item.category?.toLowerCase() !== categoryName.toLowerCase()) return false;
      if (minPrice && item.price < Number(minPrice)) return false;
      if (maxPrice && item.price > Number(maxPrice)) return false;
      return true;
    });

  const dedupe = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = String(item.id || item._id || `${item.title}-${item.price}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Sin query: devolver todos los locales con filtros
  if (!q.trim()) {
    const mongoFilter = {};
    if (categoryName) mongoFilter.category = new RegExp(`^${escapeRegex(categoryName)}$`, 'i');
    if (minPrice || maxPrice) {
      mongoFilter.price = {};
      if (minPrice) mongoFilter.price.$gte = Number(minPrice);
      if (maxPrice) mongoFilter.price.$lte = Number(maxPrice);
    }
    const mongoProducts = await Product.find(mongoFilter).sort({ price: 1 }).limit(perPageNum).lean();
    const result = mongoProducts.map(normalizeProduct);
    cacheService.set(cacheKey, result, 30);
    return { items: result, meta: { page: pageNum, perPage: perPageNum, hasMore: false, source: 'local' } };
  }

  // Con query: buscar en MongoDB primero
  const regex = new RegExp(escapeRegex(q.trim()), 'i');
  const mongoFilter = {
    $or: [{ title: regex }, { description: regex }, { category: regex }],
  };
  if (categoryName) mongoFilter.category = new RegExp(`^${escapeRegex(categoryName)}$`, 'i');
  if (minPrice || maxPrice) {
    mongoFilter.price = {};
    if (minPrice) mongoFilter.price.$gte = Number(minPrice);
    if (maxPrice) mongoFilter.price.$lte = Number(maxPrice);
  }
  if (provider) mongoFilter.provider = new RegExp(`^${escapeRegex(provider)}$`, 'i');

  const mongoProducts = await Product.find(mongoFilter).sort({ price: 1 }).lean();
  const localItems = mongoProducts.map(normalizeProduct);

  // Cyberpuerta como complemento (único scraper funcional)
  let externalItems = [];
  try {
    const cyberpuerta = require('../../providers/cyberpuerta.provider');
    const raw = await cyberpuerta.search({ q, category: categoryName, page: pageNum, perPage: perPageNum });
    externalItems = applyFilters((raw || []).map(normalizeProduct));
  } catch (_) {}

  // Merge: locales primero, externos como complemento
  const merged   = dedupe([...localItems, ...externalItems]);
  const sorted   = merged.sort((a, b) => a.price - b.price);
  const paginated = sorted.slice((pageNum - 1) * perPageNum, pageNum * perPageNum);

  const result = {
    items: paginated,
    meta: {
      page: pageNum,
      perPage: perPageNum,
      hasMore: sorted.length > pageNum * perPageNum,
      total: sorted.length,
      source: localItems.length > 0 ? 'local+scraping' : 'scraping',
    },
  };

  cacheService.set(cacheKey, result, 30);
  return result;
};