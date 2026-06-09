import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield, FiExternalLink } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { productsAPI, reviewsAPI } from '../services/api'
import { useCartStore } from '../store/store'
import { useFavorites } from '../hooks/useFavorites'
import { getProductDisplayName } from '../utils/product'
import { GlassCard, Button, LoadingSpinner, Badge } from '../components/common'

export default function ProductDetail() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    loadProduct()
    loadReviews()
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await productsAPI.getById(productId)
      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const data = await reviewsAPI.getByProduct(productId)
      setReviews(Array.isArray(data) ? data : (data?.reviews || []))
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-12">Producto no encontrado</div>
  }

  const productName = getProductDisplayName(product)
  const images = product.images || [product.image].filter(Boolean)
  const displayImages = images.length ? images : ['https://via.placeholder.com/500']
  const favoriteActive = isFavorite(product)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative w-full h-96 bg-slate-800 rounded-xl overflow-hidden">
            <img
              src={displayImages[activeImage] || 'https://via.placeholder.com/500'}
              alt={productName}
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <Badge variant="danger" className="absolute top-4 right-4">
                -{product.discount}%
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {displayImages.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveImage(i)}
                whileHover={{ scale: 1.05 }}
                className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === i ? 'border-accent' : 'border-slate-700'
                }`}
              >
                <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">{productName}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={20}
                    fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                    className="text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-slate-400">({reviews.length} reseñas)</span>
            </div>
          </div>

          <div className="space-y-2 py-4 border-y border-slate-700">
            {product.originalPrice && (
              <p className="text-sm text-slate-400 line-through">
                ${product.originalPrice}
              </p>
            )}
            <p className="text-4xl font-bold text-gradient">
              ${product.price}
            </p>
            {product.provider && (
              <p className="text-sm text-accent capitalize">Proveedor: {product.provider}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Cantidad</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max={99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="input-field w-20 text-center"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                addItem({ ...product, name: productName, title: productName, quantity })
                toast.success('Añadido al carrito')
              }}
            >
              <FiShoppingCart /> Añadir al Carrito
            </Button>

            <Button
              variant="secondary"
              className={`w-full flex items-center justify-center gap-2 ${favoriteActive ? 'text-danger' : ''}`}
              onClick={() => toggleFavorite({ ...product, name: productName, title: productName })}
            >
              <FiHeart fill={favoriteActive ? 'currentColor' : 'none'} />
              {favoriteActive ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
            </Button>

            {product.url && product.url.startsWith('http') && (
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.open(product.url, '_blank', 'noopener,noreferrer')}
              >
                <FiExternalLink /> Ver en tienda externa
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FiTruck className="text-accent" />
              <span>Envío gratis a todo el país</span>
            </div>
            <div className="flex items-center gap-3">
              <FiShield className="text-accent" />
              <span>Garantía oficial de 1 año</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Description & Reviews */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-4">Descripción</h2>
            <p className="text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </GlassCard>
        </div>

        {/* Reviews */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Reseñas</h2>
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="pb-4 border-b border-slate-700 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{review.author}</span>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <FiStar key={i} size={14} fill="currentColor" className="text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-400">{review.comment}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
