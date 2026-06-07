import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar, FiExternalLink } from 'react-icons/fi'
import { GlassCard, Badge } from '../common'

export const ProductCard = ({ product, onAddCart, onToggleFavorite, isFavorite }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const externalUrl = product.url && product.url.startsWith('http') ? product.url : null
  const productName = product.name || product.title || 'Producto'
  const productId = product._id || product.id
  const hasExternalId = Boolean(productId)

  const openExternal = () => {
    if (!externalUrl) return
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
  }

  const ContentWrapper = ({ children }) => (
    externalUrl ? (
      <div
        role="link"
        tabIndex={0}
        onClick={openExternal}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openExternal() }}
        className="relative w-full h-48 bg-slate-800 overflow-hidden cursor-pointer"
      >
        {children}
      </div>
    ) : (
      <Link to={`/products/${productId}`} className="relative w-full h-48 bg-slate-800 overflow-hidden">
        {children}
      </Link>
    )
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <GlassCard className="overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <ContentWrapper>
          <img
            src={product.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23263a52%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22Arial%22 font-size=%2216%22%3EImagen%20no%20disponible%3C/text%3E%3C/svg%3E'}
            alt={productName}
            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23263a52%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22Arial%22 font-size=%2216%22%3EImagen%20no%20disponible%3C/text%3E%3C/svg%3E'}}
            className="w-full h-full object-cover hover:scale-110 transition-transform"
          />

          {/* Discount Badge */}
          {product.discount && (
            <Badge variant="danger" className="absolute top-2 right-2">
              -{product.discount}%
            </Badge>
          )}

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3"
          >
            {externalUrl ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  openExternal()
                }}
                className="btn-primary flex items-center gap-2"
              >
                <FiExternalLink /> Ver tienda
              </button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault()
                  onAddCart && onAddCart(product)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <FiShoppingCart /> Agregar
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                onToggleFavorite && onToggleFavorite(productId)
              }}
              className={`btn-icon ${isFavorite ? 'text-danger' : 'text-white'}`}
            >
              <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
          </motion.div>
        </ContentWrapper>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <p className="text-xs text-accent mb-1">{product.category}</p>
            <p className="font-semibold hover:text-accent line-clamp-2">
              {productName}
            </p>
          </div>

          {/* Rating */}
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

          {/* Price */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              {product.originalPrice && (
                <p className="text-xs text-slate-400 line-through">
                  ${product.originalPrice}
                </p>
              )}
              <p className="text-lg font-bold text-gradient">
                ${product.price}
              </p>
            </div>
            {product.stock <= 5 && (
              <Badge variant="warning" className="text-xs">
                Solo {product.stock}
              </Badge>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export const ProductGrid = ({ products = [], loading = false, onAddCart, onToggleFavorite, favorites = [] }) => {
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
        const productId = product._id || product.id || `${product.title}-${index}`
        return (
          <ProductCard
            key={productId}
            product={product}
            onAddCart={onAddCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.includes(productId)}
          />
        )
      })}
    </div>
  )
}
