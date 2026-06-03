import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { GlassCard, Badge } from '../common'

export const ProductCard = ({ product, onAddCart, onToggleFavorite, isFavorite }) => {
  const [isHovered, setIsHovered] = React.useState(false)

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
        <Link to={`/products/${product._id}`} className="relative w-full h-48 bg-slate-800 overflow-hidden">
          <img
            src={product.image || 'https://via.placeholder.com/200x200'}
            alt={product.name}
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
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                onAddCart(product)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <FiShoppingCart /> Agregar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                onToggleFavorite(product._id)
              }}
              className={`btn-icon ${isFavorite ? 'text-danger' : 'text-white'}`}
            >
              <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>
          </motion.div>
        </Link>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <p className="text-xs text-accent mb-1">{product.category}</p>
            <Link to={`/products/${product._id}`} className="font-semibold hover:text-accent line-clamp-2">
              {product.name}
            </Link>
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
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddCart={onAddCart}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.includes(product._id)}
        />
      ))}
    </div>
  )
}
