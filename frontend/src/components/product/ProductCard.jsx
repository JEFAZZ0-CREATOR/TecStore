import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { GlassCard, Badge } from '../common'
import { getProductIdentifier } from '../../utils/product'

const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23263a52%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22Arial%22 font-size=%2216%22%3EImagen%20no%20disponible%3C/text%3E%3C/svg%3E'

const StarRating = ({ rating = 0, size = 14 }) => (
  <div className="flex text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        size={size}
        fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
        strokeWidth={i < Math.floor(rating) ? 0 : 1.5}
      />
    ))}
  </div>
)

export const ProductCard = ({ product, onAddCart, onToggleFavorite, isFavorite, variant = 'grid' }) => {
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

  // ── List variant ──────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.005 }}
      >
        <GlassCard className="flex gap-4 p-3 hover:border-accent/30 transition-colors">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-28 h-24 bg-slate-800 rounded-lg overflow-hidden">
            <img
              src={product.image || PLACEHOLDER_IMG}
              alt={productName}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <Badge variant="danger" className="absolute top-1 right-1 text-xs">
                -{product.discount}%
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              {product.provider && (
                <Badge variant="primary" className="text-xs capitalize flex-shrink-0">
                  {product.provider}
                </Badge>
              )}
              {product.category && (
                <span className="text-xs text-accent capitalize">{product.category}</span>
              )}
            </div>

            {externalUrl ? (
              <p
                onClick={openExternal}
                className="font-semibold text-sm leading-snug mt-1 line-clamp-2 cursor-pointer hover:text-accent transition-colors"
              >
                {productName}
              </p>
            ) : (
              <Link to={`/products/${productId}`}>
                <p className="font-semibold text-sm leading-snug mt-1 line-clamp-2 hover:text-accent transition-colors">
                  {productName}
                </p>
              </Link>
            )}

            {/* Specs preview */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                  <span key={k} className="text-xs text-slate-400">
                    <span className="text-slate-500">{k}: </span>{v}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating rating={product.rating} size={12} />
              {(product.reviews > 0) && (
                <span className="text-xs text-slate-500">({product.reviews})</span>
              )}
            </div>
          </div>

          {/* Price + Actions */}
          <div className="flex-shrink-0 flex flex-col items-end justify-between min-w-[110px]">
            <div className="text-right">
              {product.originalPrice && (
                <p className="text-xs text-slate-500 line-through">${product.originalPrice}</p>
              )}
              <p className="text-xl font-bold text-gradient">${product.price?.toLocaleString?.() ?? product.price}</p>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-end">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                className={`btn-icon ${isFavorite ? 'text-danger' : 'text-slate-400 hover:text-white'}`}
              >
                <FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </motion.button>
              {externalUrl && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={openExternal}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-2.5"
                >
                  <FiExternalLink size={12} /> Ver
                </motion.button>
              )}
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleAddCart}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-2.5"
              >
                <FiShoppingCart size={12} /> Agregar
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    )
  }

  // ── Grid variant (default) ────────────────────────────────────────────────
  const ContentWrapper = ({ children }) =>
    externalUrl ? (
      <div className="relative w-full h-48 bg-slate-800 overflow-hidden">
        {children}
      </div>
    ) : (
      <Link to={`/products/${productId}`} className="relative w-full h-48 bg-slate-800 overflow-hidden block">
        {children}
      </Link>
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
            src={product.image || PLACEHOLDER_IMG}
            alt={productName}
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG }}
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
              <FiShoppingCart size={14} /> Carrito
            </motion.button>
            {externalUrl && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={openExternal}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <FiExternalLink size={14} /> Tienda
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
            <p className="font-semibold line-clamp-2 text-sm leading-snug">{productName}</p>
          </div>

          <div className="flex items-center gap-1.5 my-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-slate-400">
              {product.rating ? product.rating.toFixed(1) : '—'}
              {product.reviews > 0 && ` (${product.reviews})`}
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div>
              {product.originalPrice && (
                <p className="text-xs text-slate-400 line-through">${product.originalPrice}</p>
              )}
              <p className="text-lg font-bold text-gradient">
                ${product.price?.toLocaleString?.() ?? product.price}
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              className={`btn-icon ${isFavorite ? 'text-danger' : 'text-slate-400 hover:text-white'}`}
            >
              <FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export const ProductGrid = ({
  products = [],
  loading = false,
  onAddCart,
  onToggleFavorite,
  favorites = [],
  isFavoriteFn,
  viewMode = 'grid',
}) => {
  if (loading) {
    return (
      <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}>
        {[...Array(viewMode === 'list' ? 6 : 8)].map((_, i) => (
          <div key={i} className={`card animate-pulse ${viewMode === 'list' ? 'h-28' : 'h-80'}`} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-slate-300 font-semibold text-lg">No se encontraron productos</p>
        <p className="text-slate-500 text-sm mt-1">
          Intenta con otros términos o ajusta los filtros
        </p>
      </div>
    )
  }

  return (
    <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}>
      {products.map((product, index) => {
        const productId = getProductIdentifier(product) || `product-${index}`
        const isProductFavorite = isFavoriteFn
          ? isFavoriteFn(product)
          : favorites.includes(productId)

        return (
          <ProductCard
            key={productId}
            product={product}
            onAddCart={onAddCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isProductFavorite}
            variant={viewMode}
          />
        )
      })}
    </div>
  )
}
