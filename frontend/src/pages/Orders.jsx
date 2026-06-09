import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiCalendar, FiDollarSign, FiChevronDown, FiChevronUp,
  FiExternalLink, FiShoppingBag, FiTrendingUp, FiClock, FiGlobe, FiPieChart,
  FiSearch, FiX, FiSliders, FiDownload, FiCheckCircle,
} from 'react-icons/fi'
import { format, formatDistanceToNow, startOfWeek, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { purchasesAPI } from '../services/api'
import { GlassCard, LoadingSpinner, EmptyState, Badge } from '../components/common'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

const PERIOD_PRESETS = [
  { label: 'Hoy',        key: 'today'  },
  { label: 'Esta semana',key: 'week'   },
  { label: 'Este mes',   key: 'month'  },
  { label: 'Todo',       key: 'all'    },
]

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Más reciente primero' },
  { value: 'date-asc', label: 'Más antiguo primero' },
  { value: 'amount-desc', label: 'Mayor monto primero' },
  { value: 'amount-asc', label: 'Menor monto primero' },
  { value: 'items-desc', label: 'Más productos primero' },
  { value: 'items-asc', label: 'Menos productos primero' },
]

const CumulativeChart = ({ purchases = [] }) => {
  const [hoverIdx, setHoverIdx] = useState(null)

  const points = useMemo(() => {
    if (!purchases.length) return []
    const sorted = [...purchases].sort((a, b) => new Date(a.purchasedAt) - new Date(b.purchasedAt))
    let cum = 0
    return sorted.map(p => {
      cum += p.subtotal || 0
      return { date: new Date(p.purchasedAt), cum, label: format(new Date(p.purchasedAt), 'dd/MM', { locale: es }) }
    })
  }, [purchases])

  if (points.length < 2) {
    return <p className="text-slate-400 text-sm text-center py-8">Se necesitan al menos 2 sesiones</p>
  }

  const W = 540
  const H = 180
  const PAD = { top: 20, right: 20, bottom: 36, left: 64 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const maxVal = points[points.length - 1].cum
  const xOf = (i) => PAD.left + (i / (points.length - 1)) * cW
  const yOf = (v) => PAD.top + cH - (v / maxVal) * cH

  const linePts = points.map((p, i) => `${xOf(i)},${yOf(p.cum)}`).join(' ')
  const areaPts = `${xOf(0)},${PAD.top + cH} ${linePts} ${xOf(points.length - 1)},${PAD.top + cH}`

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal]
  const step = Math.max(1, Math.floor(points.length / 4))
  const xIdxs = [...new Set([0, step, step * 2, step * 3, points.length - 1])]

  return (
    <div className="relative select-none" onMouseLeave={() => setHoverIdx(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: H }}>
        <defs>
          <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yOf(t)} x2={PAD.left + cW} y2={yOf(t)} stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
            <text x={PAD.left - 8} y={yOf(t)} fill="#64748b" fontSize="11" textAnchor="end" dominantBaseline="middle">
              ${t.toFixed(0)}
            </text>
          </g>
        ))}

        <line x1={PAD.left} y1={PAD.top + cH} x2={PAD.left + cW} y2={PAD.top + cH} stroke="#334155" strokeWidth="1" />

        {xIdxs.filter(i => i < points.length).map(i => (
          <text key={i} x={xOf(i)} y={H - 4} fill="#64748b" fontSize="11" textAnchor="middle">{points[i].label}</text>
        ))}

        {hoverIdx !== null && (
          <line x1={xOf(hoverIdx)} y1={PAD.top} x2={xOf(hoverIdx)} y2={PAD.top + cH}
            stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
        )}

        <polygon points={areaPts} fill="url(#cumFill)" />
        <polyline points={linePts} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {hoverIdx !== null && (
          <circle cx={xOf(hoverIdx)} cy={yOf(points[hoverIdx].cum)} r="4.5"
            fill="#8b5cf6" stroke="#0f172a" strokeWidth="2.5" />
        )}

        {points.map((_, i) => (
          <rect key={i}
            x={xOf(i) - cW / points.length / 2} y={PAD.top}
            width={cW / points.length} height={cH}
            fill="transparent" style={{ cursor: 'crosshair' }}
            onMouseEnter={() => setHoverIdx(i)}
          />
        ))}
      </svg>

      <AnimatePresence>
        {hoverIdx !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute pointer-events-none z-20 bg-slate-900 border border-slate-600 rounded-xl shadow-2xl px-3.5 py-2.5"
            style={{
              left: `${(PAD.left / W + (hoverIdx / (points.length - 1)) * (cW / W)) * 100}%`,
              top:  `${(yOf(points[hoverIdx].cum) / H) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <p className="text-base font-black text-purple-400">${points[hoverIdx].cum.toFixed(2)}</p>
            <p className="text-slate-400 text-xs mt-0.5">acumulado</p>
            <p className="text-slate-500 text-xs">
              {format(points[hoverIdx].date, "d MMM yyyy HH:mm", { locale: es })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const BarChart = ({ data, valueKey = 'amount', labelKey = 'month', color = '#3b82f6', height = 160 }) => {
  if (!data?.length) {
    return <p className="text-slate-400 text-sm text-center py-8">Sin datos para graficar</p>
  }
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item) => {
        const value = item[valueKey]
        const barHeight = Math.max(12, (value / max) * (height - 40))
        return (
          <div key={item[labelKey]} className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 truncate w-full text-center">{valueKey === 'amount' ? `$${value}` : value}</span>
            <div className="w-full rounded-t-lg transition-all shadow-neon" style={{ height: barHeight, background: `linear-gradient(180deg, ${color}, ${color}66)` }} />
            <span className="text-[10px] text-slate-500 truncate w-full text-center">{item[labelKey]}</span>
          </div>
        )
      })}
    </div>
  )
}

const PieChart = ({ data = [] }) => {
  if (!data.length) return <p className="text-slate-400 text-sm text-center py-8">Sin datos</p>

  const total = data.reduce((sum, d) => sum + d.amount, 0) || 1
  let cumulative = 0
  const slices = data.map((item, index) => {
    const pct = item.amount / total
    const start = cumulative * 360
    cumulative += pct
    const end = cumulative * 360
    const color = CHART_COLORS[index % CHART_COLORS.length]
    return { ...item, pct, start, end, color }
  })

  const polar = (angle, radius = 50) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: 60 + radius * Math.cos(rad), y: 60 + radius * Math.sin(rad) }
  }

  const arc = (start, end, radius = 50) => {
    const s = polar(start, radius)
    const e = polar(end, radius)
    const large = end - start > 180 ? 1 : 0
    return `M 60 60 L ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y} Z`
  }

  const single = slices.length === 1

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative">
        <svg viewBox="0 0 120 120" className="w-44 h-44 drop-shadow-neon">
          {single ? (
            <>
              <circle cx="60" cy="60" r="50" fill={slices[0].color} opacity="0.9" />
              <circle cx="60" cy="60" r="28" fill="#0f172a" />
            </>
          ) : (
            slices.map((slice) => (
              <path key={slice.provider} d={arc(slice.start, slice.end)} fill={slice.color} opacity="0.92" />
            ))
          )}
          {!single && <circle cx="60" cy="60" r="22" fill="#0f172a" />}
          <text x="60" y="56" textAnchor="middle" fill="#94a3b8" fontSize="8">Total</text>
          <text x="60" y="68" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">${total.toFixed(0)}</text>
        </svg>
      </div>
      <div className="flex-1 space-y-3 w-full">
        {slices.map((slice) => (
          <div key={slice.provider} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold capitalize truncate">{slice.provider}</p>
              <p className="text-xs text-slate-400">${slice.amount.toFixed(2)}</p>
            </div>
            <span className="text-accent font-bold">{(slice.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ActivityCalendar = ({ data = [] }) => {
  if (!data.length) return <p className="text-slate-400 text-sm">Sin actividad registrada</p>

  const level = (count) => {
    if (!count) return 'bg-slate-800/80'
    if (count === 1) return 'bg-emerald-900/80'
    if (count === 2) return 'bg-emerald-700/90'
    if (count <= 4) return 'bg-emerald-500'
    return 'bg-emerald-400 shadow-neon'
  }

  const weeks = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} sesión(es) · $${day.amount}`}
                className={`w-3.5 h-3.5 rounded-sm ${level(day.count)} border border-slate-700/50`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Menos</span>
        <div className="flex gap-1">
          {['bg-slate-800/80', 'bg-emerald-900/80', 'bg-emerald-700/90', 'bg-emerald-500', 'bg-emerald-400'].map((c) => (
            <span key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>Más compras</span>
      </div>
      <p className="text-xs text-slate-400">Últimos 90 días · intensidad = sesiones por día</p>
    </div>
  )
}

export default function Orders() {
  const [purchases, setPurchases] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [toast, setToast] = useState(null)
  const [activePeriod, setActivePeriod] = useState('all')

  // Filter state
  const [searchText, setSearchText] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [selectedProviders, setSelectedProviders] = useState([])
  const [sortValue, setSortValue] = useState('date-desc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { loadData() }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const applyPeriod = useCallback((key) => {
    setActivePeriod(key)
    const now = new Date()
    if (key === 'today') {
      const d = format(now, 'yyyy-MM-dd')
      setDateFrom(d); setDateTo(d)
    } else if (key === 'week') {
      setDateFrom(format(startOfWeek(now, { locale: es }), 'yyyy-MM-dd'))
      setDateTo(format(now, 'yyyy-MM-dd'))
    } else if (key === 'month') {
      setDateFrom(format(startOfMonth(now), 'yyyy-MM-dd'))
      setDateTo(format(now, 'yyyy-MM-dd'))
    } else {
      setDateFrom(''); setDateTo('')
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [purchaseList, purchaseStats] = await Promise.all([
        purchasesAPI.getAll(),
        purchasesAPI.getStats(),
      ])
      setPurchases(Array.isArray(purchaseList) ? purchaseList : [])
      setStats(purchaseStats)
    } catch (error) {
      console.error('Error loading purchase history:', error)
    } finally {
      setLoading(false)
    }
  }

  const allProviders = useMemo(() =>
    [...new Set(purchases.flatMap(p => p.providers || []))].sort()
  , [purchases])

  const filteredPurchases = useMemo(() => {
    let result = [...purchases]

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      result = result.filter(p =>
        p.sessionId?.toLowerCase().includes(q) ||
        p.providers?.some(pr => pr.toLowerCase().includes(q)) ||
        p.items?.some(item => item.title?.toLowerCase().includes(q))
      )
    }

    if (dateFrom) {
      result = result.filter(p => new Date(p.purchasedAt) >= new Date(dateFrom))
    }
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      result = result.filter(p => new Date(p.purchasedAt) <= end)
    }

    if (amountMin !== '') result = result.filter(p => p.subtotal >= Number(amountMin))
    if (amountMax !== '') result = result.filter(p => p.subtotal <= Number(amountMax))

    if (selectedProviders.length > 0) {
      result = result.filter(p => p.providers?.some(pr => selectedProviders.includes(pr)))
    }

    const [sortField, sortOrder] = sortValue.split('-')
    result.sort((a, b) => {
      const aVal = sortField === 'date'
        ? new Date(a.purchasedAt).getTime()
        : sortField === 'amount' ? a.subtotal : a.itemCount
      const bVal = sortField === 'date'
        ? new Date(b.purchasedAt).getTime()
        : sortField === 'amount' ? b.subtotal : b.itemCount
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  }, [purchases, searchText, dateFrom, dateTo, amountMin, amountMax, selectedProviders, sortValue])

  const activeFilterCount = useMemo(() => [
    searchText.trim(), dateFrom, dateTo, amountMin, amountMax, ...selectedProviders,
  ].filter(Boolean).length, [searchText, dateFrom, dateTo, amountMin, amountMax, selectedProviders])

  const filteredTotal = useMemo(() =>
    filteredPurchases.reduce((sum, p) => sum + (p.subtotal || 0), 0)
  , [filteredPurchases])

  const exportCSV = useCallback(() => {
    const BOM = '﻿'
    const header = ['Sesión', 'Fecha', 'Hora', 'Proveedores', 'Productos', 'Total ($)']
    const rows = filteredPurchases.map(p => [
      `#${p.sessionId?.slice(0, 8).toUpperCase()}`,
      format(new Date(p.purchasedAt), 'dd/MM/yyyy', { locale: es }),
      format(new Date(p.purchasedAt), 'HH:mm:ss'),
      (p.providers || []).join(' | '),
      p.itemCount,
      p.subtotal?.toFixed(2),
    ])
    const csv = BOM + [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `historial_compras_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    showToast(`CSV exportado: ${filteredPurchases.length} sesiones`)
  }, [filteredPurchases, showToast])

  const clearAllFilters = () => {
    setSearchText('')
    setDateFrom('')
    setDateTo('')
    setAmountMin('')
    setAmountMax('')
    setSelectedProviders([])
    setSortValue('date-desc')
    setActivePeriod('all')
  }

  const toggleProvider = (provider) =>
    setSelectedProviders(prev =>
      prev.includes(provider) ? prev.filter(p => p !== provider) : [...prev, provider]
    )

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><LoadingSpinner size="lg" /></div>
  }

  if (purchases.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <EmptyState
          icon={FiPackage}
          title="Sin historial de compras"
          description="Añade productos al carrito y usa «Abrir todos los sitios» para registrar tu primera sesión"
          action={<a href="/cart" className="btn-primary">Ir al carrito</a>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-slate-800 border border-emerald-500/50 text-emerald-400 rounded-xl shadow-2xl px-4 py-3 text-sm font-medium"
          >
            <FiCheckCircle size={16} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-4xl font-bold text-gradient">Historial de Compras</h1>
        <p className="text-slate-400 mt-1">Reportes, gráficas y registro detallado de cada sesión</p>
      </div>

      {stats && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FiDollarSign, label: 'Total estimado', value: `$${stats.totalSpent?.toFixed(2)}`, color: 'text-accent' },
              { icon: FiShoppingBag, label: 'Sesiones', value: stats.totalSessions, color: 'text-success' },
              { icon: FiPackage, label: 'Productos', value: stats.totalItems, color: 'text-warning' },
              { icon: FiTrendingUp, label: 'Promedio / sesión', value: `$${stats.averagePerSession?.toFixed(2)}`, color: 'text-accent-light' },
            ].map(({ icon: Icon, label, value, color }) => (
              <GlassCard key={label} className="p-5">
                <div className={`flex items-center gap-3 mb-2 ${color}`}>
                  <Icon size={22} />
                  <span className="text-sm text-slate-400">{label}</span>
                </div>
                <p className="text-3xl font-bold">{value}</p>
              </GlassCard>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiPieChart className="text-accent" /> Distribución por proveedor
              </h2>
              <PieChart data={stats.providerSeries} />
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-accent" /> Gasto por mes
              </h2>
              <BarChart data={stats.monthlySeries} labelKey="month" valueKey="amount" />
            </GlassCard>

            <GlassCard className="p-6 lg:col-span-2">
              <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                <FiTrendingUp className="text-purple-400" /> Gasto acumulado
              </h2>
              <p className="text-xs text-slate-500 mb-4">Evolución del total invertido en el tiempo</p>
              <CumulativeChart purchases={purchases} />
            </GlassCard>

            <GlassCard className="p-6 lg:col-span-2">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiCalendar className="text-accent" /> Calendario de actividad
              </h2>
              <ActivityCalendar data={stats.calendarActivity} />
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiCalendar className="text-accent" /> Día de la semana
              </h2>
              <BarChart data={stats.weekdaySeries} labelKey="day" valueKey="count" color="#10b981" height={140} />
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiGlobe className="text-accent" /> Top productos
              </h2>
              {(stats.topProductSeries || []).length ? (
                <div className="space-y-3">
                  {stats.topProductSeries.map((item, i) => (
                    <div key={item.title} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40">
                      <span className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                        <p className="text-xs text-slate-400 capitalize">{item.provider} · {item.quantity} uds.</p>
                      </div>
                      <span className="font-bold text-gradient">${item.total}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Sin productos destacados aún</p>
              )}
            </GlassCard>
          </div>
        </>
      )}

      {/* ── Registro detallado con filtros ── */}
      <div className="space-y-4">

        {/* Encabezado: título + contador + ordenar + botón filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Registro detallado</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {filteredPurchases.length === purchases.length
                ? `${purchases.length} sesión${purchases.length !== 1 ? 'es' : ''} · $${filteredTotal.toFixed(2)} total`
                : (
                  <span>
                    <span className="text-accent font-semibold">{filteredPurchases.length}</span>
                    {' de '}{purchases.length} sesiones · ${filteredTotal.toFixed(2)} filtrado
                  </span>
                )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortValue}
              onChange={e => setSortValue(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={exportCSV}
              title="Exportar a CSV"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:border-emerald-500/60 hover:text-emerald-400 transition-all"
            >
              <FiDownload size={15} /> CSV
            </button>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FiSliders size={15} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-white text-[11px] flex items-center justify-center font-bold shadow">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Period quick-filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Período:</span>
          {PERIOD_PRESETS.map(({ label, key }) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPeriod(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activePeriod === key
                  ? 'bg-accent border-accent text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Barra de búsqueda — siempre visible */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre de producto, proveedor o ID de sesión..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-11 pr-10 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Panel de filtros colapsable */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <GlassCard className="p-5 space-y-5">

                {/* Fecha y monto */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Desde</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hasta</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto mínimo ($)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={amountMin}
                      onChange={e => setAmountMin(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto máximo ($)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Sin límite"
                      value={amountMax}
                      onChange={e => setAmountMax(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
                    />
                  </div>
                </div>

                {/* Chips de proveedor */}
                {allProviders.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proveedor</label>
                    <div className="flex flex-wrap gap-2">
                      {allProviders.map(provider => (
                        <button
                          key={provider}
                          onClick={() => toggleProvider(provider)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                            selectedProviders.includes(provider)
                              ? 'bg-accent text-white border-accent shadow-neon'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-accent/60 hover:text-accent'
                          }`}
                        >
                          {provider}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pie del panel */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500">
                    {activeFilterCount > 0
                      ? `${activeFilterCount} filtro${activeFilterCount !== 1 ? 's' : ''} activo${activeFilterCount !== 1 ? 's' : ''}`
                      : 'Ningún filtro aplicado'}
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <FiX size={13} /> Limpiar todos
                    </button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chips de filtros activos (cuando el panel está cerrado) */}
        <AnimatePresence>
          {activeFilterCount > 0 && !showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex flex-wrap gap-2 items-center"
            >
              <span className="text-xs text-slate-500 mr-1">Filtros activos:</span>

              {searchText.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
                  <FiSearch size={11} />
                  &ldquo;{searchText}&rdquo;
                  <button onClick={() => setSearchText('')} className="ml-1 hover:text-white"><FiX size={11} /></button>
                </span>
              )}
              {dateFrom && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
                  <FiCalendar size={11} /> Desde {dateFrom}
                  <button onClick={() => setDateFrom('')} className="ml-1 hover:text-white"><FiX size={11} /></button>
                </span>
              )}
              {dateTo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
                  <FiCalendar size={11} /> Hasta {dateTo}
                  <button onClick={() => setDateTo('')} className="ml-1 hover:text-white"><FiX size={11} /></button>
                </span>
              )}
              {amountMin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
                  <FiDollarSign size={11} /> Mín ${amountMin}
                  <button onClick={() => setAmountMin('')} className="ml-1 hover:text-white"><FiX size={11} /></button>
                </span>
              )}
              {amountMax && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium">
                  <FiDollarSign size={11} /> Máx ${amountMax}
                  <button onClick={() => setAmountMax('')} className="ml-1 hover:text-white"><FiX size={11} /></button>
                </span>
              )}
              {selectedProviders.map(p => (
                <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium capitalize">
                  <FiGlobe size={11} /> {p}
                  <button onClick={() => toggleProvider(p)} className="ml-1 hover:text-white"><FiX size={11} /></button>
                </span>
              ))}

              <button
                onClick={clearAllFilters}
                className="text-xs text-slate-500 hover:text-red-400 underline underline-offset-2 transition-colors ml-1"
              >
                Limpiar todo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sin resultados */}
        {filteredPurchases.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <FiSearch className="mx-auto mb-3 text-slate-600" size={40} />
            <p className="text-slate-300 font-semibold text-lg">Sin resultados</p>
            <p className="text-slate-500 text-sm mt-1">
              Ninguna sesión coincide con los filtros aplicados.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-5 px-5 py-2 rounded-lg bg-slate-700 text-slate-200 text-sm hover:bg-slate-600 transition-colors"
            >
              Limpiar filtros
            </button>
          </GlassCard>
        ) : (
          filteredPurchases.map((purchase) => {
            const isExpanded = expandedId === purchase._id
            const purchasedDate = new Date(purchase.purchasedAt)
            return (
              <motion.div key={purchase._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : purchase._id)}
                    className="w-full p-6 text-left hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold">Sesión #{purchase.sessionId?.slice(0, 8).toUpperCase()}</h3>
                          <Badge variant="success">Registrada</Badge>
                          {purchase.providers?.map(pr => (
                            <span
                              key={pr}
                              className="px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 text-xs capitalize border border-slate-600"
                            >
                              {pr}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            {format(purchasedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock size={14} />
                            {format(purchasedDate, 'HH:mm:ss')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiPackage size={14} />
                            {purchase.itemCount} producto{purchase.itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDistanceToNow(purchasedDate, { addSuffix: true, locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Total estimado</p>
                          <p className="text-2xl font-bold text-gradient">${purchase.subtotal?.toFixed(2)}</p>
                          <p className="text-xs text-slate-500 capitalize mt-1">{purchase.providers?.join(', ')}</p>
                        </div>
                        {isExpanded ? <FiChevronUp className="text-accent" /> : <FiChevronDown className="text-accent" />}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-700"
                      >
                        <div className="p-6 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-700">
                                <th className="text-left py-2 pr-4">Producto</th>
                                <th className="text-left py-2 pr-4">Proveedor</th>
                                <th className="text-right py-2 pr-4">Cant.</th>
                                <th className="text-right py-2 pr-4">Precio</th>
                                <th className="text-right py-2 pr-4">Subtotal</th>
                                <th className="text-right py-2">Enlace</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchase.items?.map((item, idx) => (
                                <tr key={`${item.identifier}-${idx}`} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                  <td className="py-3 pr-4">
                                    <div className="flex items-center gap-3">
                                      {item.image && (
                                        <img src={item.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                      )}
                                      <span className="font-medium line-clamp-2">{item.title}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4 capitalize">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-xs border border-slate-600">
                                      {item.provider}
                                    </span>
                                  </td>
                                  <td className="py-3 pr-4 text-right">{item.quantity}</td>
                                  <td className="py-3 pr-4 text-right">${item.price?.toFixed(2)}</td>
                                  <td className="py-3 pr-4 text-right font-semibold">${item.lineTotal?.toFixed(2)}</td>
                                  <td className="py-3 text-right">
                                    {item.url ? (
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:text-accent-light inline-flex"
                                      >
                                        <FiExternalLink size={14} />
                                      </a>
                                    ) : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
