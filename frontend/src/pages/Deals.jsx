import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiZap, FiClock, FiTrendingDown, FiGrid, FiList,
  FiStar, FiShoppingCart, FiHeart, FiExternalLink,
  FiRefreshCw, FiTag, FiPercent,
} from 'react-icons/fi'
import { searchAPI, productsAPI } from '../services/api'
import { useCartStore } from '../store/store'
import { useFavorites } from '../hooks/useFavorites'
import { ProductGrid } from '../components/product/ProductCard'
import { GlassCard, Badge } from '../components/common'
import toast from 'react-hot-toast'

// ─── Countdown to end of day ──────────────────────────────────────────────────

const useCountdown = () => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const diff = Math.max(0, end - now)
      setTime({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      })
    }
    calc()
    const t = setInterval(calc, 1_000)
    return () => clearInterval(t)
  }, [])
  return time
}

const pad = (n) => String(n).padStart(2, '0')

// ─── Deal queries for external providers ─────────────────────────────────────

const DEAL_QUERIES = ['hardware oferta descuento', 'gpu cpu oferta', 'gaming rebaja']

const DISCOUNT_TABS = [
  { label: 'Todos',  min: 0  },
  { label: '10%+',   min: 10 },
  { label: '20%+',   min: 20 },
  { label: '30%+',   min: 30 },
  { label: '50%+',   min: 50 },
]

const SORT_OPTIONS = [
  { value: 'discount-desc', label: '% Descuento ↓' },
  { value: 'savings-desc',  label: 'Mayor ahorro'   },
  { value: 'price-asc',     label: 'Menor precio'   },
  { value: 'rating-desc',   label: 'Mejor valorados' },
]

// ─── Featured deal card ───────────────────────────────────────────────────────

const FeaturedDeal = ({ product, onAddCart, onToggleFavorite, isFavorite }) => {
  if (!product) return null
  const name = product.title || product.name || 'Producto'
  const savings = product.originalPrice
    ? (product.originalPrice - product.price).toFixed(2)
    : null
  const externalUrl = product.url?.startsWith('http') ? product.url : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <GlassCard className="overflow-hidden border border-accent/30">
        <div className="flex items-stretch gap-0 flex-col md:flex-row">
          {/* Image */}
          <div className="relative md:w-64 h-52 md:h-auto flex-shrink-0 bg-slate-800">
            <img
              src={product.image || ''}
              alt={name}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 md:bg-gradient-to-l" />

            {/* Big discount badge */}
            <div className="absolute top-3 left-3 bg-danger text-white font-black text-2xl px-3 py-1.5 rounded-xl shadow-lg shadow-danger/40 rotate-[-2deg]">
              -{product.discount}%
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-400/30">
                  <FiZap size={10} /> MEJOR OFERTA
                </span>
                {product.provider && (
                  <span className="text-xs text-slate-400 capitalize">{product.provider}</span>
                )}
                {product.category && (
                  <span className="text-xs text-accent">{product.category}</span>
                )}
              </div>

              <h3 className="text-xl font-bold leading-snug mb-3 line-clamp-2">{name}</h3>

              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                  {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                    <span key={k} className="text-xs text-slate-400">
                      <span className="text-slate-500">{k}: </span>{v}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                {product.rating > 0 && (
                  <span className="text-sm text-slate-400">{product.rating.toFixed(1)}</span>
                )}
              </div>
            </div>

            {/* Price + actions */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                {product.originalPrice && (
                  <p className="text-slate-400 line-through text-sm">
                    ${product.originalPrice.toLocaleString()}
                  </p>
                )}
                <p className="text-3xl font-black text-gradient">
                  ${product.price?.toLocaleString?.() ?? product.price}
                </p>
                {savings && Number(savings) > 0 && (
                  <p className="text-green-400 text-sm font-semibold mt-0.5">
                    Ahorrás ${savings}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleFavorite?.(product)}
                  className={`btn-icon ${isFavorite ? 'text-danger' : 'text-slate-400'}`}
                >
                  <FiHeart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </motion.button>
                {externalUrl && (
                  <motion.a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiExternalLink size={14} /> Ver en tienda
                  </motion.a>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onAddCart?.(product)
                    toast.success('Añadido al carrito')
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiShoppingCart size={14} /> Agregar al carrito
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Deals() {
  const [allProducts, setAllProducts]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [discountMin, setDiscountMin]   = useState(0)
  const [sortBy, setSortBy]             = useState('discount-desc')
  const [viewMode, setViewMode]         = useState('grid')
  const { addItem }                     = useCartStore()
  const { toggleFavorite, isFavorite }  = useFavorites()
  const countdown                       = useCountdown()

  const loadDeals = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true)

      // 1. Local DB deals (always available, fast)
      const localRaw = await productsAPI.getAll({ hasDiscount: 'true', sort: 'discount', limit: 50 })
      const localItems = Array.isArray(localRaw) ? localRaw : []

      // 2. External provider deals (live data, may be slower)
      const externalResults = await Promise.allSettled(
        DEAL_QUERIES.map(q => searchAPI.search(q, { perPage: 30 }))
      )

      // Merge + deduplicate
      const seen = new Set()
      const merged = []

      const addItem_ = (p) => {
        const key = p.id || p._id || p.externalId || `${p.title}-${p.price}`
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(p)
        }
      }

      localItems.forEach(addItem_)
      externalResults.forEach(r => {
        if (r.status !== 'fulfilled') return
        const items = Array.isArray(r.value) ? r.value : (r.value.items || [])
        items.forEach(addItem_)
      })

      setAllProducts(merged)
    } catch (err) {
      console.error('Error loading deals:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadDeals() }, [])

  // Only show products with discount > 0
  const dealsOnly = useMemo(
    () => allProducts.filter(p => (p.discount || 0) > 0),
    [allProducts]
  )

  // Discount tab filter
  const filtered = useMemo(
    () => dealsOnly.filter(p => (p.discount || 0) >= discountMin),
    [dealsOnly, discountMin]
  )

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortBy) {
      case 'discount-desc':
        return arr.sort((a, b) => (b.discount || 0) - (a.discount || 0))
      case 'savings-desc':
        return arr.sort((a, b) =>
          ((b.originalPrice || b.price) - b.price) -
          ((a.originalPrice || a.price) - a.price)
        )
      case 'price-asc':
        return arr.sort((a, b) => a.price - b.price)
      case 'rating-desc':
        return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      default:
        return arr
    }
  }, [filtered, sortBy])

  // Stats
  const featuredDeal = useMemo(
    () => dealsOnly.length > 0
      ? [...dealsOnly].sort((a, b) => (b.discount || 0) - (a.discount || 0))[0]
      : null,
    [dealsOnly]
  )

  const totalSavings = useMemo(
    () => dealsOnly.reduce((s, p) => s + Math.max(0, (p.originalPrice || p.price) - p.price), 0),
    [dealsOnly]
  )

  const maxDiscount = useMemo(
    () => dealsOnly.reduce((m, p) => Math.max(m, p.discount || 0), 0),
    [dealsOnly]
  )

  const avgDiscount = useMemo(() => {
    if (!dealsOnly.length) return 0
    return Math.round(dealsOnly.reduce((s, p) => s + (p.discount || 0), 0) / dealsOnly.length)
  }, [dealsOnly])

  return (
    <div className="space-y-8">

      {/* ── Hero banner ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 md:p-12"
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full border border-white/20 uppercase tracking-wider">
                <FiZap size={11} /> Tiempo limitado
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 flex items-center gap-3">
              <FiZap className="text-yellow-400" />
              Ofertas Flash
            </h1>
            <p className="text-white/75 text-lg max-w-lg">
              Los mejores descuentos en hardware y tecnología gaming. Solo por hoy.
            </p>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5 justify-center">
              <FiClock size={12} /> Termina en
            </p>
            <div className="flex items-center gap-2">
              {[
                { val: countdown.h, label: 'h' },
                { val: countdown.m, label: 'm' },
                { val: countdown.s, label: 's' },
              ].map(({ val, label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="text-white/40 text-xl font-bold">:</span>}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-3 py-2 min-w-[52px] text-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={val}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-2xl font-black text-white tabular-nums"
                      >
                        {pad(val)}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-white/50 text-xs uppercase">{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Stats row ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            icon: <FiTag className="text-accent" size={22} />,
            label: 'Productos en oferta',
            value: loading ? '—' : dealsOnly.length,
            sub: 'disponibles ahora',
          },
          {
            icon: <FiPercent className="text-yellow-400" size={22} />,
            label: 'Descuento máximo',
            value: loading ? '—' : `${maxDiscount}%`,
            sub: `promedio ${avgDiscount}%`,
          },
          {
            icon: <FiTrendingDown className="text-green-400" size={22} />,
            label: 'Ahorro acumulado',
            value: loading ? '—' : `$${totalSavings.toFixed(0)}`,
            sub: 'en total de ofertas',
          },
          {
            icon: <FiClock className="text-pink-400" size={22} />,
            label: 'Actualización',
            value: 'En vivo',
            sub: 'datos en tiempo real',
          },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5 text-center">
            <div className="flex justify-center mb-2">{stat.icon}</div>
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gradient mb-0.5">{stat.value}</p>
            <p className="text-xs text-slate-600">{stat.sub}</p>
          </GlassCard>
        ))}
      </motion.div>

      {/* ── Featured deal ────────────────────────────────────────────────────── */}
      {!loading && featuredDeal && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <FiZap className="text-yellow-400" size={14} /> Oferta destacada
          </h2>
          <FeaturedDeal
            product={featuredDeal}
            onAddCart={addItem}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite(featuredDeal)}
          />
        </div>
      )}

      {/* ── Filters + sort toolbar ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        {/* Discount tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DISCOUNT_TABS.map(tab => (
            <button
              key={tab.min}
              type="button"
              onClick={() => setDiscountMin(tab.min)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all border ${
                discountMin === tab.min
                  ? 'bg-accent border-accent text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-xs py-1.5 px-2"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}
              title="Cuadrícula"
            >
              <FiGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}
              title="Lista"
            >
              <FiList size={14} />
            </button>
          </div>

          {/* Refresh */}
          <motion.button
            type="button"
            onClick={() => loadDeals(true)}
            disabled={refreshing}
            animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            className="btn-icon disabled:opacity-50"
            title="Actualizar ofertas"
          >
            <FiRefreshCw size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-500">
          Mostrando{' '}
          <span className="text-white font-semibold">{sorted.length}</span>
          {' '}oferta{sorted.length !== 1 ? 's' : ''}
          {discountMin > 0 && <> con al menos <span className="text-accent font-semibold">{discountMin}% de descuento</span></>}
        </p>
      )}

      {/* ── Product grid ─────────────────────────────────────────────────────── */}
      {!loading && sorted.length === 0 && !refreshing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-6xl mb-4">🏷️</div>
          <p className="text-xl font-semibold text-slate-300">
            {discountMin > 0
              ? `No hay ofertas con ${discountMin}%+ de descuento ahora`
              : 'No se encontraron ofertas en este momento'}
          </p>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            Intenta actualizar o ajusta el filtro de descuento mínimo
          </p>
          <div className="flex gap-3">
            {discountMin > 0 && (
              <button
                type="button"
                onClick={() => setDiscountMin(0)}
                className="btn-secondary"
              >
                Ver todas las ofertas
              </button>
            )}
            <button
              type="button"
              onClick={() => loadDeals(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiRefreshCw size={14} /> Actualizar
            </button>
          </div>
        </motion.div>
      ) : (
        <ProductGrid
          products={sorted}
          loading={loading}
          onAddCart={addItem}
          onToggleFavorite={toggleFavorite}
          isFavoriteFn={isFavorite}
          viewMode={viewMode}
        />
      )}
    </div>
  )
}
