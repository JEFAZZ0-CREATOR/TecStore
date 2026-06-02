exports.mapToProductDto = (raw) => ({
  id: raw.id,
  title: raw.title,
  description: raw.description,
  provider: raw.provider,
  image: raw.image,
  price: raw.price,
  rating: raw.rating,
  available: raw.available,
  url: raw.url,
  category: raw.category,
  specs: raw.specs,
});
