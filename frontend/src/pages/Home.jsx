import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTag, FiZap, FiPackage, FiSearch } from 'react-icons/fi'
import { searchAPI } from '../services/api'
import { useCartStore } from '../store/store'
import { useFavorites } from '../hooks/useFavorites'
import { ProductGrid } from '../components/product/ProductCard'
import { GlassCard, Button, Input } from '../components/common'

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
  const [defaultProducts, setDefaultProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavorites()
  const navigate = useNavigate()
  const defaultQuery = 'componentes pc en oferta'

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await searchAPI.search(defaultQuery)
      setDefaultProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchText = (value) => {
    setSearchTerm(value)
  }

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([])
      setSearchMessage('')
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const data = await searchAPI.search(searchTerm)
        if (data.length === 0) {
          setSearchMessage('No se encontraron componentes/hardware relevantes para esa búsqueda.')
        } else {
          setSearchMessage('')
        }
        setSearchResults(data)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setSearchMessage('Error al buscar productos. Intenta con términos como CPU, GPU, RAM, teclado o mouse.')
      } finally {
        setSearchLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchTerm])

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
        className="relative h-auto rounded-2xl overflow-hidden bg-slate-900 p-8"
      >
        <div className="absolute inset-0 bg-gradient-accent opacity-20"></div>
        <div className="relative text-center max-w-4xl mx-auto">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.h1
              variants={item}
              className="text-4xl md:text-6xl font-bold text-gradient mb-4"
            >
              TecStore
            </motion.h1>
            <motion.p
              variants={item}
              className="text-lg md:text-xl text-slate-300 mb-6"
            >
              Busca en tiempo real solo componentes y hardware de PC desde Mercado Libre y Amazon.
            </motion.p>
            <motion.div variants={item} className="max-w-3xl mx-auto w-full">
              <div className="relative">
                <Input
                  icon={FiSearch}
                  value={searchTerm}
                  onChange={(e) => handleSearchText(e.target.value)}
                  placeholder="Busca CPU, GPU, RAM, teclado, mouse, gabinete..."
                  className="w-full py-4 text-lg rounded-2xl bg-slate-900/90 border-slate-700"
                />
              </div>
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

      {/* Search Results or Latest Products */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <FiTrendingUp className="text-accent" />
              {searchTerm ? 'Resultados de Búsqueda' : 'Ofertas Reales de Hardware'}
            </h2>
            {!searchTerm && (
              <p className="text-sm text-slate-400 mt-1">
                Mostrando los mejores componentes y ofertas reales desde Mercado Libre y Amazon.
              </p>
            )}
          </div>
          {!searchTerm && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/store')}>
              Ver Todos en Tienda
            </Button>
          )}
        </div>

        {searchTerm ? (
          <>
            {searchMessage && (
              <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900 p-4 text-slate-300">
                {searchMessage}
              </div>
            )}
            <ProductGrid
              products={searchResults}
              loading={searchLoading}
              onAddCart={addItem}
              onToggleFavorite={toggleFavorite}
              isFavoriteFn={isFavorite}
            />
          </>
        ) : (
          <ProductGrid
            products={defaultProducts}
            loading={loading}
            onAddCart={addItem}
            onToggleFavorite={toggleFavorite}
            isFavoriteFn={isFavorite}
          />
        )}
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
