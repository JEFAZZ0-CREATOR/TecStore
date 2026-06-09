import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage, FiCalendar, FiDollarSign, FiChevronDown, FiChevronUp,
  FiExternalLink, FiShoppingBag, FiTrendingUp, FiClock, FiGlobe, FiPieChart,
} from 'react-icons/fi'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { purchasesAPI } from '../services/api'
import { GlassCard, LoadingSpinner, EmptyState, Badge } from '../components/common'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

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

  const maxCount = Math.max(...data.map((d) => d.count), 1)

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

  useEffect(() => { loadData() }, [])

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
    <div className="max-w-6xl mx-auto space-y-8">
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

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Registro detallado</h2>
        {purchases.map((purchase) => {
          const isExpanded = expandedId === purchase._id
          const purchasedDate = new Date(purchase.purchasedAt)
          return (
            <motion.div key={purchase._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="overflow-hidden">
                <button type="button" onClick={() => setExpandedId(isExpanded ? null : purchase._id)} className="w-full p-6 text-left hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold">Sesión #{purchase.sessionId?.slice(0, 8).toUpperCase()}</h3>
                        <Badge variant="success">Registrada</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><FiCalendar size={14} />{format(purchasedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}</span>
                        <span className="flex items-center gap-1"><FiClock size={14} />{format(purchasedDate, 'HH:mm:ss')}</span>
                        <span className="flex items-center gap-1"><FiPackage size={14} />{purchase.itemCount} producto{purchase.itemCount !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{formatDistanceToNow(purchasedDate, { addSuffix: true, locale: es })}</p>
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
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-700">
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
                              <tr key={`${item.identifier}-${idx}`} className="border-b border-slate-800">
                                <td className="py-3 pr-4">
                                  <div className="flex items-center gap-3">
                                    {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                                    <span className="font-medium line-clamp-2">{item.title}</span>
                                  </div>
                                </td>
                                <td className="py-3 pr-4 capitalize">{item.provider}</td>
                                <td className="py-3 pr-4 text-right">{item.quantity}</td>
                                <td className="py-3 pr-4 text-right">${item.price?.toFixed(2)}</td>
                                <td className="py-3 pr-4 text-right font-semibold">${item.lineTotal?.toFixed(2)}</td>
                                <td className="py-3 text-right">
                                  {item.url ? (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light inline-flex">
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
        })}
      </div>
    </div>
  )
}
