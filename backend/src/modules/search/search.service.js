const providers = require('../../providers');
const Product = require('../products/product.model');
const { normalizeProduct } = require('./search.normalizer');
const { cacheService } = require('../../cache/cache.service');
const AppError = require('../../shared/utils/AppError');

const escapeRegex = (text = '') => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

const Category = require('../categories/category.model');

exports.searchProducts = async ({ q = '', category, minPrice, maxPrice, provider, page = 1, perPage = 25 }) => {
  const cacheKey = `search:${q}:${category || ''}:${minPrice || ''}:${maxPrice || ''}:${provider || ''}:page${page}:per${perPage}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Resolve category if frontend sent a category _id
  let categoryName = category;
  try {
    const mongoose = require('mongoose');
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      const catDoc = await Category.findById(category).lean();
      if (catDoc && catDoc.name) categoryName = catDoc.name;
    }
  } catch (err) {
    // ignore resolution errors and use provided category as-is
    categoryName = category;
  }

  const normalizeAndFilter = (items) => items
    .map(normalizeProduct)
    .filter((item) => {
      let keep = true;
      if (categoryName) keep = keep && item.category?.toLowerCase() === String(categoryName).toLowerCase();
      if (minPrice) keep = keep && item.price >= Number(minPrice);
      if (maxPrice) keep = keep && item.price <= Number(maxPrice);
      return keep;
    });

  const buildUniqueResults = (items) => {
    const seenIds = new Set();
    return items.filter((item) => {
      const id = item.id || item._id || `${item.title}-${item.price}`;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
  };

  if (q.trim()) {
    // Prefer real-time external provider results only. Do not include local example products
    // in normal search responses to avoid showing seeded/mock data.
    const pageNum = Number(page || 1);
    const perPageNum = Number(perPage || 25);
    const externalProducts = await providers.searchAll({ q, category: categoryName, provider, page: pageNum, perPage: perPageNum });
    const externalNormalized = normalizeAndFilter(externalProducts);

    const sorted = externalNormalized.sort((a, b) => a.price - b.price);
    const limited = sorted.slice(0, perPageNum);
    cacheService.set(cacheKey, limited, 30);
    // indicate if there may be more results by comparing returned count to perPage
    return { items: limited, meta: { page: pageNum, perPage: perPageNum, hasMore: externalNormalized.length >= perPageNum } };
  }

  const localProducts = await Product.find({})
    .sort({ price: 1 })
    .limit(25)
    .lean();

  const localNormalized = normalizeAndFilter(localProducts);
  cacheService.set(cacheKey, localNormalized, 30);
  return localNormalized;
};
