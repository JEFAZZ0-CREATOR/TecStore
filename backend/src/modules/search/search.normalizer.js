exports.normalizeProduct = (raw) => ({
  id: raw.id,
  title: raw.title,
  description: raw.description || raw.title,
  provider: raw.provider,
  image: raw.image || raw.thumbnail || '',
  price: raw.price || 0,
  rating: raw.rating || 0,
  available: raw.available ?? true,
  url: raw.url,
  category: raw.category || 'componentes',
  specs: raw.specs || {},
});
