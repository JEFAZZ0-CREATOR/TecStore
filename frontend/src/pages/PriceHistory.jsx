import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiTrendingUp, FiTrendingDown, FiCalendar, FiActivity,
  FiArrowUp, FiArrowDown, FiMinus, FiAlertCircle,
} from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { priceHistoryAPI } from '../services/api'
import { GlassCard, LoadingSpinner, EmptyState, Badge } from '../components/common'

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_RANGES = [
  { label: '7D',   days: 7  },
  { label: '30D',  days: 30 },
  { label: '90D',  days: 90 },
  { label: 'Todo', days: 0  },
]

// ─── Mini sparkline for product list ─────────────────────────────────────────

const Sparkline = ({ prices = [], width = 72, height = 28 }) => {
  if (prices.length < 2) return <div style={{ width, height }} />
  const values = prices.map(p => p.price)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const rng = hi - lo || 1
  const trend = values[values.length - 1] < values[0] ? '#10b981'
    : values[values.length - 1] > values[0] ? '#ef4444' : '#64748b'
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * width
    const y = height - 2 - ((v - lo) / rng) * (height - 4)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible flex-shrink-0">
      <polyline points={pts} fill="none" stroke={trend} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Full area price chart with tooltip ──────────────────────────────────────

const PriceChart = ({ prices = [] }) => {
  const [hoverIdx, setHoverIdx] = useState(null)

  if (!prices.length) {
    return (
      <div className="h-52 flex flex-col items-center justify-center text-slate-500 gap-2">
        <FiActivity size={32} className="opacity-30" />
        <p className="text-sm">Sin registros en este rango</p>
      </div>
    )
  }

  if (prices.length === 1) {
    return (
      <div className="h-52 flex flex-col items-center justify-center gap-1">
        <p className="text-3xl font-black text-gradient">${prices[0].price.toFixed(2)}</p>
        <p className="text-slate-500 text-sm">Único registro disponible</p>
        <p className="text-slate-600 text-xs">
          {format(new Date(prices[0].recordedAt), "d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>
    )
  }

  const W = 560
  const H = 220
  const PAD = { top: 24, right: 24, bottom: 42, left: 64 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const values = prices.map(p => p.price)
  const dates  = prices.map(p => new Date(p.recordedAt))
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const pad    = (rawMax - rawMin) * 0.12 || rawMin * 0.05 || 1
  const yMin   = rawMin - pad
  const yMax   = rawMax + pad
  const yRange = yMax - yMin

  const xOf = (i) => PAD.left + (i / Math.max(values.length - 1, 1)) * cW
  const yOf = (v) => PAD.top  + cH - ((v - yMin) / yRange) * cH

  const linePts = values.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')
  const areaPts = `${xOf(0)},${PAD.top + cH} ${linePts} ${xOf(values.length - 1)},${PAD.top + cH}`

  const minIdx  = values.indexOf(rawMin)
  const maxIdx  = values.indexOf(rawMax)
  const falling = values[values.length - 1] <= values[0]
  const lineColor = falling ? '#10b981' : '#3b82f6'
  const lineColor2 = falling ? '#34d399' : '#60a5fa'

  // Y-axis: 5 ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => rawMin + ((rawMax - rawMin) / 4) * i)

  // X-axis: smart labels
  const step = Math.max(1, Math.floor(values.length / 4))
  const xIdxs = [...new Set([0, step, step * 2, step * 3, values.length - 1].filter(i => i < values.length))]

  const sliceW = cW / Math.max(values.length, 1)

  return (
    <div className="relative select-none" onMouseLeave={() => setHoverIdx(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: H }}>
        <defs>
          <linearGradient id="phAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="phLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={lineColor}  />
            <stop offset="100%" stopColor={lineColor2} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines + Y labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={yOf(tick)}
              x2={PAD.left + cW} y2={yOf(tick)}
              stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4"
            />
            <text x={PAD.left - 8} y={yOf(tick)} fill="#64748b" fontSize="11"
              textAnchor="end" dominantBaseline="middle">
              ${tick.toFixed(0)}
            </text>
          </g>
        ))}

        {/* X-axis baseline */}
        <line
          x1={PAD.left} y1={PAD.top + cH}
          x2={PAD.left + cW} y2={PAD.top + cH}
          stroke="#334155" strokeWidth="1"
        />

        {/* X-axis labels */}
        {xIdxs.map(i => (
          <text key={i} x={xOf(i)} y={H - 6} fill="#64748b" fontSize="11" textAnchor="middle">
            {format(dates[i], 'dd/MM', { locale: es })}
          </text>
        ))}

        {/* Hover vertical guide */}
        {hoverIdx !== null && (
          <line
            x1={xOf(hoverIdx)} y1={PAD.top}
            x2={xOf(hoverIdx)} y2={PAD.top + cH}
            stroke="#475569" strokeWidth="1" strokeDasharray="4,4"
          />
        )}

        {/* Area fill */}
        <polygon points={areaPts} fill="url(#phAreaFill)" />

        {/* Line */}
        <polyline
          points={linePts} fill="none" stroke="url(#phLine)"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Min marker */}
        <circle cx={xOf(minIdx)} cy={yOf(rawMin)} r="5.5" fill="#10b981" stroke="#0f172a" strokeWidth="2.5" />
        <text x={xOf(minIdx)} y={yOf(rawMin) - 11} fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="600">
          ${rawMin.toFixed(0)}
        </text>

        {/* Max marker */}
        {minIdx !== maxIdx && (
          <>
            <circle cx={xOf(maxIdx)} cy={yOf(rawMax)} r="5.5" fill="#ef4444" stroke="#0f172a" strokeWidth="2.5" />
            <text x={xOf(maxIdx)} y={yOf(rawMax) - 11} fill="#ef4444" fontSize="11" textAnchor="middle" fontWeight="600">
              ${rawMax.toFixed(0)}
            </text>
          </>
        )}

        {/* Hover dot */}
        {hoverIdx !== null && (
          <circle
            cx={xOf(hoverIdx)} cy={yOf(values[hoverIdx])} r="5"
            fill={lineColor} stroke="#0f172a" strokeWidth="2.5"
          />
        )}

        {/* Invisible hover capture */}
        {values.map((_, i) => (
          <rect
            key={i}
            x={xOf(i) - sliceW / 2} y={PAD.top}
            width={sliceW} height={cH}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onMouseEnter={() => setHoverIdx(i)}
          />
        ))}
      </svg>

      {/* Floating tooltip */}
      <AnimatePresence>
        {hoverIdx !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute pointer-events-none z-20 bg-slate-900 border border-slate-600 rounded-xl shadow-2xl px-3.5 py-2.5 min-w-[140px]"
            style={{
              left: `${(PAD.left / W + (hoverIdx / Math.max(values.length - 1, 1)) * (cW / W)) * 100}%`,
              top:  `${(yOf(values[hoverIdx]) / H) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <p className="text-base font-black text-white">${values[hoverIdx].toFixed(2)}</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {format(dates[hoverIdx], "d MMM yyyy", { locale: es })}
            </p>
            <p className="text-slate-500 text-xs">
              {format(dates[hoverIdx], 'HH:mm')}
            </p>
            {hoverIdx > 0 && (() => {
              const diff = values[hoverIdx] - values[hoverIdx - 1]
              const pct  = (diff / values[hoverIdx - 1] * 100).toFixed(1)
              return (
                <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${
                  diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-slate-500'
                }`}>
                  {diff < 0 ? <FiArrowDown size={11} /> : diff > 0 ? <FiArrowUp size={11} /> : <FiMinus size={11} />}
                  {diff > 0 ? '+' : ''}${diff.toFixed(2)} ({diff > 0 ? '+' : ''}{pct}%)
                </p>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Trend percent badge ──────────────────────────────────────────────────────

const TrendPct = ({ first, last }) => {
  if (!first || !last) return null
  const diff = last - first
  const pct  = (diff / first * 100).toFixed(1)
  if (diff < 0) return (
    <span className="inline-flex items-center gap-0.5 text-green-400 text-xs font-semibold">
      <FiArrowDown size={11} />{Math.abs(pct)}%
    </span>
  )
  if (diff > 0) return (
    <span className="inline-flex items-center gap-0.5 text-red-400 text-xs font-semibold">
      <FiArrowUp size={11} />{pct}%
    </span>
  )
  return <span className="inline-flex items-center gap-0.5 text-slate-500 text-xs"><FiMinus size={11} />0%</span>
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PriceHistory() {
  const [summary,       setSummary]       = useState(null)
  const [selected,      setSelected]      = useState(null)
  const [detailHistory, setDetailHistory] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [timeRange,     setTimeRange]     = useState(30)
  const [tableSort,     setTableSort]     = useState('date-desc')

  useEffect(() => { loadSummary() }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await priceHistoryAPI.getSummary()
      setSummary(data)
      if (data?.products?.length) selectProduct(data.products[0])
    } catch (err) {
      console.error('Price history error:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectProduct = async (product) => {
    setSelected(product)
    try {
      setDetailLoading(true)
      const data = await priceHistoryAPI.getHistory(product.identifier)
      setDetailHistory(data?.history || product.prices || [])
    } catch {
      setDetailHistory(product.prices || [])
    } finally {
      setDetailLoading(false)
    }
  }

  const rawPrices = useMemo(() => {
    const list = detailHistory.length ? detailHistory : (selected?.prices || [])
    return [...list].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
  }, [detailHistory, selected])

  const chartPrices = useMemo(() => {
    if (!timeRange) return rawPrices
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - timeRange)
    const f = rawPrices.filter(p => new Date(p.recordedAt) >= cutoff)
    return f.length >= 2 ? f : rawPrices
  }, [rawPrices, timeRange])

  // Table rows sorted
  const allRows = useMemo(() => {
    const rows = []
    const products = summary?.products || []
    products.forEach(product => {
      const sorted = [...(product.prices || [])].sort(
        (a, b) => new Date(a.recordedAt) - new Date(b.recordedAt)
      )
      sorted.forEach((row, idx) => {
        const prev = idx > 0 ? sorted[idx - 1].price : null
        const diff = prev !== null ? row.price - prev : null
        const pct  = prev ? (diff / prev * 100) : null
        rows.push({ product, row, diff, pct, idx })
      })
    })
    // sort by date desc by default
    if (tableSort === 'date-desc') rows.sort((a, b) => new Date(b.row.recordedAt) - new Date(a.row.recordedAt))
    else if (tableSort === 'date-asc') rows.sort((a, b) => new Date(a.row.recordedAt) - new Date(b.row.recordedAt))
    else if (tableSort === 'price-desc') rows.sort((a, b) => b.row.price - a.row.price)
    else if (tableSort === 'price-asc') rows.sort((a, b) => a.row.price - b.row.price)
    else if (tableSort === 'change-desc') rows.sort((a, b) => (b.diff || 0) - (a.diff || 0))
    else if (tableSort === 'change-asc') rows.sort((a, b) => (a.diff || 0) - (b.diff || 0))
    return rows
  }, [summary, tableSort])

  const products = summary?.products || []
  const stats    = summary?.stats   || {}

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <EmptyState
          icon={FiActivity}
          title="Sin historial de precios"
          description="Añade productos a favoritos o realiza compras para empezar a rastrear precios automáticamente"
        />
      </div>
    )
  }

  const selPrices = [...(selected?.prices || [])].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
  const selFirst  = selPrices[0]?.price
  const selLast   = selPrices[selPrices.length - 1]?.price
  const selChange = selFirst && selLast ? selLast - selFirst : null

  const biggestDrop = products.reduce((best, p) => {
    if (!p.prices?.length || !p.minPrice || !p.maxPrice) return best
    const drop = ((p.maxPrice - p.minPrice) / p.maxPrice * 100)
    return drop > (best?.drop || 0) ? { ...p, drop } : best
  }, null)

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
          <FiActivity /> Historial de Precios
        </h1>
        <p className="text-slate-400 mt-1">
          Monitoreo en tiempo real desde múltiples proveedores
        </p>
      </div>

      {/* ── Global stats row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Precio más bajo registrado',
            value: stats.globalMin != null ? `$${stats.globalMin.toFixed(2)}` : '—',
            icon: <FiTrendingDown size={20} />, color: 'text-green-400',
          },
          {
            label: 'Precio más alto registrado',
            value: stats.globalMax != null ? `$${stats.globalMax.toFixed(2)}` : '—',
            icon: <FiTrendingUp size={20} />, color: 'text-red-400',
          },
          {
            label: 'Precio promedio global',
            value: stats.globalAvg != null ? `$${stats.globalAvg.toFixed(2)}` : '—',
            icon: <FiActivity size={20} />, color: 'text-accent',
          },
          {
            label: 'Productos rastreados',
            value: stats.trackedProducts || products.length,
            icon: <FiCalendar size={20} />, color: 'text-purple-400',
            sub: biggestDrop ? `Mayor caída: ${biggestDrop.drop.toFixed(0)}%` : undefined,
          },
        ].map((s, i) => (
          <GlassCard key={i} className="p-5">
            <div className={`flex items-center gap-2 mb-2 ${s.color}`}>
              {s.icon}
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            {s.sub && <p className="text-xs text-slate-500 mt-1">{s.sub}</p>}
          </GlassCard>
        ))}
      </div>

      {/* ── Main: product list + chart ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Product list */}
        <GlassCard className="p-4 max-h-[38rem] overflow-y-auto">
          <h2 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-3 px-1">
            Productos ({products.length})
          </h2>
          <div className="space-y-2">
            {products.map((product) => {
              const pp     = [...(product.prices || [])].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
              const pFirst = pp[0]?.price
              const pLast  = product.currentPrice
              const isSel  = selected?.identifier === product.identifier
              return (
                <button
                  key={product.identifier}
                  type="button"
                  onClick={() => selectProduct(product)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSel
                      ? 'border-accent bg-accent/10 shadow-[0_0_14px_rgba(99,102,241,0.2)]'
                      : 'border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-2 justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2 leading-snug">
                        {product.title}
                      </p>
                      <p className="text-xs text-slate-500 capitalize mt-0.5">{product.provider}</p>
                    </div>
                    {pp.length >= 2 && <Sparkline prices={pp} />}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-accent font-bold text-sm">
                      ${product.currentPrice?.toFixed(2) || '—'}
                    </p>
                    <TrendPct first={pFirst} last={pLast} />
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-600">
                      {pp.length} registro{pp.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-slate-600">
                      {product.minPrice != null ? `$${product.minPrice.toFixed(0)}` : '—'} –{' '}
                      {product.maxPrice != null ? `$${product.maxPrice.toFixed(0)}` : '—'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* Chart panel */}
        <GlassCard className="p-6 lg:col-span-2">
          {selected ? (
            <>
              {/* Product info */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold line-clamp-2">{selected.title}</h2>
                  <p className="text-sm text-slate-400 capitalize mt-0.5">{selected.provider}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gradient">
                    ${selected.currentPrice?.toFixed(2) || '—'}
                  </p>
                  {selChange !== null && (
                    <p className={`text-sm font-semibold flex items-center justify-end gap-1 mt-0.5 ${
                      selChange < 0 ? 'text-green-400' : selChange > 0 ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {selChange < 0 ? <FiArrowDown size={13} /> : selChange > 0 ? <FiArrowUp size={13} /> : <FiMinus size={13} />}
                      {selChange > 0 ? '+' : ''}${selChange.toFixed(2)} desde el inicio
                    </p>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.minPrice != null && (
                  <Badge variant="success">Mín: ${selected.minPrice.toFixed(2)}</Badge>
                )}
                {selected.maxPrice != null && (
                  <Badge variant="danger">Máx: ${selected.maxPrice.toFixed(2)}</Badge>
                )}
                {selected.change != null && selected.change !== 0 && (
                  <Badge variant={selected.change < 0 ? 'success' : 'danger'}>
                    Último cambio: {selected.change > 0 ? '+' : ''}${selected.change.toFixed(2)}
                  </Badge>
                )}
              </div>

              {/* Time range tabs */}
              <div className="flex items-center gap-1.5 mb-5">
                <span className="text-xs text-slate-500 mr-1">Rango:</span>
                {TIME_RANGES.map(({ label, days }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setTimeRange(days)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      timeRange === days
                        ? 'bg-accent border-accent text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <span className="text-xs text-slate-600 ml-1">
                  {chartPrices.length} punto{chartPrices.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Chart */}
              {detailLoading ? (
                <div className="flex justify-center py-16"><LoadingSpinner /></div>
              ) : (
                <PriceChart prices={chartPrices} />
              )}

              {/* Chart legend */}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 justify-end">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Precio mínimo
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Precio máximo
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 border-t-2 border-dashed border-slate-500" /> Hover
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-72">
              <div className="text-center text-slate-500">
                <FiActivity size={42} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm">Selecciona un producto de la lista</p>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── Price changes table ───────────────────────────────────────────────── */}
      <GlassCard className="overflow-hidden">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold">Registro de cambios</h2>
            <p className="text-xs text-slate-500 mt-0.5">{allRows.length} registros totales</p>
          </div>
          <select
            value={tableSort}
            onChange={e => setTableSort(e.target.value)}
            className="input-field text-xs py-1.5 px-2"
          >
            <option value="date-desc">Más reciente primero</option>
            <option value="date-asc">Más antiguo primero</option>
            <option value="price-desc">Precio ↓</option>
            <option value="price-asc">Precio ↑</option>
            <option value="change-desc">Mayor subida</option>
            <option value="change-asc">Mayor caída</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50">
                {['Producto', 'Proveedor', 'Precio', 'Cambio $', 'Cambio %', 'Fecha'].map(h => (
                  <th key={h}
                    className="text-left py-3 px-5 text-xs font-semibold uppercase tracking-wider text-slate-400 first:text-left last:text-left text-right"
                    style={{ textAlign: h === 'Producto' || h === 'Proveedor' || h === 'Fecha' ? 'left' : 'right' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRows.map(({ product, row, diff, pct, idx }, ri) => (
                <tr
                  key={`${product.identifier}-${ri}`}
                  className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-5">
                    <p className="font-medium line-clamp-1 max-w-[200px]">{product.title}</p>
                  </td>
                  <td className="py-3 px-5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 capitalize border border-slate-600">
                      {product.provider}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right font-semibold">
                    ${row.price?.toFixed(2)}
                  </td>
                  <td className={`py-3 px-5 text-right font-medium ${
                    diff == null ? '' : diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {diff == null ? (
                      <span className="text-slate-600">—</span>
                    ) : (
                      <span className="flex items-center justify-end gap-1">
                        {diff < 0 ? <FiArrowDown size={12} /> : diff > 0 ? <FiArrowUp size={12} /> : <FiMinus size={12} />}
                        ${Math.abs(diff).toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className={`py-3 px-5 text-right font-medium ${
                    diff == null ? '' : diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {pct != null
                      ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-3 px-5 text-slate-400">
                    {format(new Date(row.recordedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!allRows.length && (
            <div className="py-12 text-center text-slate-500">
              <FiAlertCircle size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay registros disponibles</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
