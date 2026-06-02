exports.productDto = (product) => ({
  id: product.id,
  title: product.title,
  description: product.description,
  provider: product.provider,
  image: product.image,
  price: product.price,
  rating: product.rating,
  category: product.category,
  specs: product.specs,
  url: product.url,
});
