export const getProductIdentifier = (product = {}) => {
  if (!product) return ''
  return String(
    product.identifier
    || product._id
    || product.id
    || product.productId
    || product.url
    || `${product.title || product.name || 'producto'}-${product.price || 0}`
  )
}

export const getProductDisplayName = (product = {}) => (
  product.name || product.title || 'Producto'
)

export const normalizeCartItem = (product = {}) => {
  const productId = getProductIdentifier(product)
  const price = Number(product.price) || 0
  const quantity = Math.max(1, Number(product.quantity) || 1)

  return {
    productId,
    identifier: productId,
    name: getProductDisplayName(product),
    title: getProductDisplayName(product),
    price,
    image: product.image || product.thumbnail || '',
    url: product.url && product.url.startsWith('http') ? product.url : '',
    provider: product.provider || 'desconocido',
    category: product.category || '',
    quantity,
  }
}

export const favoriteToProduct = (favorite = {}) => {
  const data = favorite.productData || {}
  return {
    ...data,
    _id: data._id || data.id || favorite.productId,
    id: data.id || data._id || favorite.identifier,
    identifier: favorite.identifier,
    name: data.name || data.title || 'Producto',
    title: data.title || data.name || 'Producto',
    price: data.price || 0,
    image: data.image || '',
    url: data.url || '',
    provider: data.provider || 'desconocido',
    favoriteId: favorite._id,
  }
}
