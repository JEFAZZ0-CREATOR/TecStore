const { normalizeProduct } = require('./search.normalizer');

exports.rankProducts = (products, query) => {
  return products
    .map((product) => ({
      ...product,
      score: query.q ? (product.title.toLowerCase().includes(query.q.toLowerCase()) ? 1 : 0) : 0,
    }))
    .sort((a, b) => b.score - a.score || a.price - b.price);
};
