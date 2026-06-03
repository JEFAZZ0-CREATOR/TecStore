import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTag, FiZap, FiPackage } from 'react-icons/fi'
import { productsAPI } from '../services/api'
import { useCartStore } from '../store/store'
import { ProductGrid } from '../components/product/ProductCard'
import { GlassCard, Button } from '../components/common'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productsAPI.getAll({ limit: 12 })
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: FiZap,
      title: 'Rápido y Eficiente',
      description: 'Envíos rápidos a toda el país',
    },
    {
      icon: FiTag,
      title: 'Mejores Precios',
      description: 'Garantizamos los precios más competitivos',
    },
    {
      icon: FiPackage,
      title: 'Productos Originales',
      description: 'Solo marcas confiables y autorizadas',
    },
    {
      icon: FiTrendingUp,
      title: 'Seguimiento de Precios',
      description: 'Recibe alertas cuando bajan los precios',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-96 rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-accent opacity-20"></div>
        <div className="relative h-full flex items-center justify-center text-center p-6">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl font-bold text-gradient mb-4"
            >
              TecStore
            </motion.h1>
            <motion.p
              variants={item}
              className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
            >
              Descubre los mejores productos tecnológicos con los precios más competitivos del mercado
            </motion.p>
            <motion.div variants={item} className="flex gap-4 justify-center flex-wrap">
              <Button variant="primary" size="lg">
                Explorar Productos
              </Button>
              <Button variant="secondary" size="lg">
                Ver Ofertas
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-4 gap-4"
      >
        {features.map(({ icon: Icon, title, description }) => (
          <motion.div key={title} variants={item}>
            <GlassCard className="p-6 text-center hover:shadow-neon-lg">
              <Icon className="w-12 h-12 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-400">{description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.section>

      {/* Latest Products */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <FiTrendingUp className="text-accent" />
            Productos Destacados
          </h2>
          <Button variant="secondary" size="sm">
            Ver Todos
          </Button>
        </div>
        <ProductGrid
          products={products}
          loading={loading}
          onAddCart={addItem}
          onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
        />
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-accent rounded-2xl p-12 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            ¿Aún no tienes cuenta?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Regístrate ahora y obtén 10% de descuento en tu primera compra
          </p>
          <Button variant="secondary" size="lg">
            Crear Cuenta
          </Button>
        </div>
      </motion.section>
    </div>
  )
}
