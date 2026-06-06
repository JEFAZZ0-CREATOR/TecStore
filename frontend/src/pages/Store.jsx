import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import { searchAPI, categoriesAPI } from '../services/api'
import { useCartStore, useFiltersStore } from '../store/store'
import { ProductGrid } from '../components/product/ProductCard'
import { Input, Button } from '../components/common'

export default function Store() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 100000])
  const defaultQuery = 'hardware pc ofertas'
  const { addItem } = useCartStore()
  const { filters, setFilters, sortBy, setSortBy } = useFiltersStore()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const query = searchTerm || defaultQuery
      const filtersPayload = {
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        ...filters,
      }
      const data = await searchAPI.search(query, filtersPayload)
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  useEffect(() => {
    const timer = setTimeout(loadProducts, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, priceRange, filters, sortBy])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient">Tienda</h1>
          <p className="text-slate-400 mt-1">{products.length} productos encontrados</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <FiFilter /> Filtros
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`lg:block ${showFilters ? 'block' : 'hidden'}`}
        >
          <div className="card p-6 space-y-6 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden btn-icon"
              >
                <FiX />
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Buscar</label>
              <Input
                icon={FiSearch}
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Categorías</label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:text-accent">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, category: cat._id })
                        } else {
                          const { category, ...rest } = filters
                          setFilters(rest)
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Rango de Precio</label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-full"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="newest">Más Nuevos</option>
                <option value="rating">Mejor Valorados</option>
              </select>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                setFilters({})
                setSortBy('relevance')
                setSearchTerm('')
                setPriceRange([0, 10000])
              }}
              className="w-full"
            >
              Limpiar Filtros
            </Button>
          </div>
        </motion.aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            loading={loading}
            onAddCart={addItem}
            onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
          />
        </div>
      </div>
    </div>
  )
}
