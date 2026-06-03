import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiZap, FiClock, FiTrendingDown } from 'react-icons/fi'
import { productsAPI } from '../services/api'
import { useCartStore } from '../store/store'
import { ProductGrid } from '../components/product/ProductCard'
import { GlassCard, Button } from '../components/common'

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      setLoading(true)
      const data = await productsAPI.getAll({ hasDiscount: true, limit: 20 })
      setDeals(data.products || [])
    } catch (error) {
      console.error('Error loading deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalSavings = deals.reduce((sum, product) => {
    const discount = (product.originalPrice - product.price) * product.quantity || 0
    return sum + discount
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-8 md:p-12 bg-gradient-accent"
      >
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <FiZap /> Ofertas Especiales
          </h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Descubre los mejores descuentos en productos tecnológicos
          </p>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <GlassCard className="p-6 text-center">
          <FiZap className="w-12 h-12 mx-auto mb-3 text-accent" />
          <p className="text-slate-400 mb-2">Productos en Oferta</p>
          <p className="text-3xl font-bold text-gradient">{deals.length}</p>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <FiTrendingDown className="w-12 h-12 mx-auto mb-3 text-success" />
          <p className="text-slate-400 mb-2">Ahorro Total</p>
          <p className="text-3xl font-bold text-gradient">${totalSavings.toFixed(2)}</p>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <FiClock className="w-12 h-12 mx-auto mb-3 text-warning" />
          <p className="text-slate-400 mb-2">Duración de Ofertas</p>
          <p className="text-3xl font-bold text-gradient">3 días</p>
        </GlassCard>
      </motion.div>

      {/* Products Grid */}
      <ProductGrid
        products={deals}
        loading={loading}
        onAddCart={addItem}
        onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
      />
    </div>
  )
}
