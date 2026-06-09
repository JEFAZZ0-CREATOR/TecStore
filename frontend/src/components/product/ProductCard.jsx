import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { GlassCard, Badge } from '../common'
import { getProductIdentifier } from '../../utils/product'

export const ProductCard = ({ product, onAddCart, onToggleFavorite, isFavorite }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const externalUrl = product.url && product.url.startsWith('http') ? product.url : null
  const productName = product.name || product.title || 'Producto'
  const productId = getProductIdentifier(product)

  const openExternal = (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (!externalUrl) return
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }

  const handleAddCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddCart) {
      onAddCart(product)
      toast.success('Añadido al carrito')
    }
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavorite) onToggleFavorite(product)
  }

  const ContentWrapper = ({ children }) => (
    externalUrl ? (
      <div className="relative w-full h-48 bg-slate-800 overflow-hidden">
        {children}
      </div>
    ) : (
      <Link to={`/products/${productId}`} className="relative w-full h-48 bg-slate-800 overflow-hidden block">
        {children}
      </Link>
    )
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <GlassCard className="overflow-hidden h-full flex flex-col">
        <ContentWrapper>
          <img
            src={product.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23263a52%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22Arial%22 font-size=%2216%22%3EImagen%20no%20disponible%3C/text%3E%3C/svg%3E'}
            alt={productName}
            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23263a52%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22Arial%22 font-size=%2216%22%3EImagen%20no%20disponible%3C/text%3E%3C/svg%3E' }}
            className="w-full h-full object-cover"
          />

          {product.discount > 0 && (
            <Badge variant="danger" className="absolute top-2 right-2">
              -{product.discount}%
            </Badge>
          )}

          {product.provider && (
            <Badge variant="primary" className="absolute top-2 left-2 text-xs capitalize">
              {product.provider}
            </Badge>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 flex-wrap p-3"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handleAddCart}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <FiShoppingCart /> Carrito
            </motion.button>
            {externalUrl && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={openExternal}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <FiExternalLink /> Tienda
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              className={`btn-icon ${isFavorite ? 'text-danger' : 'text-white'}`}
            >
              <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
          </motion.div>
        </ContentWrapper>

        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <p className="text-xs text-accent mb-1 capitalize">{product.category || product.provider}</p>
            <p className="font-semibold line-clamp-2">{productName}</p>
          </div>

          <div className="flex items-center gap-1 my-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">({product.reviews || 0})</span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div>
              {product.originalPrice && (
                <p className="text-xs text-slate-400 line-through">${product.originalPrice}</p>
              )}
              <p className="text-lg font-bold text-gradient">${product.price}</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export const ProductGrid = ({ products = [], loading = false, onAddCart, onToggleFavorite, favorites = [], isFavoriteFn }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-slate-400">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product, index) => {
        const productId = getProductIdentifier(product) || `product-${index}`
        const isFavorite = isFavoriteFn
          ? isFavoriteFn(product)
          : favorites.includes(productId)

        return (
          <ProductCard
            key={productId}
            product={product}
            onAddCart={onAddCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite}
          />
        )
      })}
    </div>
  )
}
