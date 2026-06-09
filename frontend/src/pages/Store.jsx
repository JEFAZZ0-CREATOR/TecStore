import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import { searchAPI, categoriesAPI } from '../services/api'
import { useCartStore, useFiltersStore } from '../store/store'
import { useFavorites } from '../hooks/useFavorites'
import { ProductGrid } from '../components/product/ProductCard'
import { Input, Button } from '../components/common'

export default function Store() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(10000)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const perPage = 25
  const defaultQuery = 'hardware pc ofertas'
  const componentOptions = [
    'Procesadores',
    'Tarjetas de Video',
    'Memoria RAM',
    'Tarjetas Madre',
    'Almacenamiento',
    'Fuentes de Poder',
    'Gabinetes',
    'Refrigeración',
    'Periféricos',
    'Monitores',
    'Teclados',
    'Mouses',
    'SSD',
    'Accesorios',
  ]
  const { addItem } = useCartStore()
  const { filters, setFilters, sortBy, setSortBy } = useFiltersStore()
  const { toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  const loadProducts = async (newPage = page) => {
    try {
      setLoading(true)
      const query = searchTerm || defaultQuery
      const filtersPayload = {
        minPrice: priceMin,
        maxPrice: priceMax,
        page: newPage,
        perPage,
        ...filters,
      }
      const res = await searchAPI.search(query, filtersPayload)
      const items = Array.isArray(res) ? res : (res.items || [])
      setProducts(items)
      setHasMore(res.meta?.hasMore || false)
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
    setPage(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(1), 500)
    return () => clearTimeout(timer)
  }, [searchTerm, priceMin, priceMax, filters, sortBy])

  useEffect(() => {
    // load products when page changes
    loadProducts(page)
  }, [page])

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
          <p className="text-slate-400 mt-1">Página {page} — {products.length} productos</p>
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
                className="rounded-2xl bg-slate-900/90"
              />
            </div>

            {/* Component Type */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Filtrar por componente</label>
              <select
                value={filters.category || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    setFilters({ ...filters, category: value })
                  } else {
                    const { category, ...rest } = filters
                    setFilters(rest)
                  }
                  setPage(1)
                }}
                className="input-field w-full"
              >
                <option value="">Todos los componentes</option>
                {componentOptions.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Categorías</label>
              <div className="space-y-2 max-h-40 overflow-auto pr-2">
                {categories.map((cat) => {
                  const checked = filters.category === cat._id || filters.category === cat.name
                  return (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:text-accent">
                      <input
                        type="radio"
                        name="store-category"
                        checked={checked}
                        onChange={() => {
                          setFilters({ ...filters, category: cat.name })
                          setPage(1)
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-semibold mb-3 block">Rango de Precio</label>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 w-20">Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={priceMin}
                    onChange={(e) => {
                      const min = Math.max(0, Math.min(10000, Number(e.target.value)))
                      setPriceMin(Math.min(min, priceMax))
                      setPage(1)
                    }}
                    className="input-field w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 w-20">Máximo</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={priceMax}
                    onChange={(e) => {
                      const max = Math.max(0, Math.min(10000, Number(e.target.value)))
                      setPriceMax(Math.max(priceMin, max))
                      setPage(1)
                    }}
                    className="input-field w-full"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceMin}
                  onChange={(e) => {
                    const min = Math.min(Number(e.target.value), priceMax)
                    setPriceMin(min)
                    setPage(1)
                  }}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceMax}
                  onChange={(e) => {
                    const max = Math.max(Number(e.target.value), priceMin)
                    setPriceMax(max)
                    setPage(1)
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>${priceMin}</span>
                  <span>${priceMax}</span>
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
                setPriceMin(0)
                setPriceMax(10000)
                setPage(1)
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
            onToggleFavorite={toggleFavorite}
            isFavoriteFn={isFavorite}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-icon"
            >
              &lt;
            </button>

            {Array.from({ length: 8 }).map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${p === page ? 'border-2 border-accent' : 'text-gray-400'}`}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="btn-icon"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
