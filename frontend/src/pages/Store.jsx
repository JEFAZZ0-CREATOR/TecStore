import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiGrid, FiList, FiSliders, FiChevronDown,
  FiStar, FiCheck, FiTag, FiPackage,
} from 'react-icons/fi'
import { searchAPI, categoriesAPI } from '../services/api'
import { useCartStore, useFiltersStore } from '../store/store'
import { useFavorites } from '../hooks/useFavorites'
import { ProductGrid } from '../components/product/ProductCard'
import { Button } from '../components/common'
import { SearchWithSuggestions } from '../components/search/SearchWithSuggestions'

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDERS = [
  { id: 'mercadolibre', label: 'MercadoLibre', color: 'text-yellow-400',  border: 'border-yellow-400/40', bg: 'bg-yellow-400/10' },
  { id: 'cyberpuerta',  label: 'Cyberpuerta',  color: 'text-blue-400',    border: 'border-blue-400/40',   bg: 'bg-blue-400/10'   },
  { id: 'ddtech',       label: 'DDTech',        color: 'text-green-400',   border: 'border-green-400/40',  bg: 'bg-green-400/10'  },
  { id: 'newegg',       label: 'Newegg',        color: 'text-orange-400',  border: 'border-orange-400/40', bg: 'bg-orange-400/10' },
  { id: 'amazon',       label: 'Amazon',        color: 'text-amber-400',   border: 'border-amber-400/40',  bg: 'bg-amber-400/10'  },
]

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Relevancia'       },
  { value: 'price-asc',  label: 'Precio ↑'         },
  { value: 'price-desc', label: 'Precio ↓'         },
  { value: 'newest',     label: 'Más nuevos'        },
  { value: 'rating',     label: 'Mejor valorados'   },
]

const COMPONENT_OPTIONS = [
  'Procesadores', 'Tarjetas de Video', 'Memoria RAM', 'Tarjetas Madre',
  'Almacenamiento', 'Fuentes de Poder', 'Gabinetes', 'Refrigeración',
  'Periféricos', 'Monitores', 'Teclados', 'Mouses', 'SSD', 'Accesorios',
]

// ─── Chip ─────────────────────────────────────────────────────────────────────

const Chip = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/15 text-accent text-xs rounded-full border border-accent/30">
    {children}
    <button type="button" onClick={onRemove} className="hover:text-white transition-colors">
      <FiX size={10} />
    </button>
  </span>
)

// ─── Accordion section ────────────────────────────────────────────────────────

const FilterSection = ({ title, badge = 0, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/8 pb-4 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold hover:text-accent-light transition-colors group"
      >
        <span className="flex items-center gap-2">
          {title}
          {badge > 0 && (
            <span className="bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {badge}
            </span>
          )}
        </span>
        <FiChevronDown
          size={14}
          className={`transition-transform duration-200 text-slate-400 group-hover:text-accent ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Store() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Server-side state
  const [rawProducts, setRawProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(10000)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [totalResults, setTotalResults] = useState(null)
  const [hasMore, setHasMore] = useState(false)

  // Client-side filters
  const [selectedProviders, setSelectedProviders] = useState([])
  const [minRating, setMinRating] = useState(0)
  const [onlyDiscount, setOnlyDiscount] = useState(false)
  const [onlyInStock, setOnlyInStock] = useState(false)

  // UI
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { addItem } = useCartStore()
  const { filters, setFilters, sortBy, setSortBy } = useFiltersStore()
  const { toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearchTerm(q)
  }, [])

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [])

  const loadProducts = async (p = page, pp = perPage) => {
    try {
      setLoading(true)
      const query = searchTerm || 'hardware pc ofertas'
      const res = await searchAPI.search(query, {
        minPrice: priceMin,
        maxPrice: priceMax,
        page: p,
        perPage: pp,
        ...filters,
      })
      const items = Array.isArray(res) ? res : (res.items || [])
      setRawProducts(items)
      setHasMore(res.meta?.hasMore || false)
      setTotalResults(res.meta?.total ?? null)
    } catch {
      setRawProducts([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      setCategories(data.categories || [])
    } catch { /* noop */ }
  }

  const handleSearch = (e) => {
    const val = e.target.value
    setSearchTerm(val)
    setPage(1)
    val ? setSearchParams({ q: val }) : setSearchParams({})
  }

  useEffect(() => {
    const t = setTimeout(() => loadProducts(1), 500)
    return () => clearTimeout(t)
  }, [searchTerm, priceMin, priceMax, filters, sortBy])

  useEffect(() => { loadProducts(page, perPage) }, [page])
  useEffect(() => { setPage(1); loadProducts(1, perPage) }, [perPage])

  // Client-side filtered view
  const displayedProducts = useMemo(() => {
    let r = rawProducts
    if (selectedProviders.length > 0) {
      r = r.filter(p => selectedProviders.includes((p.provider || '').toLowerCase()))
    }
    if (minRating > 0) r = r.filter(p => (p.rating || 0) >= minRating)
    if (onlyDiscount)  r = r.filter(p => (p.discount || 0) > 0)
    if (onlyInStock)   r = r.filter(p => p.available !== false)
    return r
  }, [rawProducts, selectedProviders, minRating, onlyDiscount, onlyInStock])

  // Count of each provider in raw results
  const providerCounts = useMemo(() => {
    const c = {}
    rawProducts.forEach(p => {
      const k = (p.provider || 'otro').toLowerCase()
      c[k] = (c[k] || 0) + 1
    })
    return c
  }, [rawProducts])

  const toggleProvider = (id) =>
    setSelectedProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )

  const clearAllFilters = () => {
    setFilters({})
    setSortBy('relevance')
    setSearchTerm('')
    setPriceMin(0)
    setPriceMax(10000)
    setSelectedProviders([])
    setMinRating(0)
    setOnlyDiscount(false)
    setOnlyInStock(false)
    setPage(1)
    setSearchParams({})
  }

  const removeCategoryFilter = () => {
    const { category, ...rest } = filters
    setFilters(rest)
    setPage(1)
  }

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (priceMin > 0 ? 1 : 0) +
    (priceMax < 10000 ? 1 : 0) +
    (sortBy !== 'relevance' ? 1 : 0) +
    selectedProviders.length +
    (minRating > 0 ? 1 : 0) +
    (onlyDiscount ? 1 : 0) +
    (onlyInStock ? 1 : 0)

  const clientFiltersActive = selectedProviders.length > 0 || minRating > 0 || onlyDiscount || onlyInStock
  const displayCount = totalResults !== null ? totalResults : rawProducts.length

  return (
    <div className="space-y-5">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-5"
        style={{ background: 'linear-gradient(135deg,rgba(109,40,217,.18) 0%,rgba(59,130,246,.12) 50%,rgba(34,211,238,.08) 100%)' }}
      >
        {/* Decorative orb */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(109,40,217,.25),transparent 70%)' }} />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-white leading-none">
              Tienda TecStore
            </h1>
            <p className="text-slate-400 mt-1.5 text-sm">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block" /> Buscando productos…</span>
                : <>
                    <span className="text-white font-semibold">{displayCount.toLocaleString()}</span>
                    {' '}resultado{displayCount !== 1 ? 's' : ''}
                    {searchTerm && <> para <span className="text-accent-light">"{searchTerm}"</span></>}
                  </>
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-white/6 border border-white/12 rounded-xl p-1 gap-0.5">
              <button onClick={() => setViewMode('grid')} title="Cuadrícula"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                <FiGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')} title="Lista"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                <FiList size={14} />
              </button>
            </div>

            {/* Filters button */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                activeFilterCount > 0 || showFilters
                  ? 'bg-accent/15 border-accent/40 text-accent-light'
                  : 'bg-white/6 border-white/12 text-slate-400 hover:text-white hover:bg-white/10'
              }`}>
              <FiSliders size={14} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Active filter chips ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 overflow-hidden"
          >
            <span className="text-xs text-slate-500 font-medium">Filtros activos:</span>

            {filters.category && (
              <Chip onRemove={removeCategoryFilter}>{filters.category}</Chip>
            )}
            {priceMin > 0 && (
              <Chip onRemove={() => { setPriceMin(0); setPage(1) }}>
                Desde ${priceMin.toLocaleString()}
              </Chip>
            )}
            {priceMax < 10000 && (
              <Chip onRemove={() => { setPriceMax(10000); setPage(1) }}>
                Hasta ${priceMax.toLocaleString()}
              </Chip>
            )}
            {selectedProviders.map(id => (
              <Chip key={id} onRemove={() => toggleProvider(id)}>
                {PROVIDERS.find(p => p.id === id)?.label || id}
              </Chip>
            ))}
            {minRating > 0 && (
              <Chip onRemove={() => setMinRating(0)}>{minRating}+ ★</Chip>
            )}
            {onlyDiscount && (
              <Chip onRemove={() => setOnlyDiscount(false)}>Con descuento</Chip>
            )}
            {onlyInStock && (
              <Chip onRemove={() => setOnlyInStock(false)}>En stock</Chip>
            )}
            {sortBy !== 'relevance' && (
              <Chip onRemove={() => setSortBy('relevance')}>
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              </Chip>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              Limpiar todo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-4 gap-6">

        {/* ── Mobile overlay ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* ── Filter sidebar ─────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 w-72 z-40 overflow-y-auto overscroll-contain
            transition-transform duration-300 ease-in-out
            ${showFilters ? 'translate-x-0' : '-translate-x-full'}
            lg:relative lg:inset-auto lg:w-auto lg:bg-transparent lg:border-0
            lg:z-auto lg:overflow-visible lg:translate-x-0 lg:block
          `}
          style={{ background: 'rgba(8,8,22,.98)' }}
        >
          <div className="p-5 lg:p-0">
            <div className="p-4 space-y-4 rounded-2xl border border-white/10 lg:sticky lg:top-6"
              style={{ background: 'linear-gradient(145deg,rgba(18,18,50,.95),rgba(10,10,28,.98))' }}>

              {/* Sidebar header */}
              <div className="flex items-center justify-between pb-1">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <FiSliders size={12} /> Filtros
                </h3>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      Limpiar ({activeFilterCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="btn-icon lg:hidden"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* ── Quick presets ───────────────────────────────────────────── */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-white/8">
                <button
                  type="button"
                  onClick={() => setOnlyDiscount(v => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    onlyDiscount
                      ? 'bg-rose-500/20 border-rose-400/50 text-rose-400'
                      : 'border-white/12 text-slate-500 hover:border-white/25 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FiTag size={11} /> Con descuento
                </button>
                <button
                  type="button"
                  onClick={() => setMinRating(r => r === 4 ? 0 : 4)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    minRating >= 4
                      ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                      : 'border-white/12 text-slate-500 hover:border-white/25 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FiStar size={11} fill={minRating >= 4 ? 'currentColor' : 'none'} /> 4★ o más
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyInStock(v => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    onlyInStock
                      ? 'bg-green-500/20 border-green-400/50 text-green-400'
                      : 'border-white/12 text-slate-500 hover:border-white/25 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FiPackage size={11} /> En stock
                </button>
              </div>

              {/* ── Search ─────────────────────────────────────────────────── */}
              <FilterSection title="Buscar" defaultOpen>
                <SearchWithSuggestions
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Buscar productos..."
                />
              </FilterSection>

              {/* ── Category ───────────────────────────────────────────────── */}
              <FilterSection title="Categoría" badge={filters.category ? 1 : 0} defaultOpen>
                <select
                  value={filters.category || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) {
                      setFilters({ ...filters, category: val })
                    } else {
                      const { category, ...rest } = filters
                      setFilters(rest)
                    }
                    setPage(1)
                  }}
                  className="input-field w-full text-sm mb-3"
                >
                  <option value="">Todos los componentes</option>
                  {COMPONENT_OPTIONS.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>

                {categories.length > 0 && (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                    {categories.map(cat => (
                      <label
                        key={cat._id}
                        className="flex items-center gap-2 cursor-pointer hover:text-accent group py-0.5"
                      >
                        <input
                          type="radio"
                          name="store-category"
                          checked={filters.category === cat.name}
                          onChange={() => {
                            setFilters({ ...filters, category: cat.name })
                            setPage(1)
                          }}
                          className="w-3.5 h-3.5 accent-accent"
                        />
                        <span className="text-xs group-hover:text-accent transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </FilterSection>

              {/* ── Providers ──────────────────────────────────────────────── */}
              <FilterSection title="Proveedor" badge={selectedProviders.length} defaultOpen>
                <div className="space-y-1">
                  {PROVIDERS.map(prov => {
                    const count = providerCounts[prov.id] || 0
                    const selected = selectedProviders.includes(prov.id)
                    return (
                      <label
                        key={prov.id}
                        className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 transition-colors border ${
                          selected
                            ? `${prov.bg} ${prov.border}`
                            : 'border-transparent hover:bg-white/6'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleProvider(prov.id)}
                          className="w-3.5 h-3.5 accent-accent"
                        />
                        <span className={`flex-1 text-xs font-medium ${selected ? prov.color : 'text-slate-300'}`}>
                          {prov.label}
                        </span>
                        {count > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${prov.bg} ${prov.border} ${prov.color}`}>
                            {count}
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </FilterSection>

              {/* ── Minimum rating ─────────────────────────────────────────── */}
              <FilterSection title="Valoración mínima" badge={minRating > 0 ? 1 : 0} defaultOpen>
                <div className="space-y-0.5">
                  {[4, 3, 2, 1].map(stars => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setMinRating(r => r === stars ? 0 : stars)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
                        minRating === stars
                          ? 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/30'
                          : 'hover:bg-white/6 text-slate-400 border border-transparent'
                      }`}
                    >
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={12}
                            fill={i < stars ? 'currentColor' : 'none'}
                            strokeWidth={i < stars ? 0 : 1.5}
                          />
                        ))}
                      </div>
                      <span>y más</span>
                      {minRating === stars && <FiCheck size={11} className="ml-auto text-yellow-400" />}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* ── Price range ─────────────────────────────────────────────── */}
              <FilterSection
                title="Rango de precio"
                badge={(priceMin > 0 || priceMax < 10000) ? 1 : 0}
                defaultOpen
              >
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Mínimo</label>
                      <input
                        type="number" min="0" max="10000"
                        value={priceMin}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(10000, Number(e.target.value)))
                          setPriceMin(Math.min(v, priceMax))
                          setPage(1)
                        }}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Máximo</label>
                      <input
                        type="number" min="0" max="10000"
                        value={priceMax}
                        onChange={(e) => {
                          const v = Math.max(0, Math.min(10000, Number(e.target.value)))
                          setPriceMax(Math.max(v, priceMin))
                          setPage(1)
                        }}
                        className="input-field w-full text-sm"
                      />
                    </div>
                  </div>

                  {/* Dual range sliders */}
                  <div className="relative pt-1">
                    <div className="relative h-1.5 bg-slate-700 rounded-full">
                      <div
                        className="absolute h-full bg-accent rounded-full"
                        style={{
                          left: `${(priceMin / 10000) * 100}%`,
                          right: `${100 - (priceMax / 10000) * 100}%`,
                        }}
                      />
                    </div>
                    <input
                      type="range" min="0" max="10000"
                      value={priceMin}
                      onChange={(e) => {
                        setPriceMin(Math.min(Number(e.target.value), priceMax))
                        setPage(1)
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
                    />
                  </div>
                  <div className="relative">
                    <div className="relative h-1.5 bg-slate-700 rounded-full">
                      <div
                        className="absolute h-full bg-accent/50 rounded-full"
                        style={{ right: 0, width: `${100 - (priceMax / 10000) * 100}%` }}
                      />
                    </div>
                    <input
                      type="range" min="0" max="10000"
                      value={priceMax}
                      onChange={(e) => {
                        setPriceMax(Math.max(Number(e.target.value), priceMin))
                        setPage(1)
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-accent">${priceMin.toLocaleString()}</span>
                    <span className="text-accent">${priceMax.toLocaleString()}</span>
                  </div>
                </div>
              </FilterSection>

              {/* ── Extra options ───────────────────────────────────────────── */}
              <FilterSection
                title="Opciones"
                badge={(onlyDiscount ? 1 : 0) + (onlyInStock ? 1 : 0)}
                defaultOpen={false}
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-2 hover:bg-white/6 transition-colors group">
                    <input
                      type="checkbox"
                      checked={onlyDiscount}
                      onChange={(e) => setOnlyDiscount(e.target.checked)}
                      className="w-3.5 h-3.5 accent-accent"
                    />
                    <FiTag size={13} className="text-rose-400" />
                    <span className="text-xs group-hover:text-white transition-colors">
                      Solo con descuento
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-2 hover:bg-white/6 transition-colors group">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-3.5 h-3.5 accent-accent"
                    />
                    <FiPackage size={13} className="text-green-400" />
                    <span className="text-xs group-hover:text-white transition-colors">
                      Solo en stock
                    </span>
                  </label>
                </div>
              </FilterSection>

              {/* ── Sort ────────────────────────────────────────────────────── */}
              <FilterSection title="Ordenar por" badge={sortBy !== 'relevance' ? 1 : 0} defaultOpen>
                <div className="space-y-0.5">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs transition-colors ${
                        sortBy === opt.value
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : 'hover:bg-white/6 text-slate-400 border border-transparent'
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <FiCheck size={11} />}
                    </button>
                  ))}
                </div>
              </FilterSection>

            </div>
          </div>
        </aside>

        {/* ── Products area ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-3">

          {/* Sort pills + per-page row */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto flex-1 pb-0.5">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs flex-shrink-0 font-medium transition-all border ${
                    sortBy === opt.value
                      ? 'bg-accent/20 border-accent/50 text-accent-light shadow-[0_0_10px_rgba(109,40,217,0.25)]'
                      : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-white hover:bg-white/5'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-slate-600">Mostrar</span>
              <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                className="text-xs py-1.5 px-2.5 rounded-xl bg-white/5 border border-white/10 text-white
                           focus:outline-none focus:border-accent/40 transition-colors">
                <option value={12}>12</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Local-filter notice */}
          {clientFiltersActive && displayedProducts.length !== rawProducts.length && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-slate-500 mb-3 bg-white/4 px-3 py-2 rounded-xl border border-white/8"
            >
              Mostrando{' '}
              <span className="text-white font-semibold">{displayedProducts.length}</span>
              {' '}de{' '}
              <span className="text-white font-semibold">{rawProducts.length}</span>
              {' '}productos tras aplicar filtros locales
            </motion.p>
          )}

          <ProductGrid
            products={displayedProducts}
            loading={loading}
            onAddCart={addItem}
            onToggleFavorite={toggleFavorite}
            isFavoriteFn={isFavorite}
            viewMode={viewMode}
          />

          {/* Pagination */}
          {!loading && rawProducts.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors border border-white/10"
              >
                «
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/8 transition-colors border border-white/10"
              >
                ‹ Anterior
              </button>

              {(() => {
                const delta = 2
                const left = Math.max(1, page - delta)
                const right = page + delta
                const pages = Array.from({ length: right - left + 1 }, (_, i) => left + i)
                return (
                  <>
                    {left > 1 && (
                      <>
                        <button
                          onClick={() => setPage(1)}
                          className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/8 border border-white/10"
                        >
                          1
                        </button>
                        {left > 2 && <span className="px-1 text-slate-500 text-sm">…</span>}
                      </>
                    )}
                    {pages.map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          p === page
                            ? 'bg-accent border-accent text-white font-bold shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                            : 'border-white/10 hover:bg-white/8 hover:border-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    {hasMore && (
                      <>
                        <span className="px-1 text-slate-500 text-sm">…</span>
                        <button
                          onClick={() => setPage(page + delta + 1)}
                          className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/8 border border-white/10"
                        >
                          {page + delta + 1}
                        </button>
                      </>
                    )}
                  </>
                )
              })()}

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Siguiente ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
