import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { adminAPI } from '../../services/adminAPI'

const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
const fmtDate  = (s) => {
  const [, m, d] = s.split('-')
  return `${d}/${m}`
}

// ── Mini bar chart ─────────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color, height = 120 }) {
  const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1)
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((item, i) => {
        const pct = ((item[valueKey] ?? 0) / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                            bg-surface-overlay border border-white/20 text-white text-xs px-2 py-1 rounded-lg
                            pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-glass">
              {item[labelKey]}: {typeof item[valueKey] === 'number' && item[valueKey] > 100
                ? fmtMoney(item[valueKey]) : item[valueKey]}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 2)}%` }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
              className="w-full rounded-t-sm"
              style={{ background: pct > 60 ? color : `${color}80` }}
            />
            <span className="text-slate-600 text-[9px] truncate w-full text-center">{fmtDate(item[labelKey])}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Horizontal bar ─────────────────────────────────────────────────────────
function HBar({ label, value, max, color, sub }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 truncate max-w-[60%]">{label}</span>
        <span className="text-white font-semibold shrink-0">{sub ?? value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────────────────
const Card = ({ title, icon: Icon, color, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="p-6 rounded-2xl border border-white/10"
    style={{ background: 'linear-gradient(145deg,rgba(20,20,60,.92),rgba(13,13,30,.97))' }}
  >
    <h3 className="text-white font-semibold font-display mb-4 flex items-center gap-2 text-sm">
      <Icon size={16} style={{ color }} /> {title}
    </h3>
    {children}
  </motion.div>
)

const STATUS_COLORS = { pending:'#f59e0b', paid:'#10b981', shipped:'#3b82f6', cancelled:'#ef4444' }
const STATUS_LABELS = { pending:'Pendiente', paid:'Pagado', shipped:'Enviado', cancelled:'Cancelado' }

export default function AdminAnalytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoad]  = useState(true)
  const [error, setError]   = useState(null)

  const load = () => {
    setLoad(true)
    adminAPI.getAnalytics()
      .then(setData)
      .catch(() => setError('No se pudo cargar las analíticas'))
      .finally(() => setLoad(false))
  }
  useEffect(load, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return (
    <div className="flex items-center gap-2 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm">
      <FiAlertCircle /> {error}
      <button onClick={load} className="ml-auto text-xs underline">Reintentar</button>
    </div>
  )

  const { ordersPerDay = [], usersPerDay = [], topProducts = [], revenueByProvider = [], statusDist = [] } = data

  const totalRevenue  = ordersPerDay.reduce((s, d) => s + (d.revenue ?? 0), 0)
  const totalOrders   = ordersPerDay.reduce((s, d) => s + (d.count ?? 0), 0)
  const totalNewUsers = usersPerDay.reduce((s, d) => s + (d.count ?? 0), 0)

  const maxRevenue  = Math.max(...ordersPerDay.map(d => d.revenue ?? 0), 1)
  const maxProvider = Math.max(...revenueByProvider.map(d => d.revenue ?? 0), 1)
  const maxProduct  = Math.max(...topProducts.map(d => d.unitsSold ?? 0), 1)
  const maxStatus   = Math.max(...statusDist.map(d => d.count ?? 0), 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Analíticas</h2>
          <p className="text-slate-500 text-sm">Estadísticas detalladas de los últimos 14 días</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all">
          <FiRefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ingresos (14 días)', value: fmtMoney(totalRevenue), icon: FiDollarSign, color: '#22d3ee' },
          { label: 'Órdenes (14 días)',  value: totalOrders,            icon: FiShoppingBag, color: '#3b82f6' },
          { label: 'Nuevos usuarios',    value: totalNewUsers,          icon: FiUsers,       color: '#6d28d9' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl border border-white/10 text-center"
            style={{ background: 'linear-gradient(145deg,rgba(20,20,60,.9),rgba(13,13,30,.95))' }}
          >
            <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-xl font-bold text-white font-display">{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue per day */}
        <Card title="Ingresos por día" icon={FiDollarSign} color="#22d3ee" delay={0.1}>
          {ordersPerDay.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin datos en este período</p>
            : <BarChart data={ordersPerDay} valueKey="revenue" labelKey="_id" color="#22d3ee" height={120} />
          }
        </Card>

        {/* Orders per day */}
        <Card title="Órdenes por día" icon={FiShoppingBag} color="#3b82f6" delay={0.15}>
          {ordersPerDay.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin datos en este período</p>
            : <BarChart data={ordersPerDay} valueKey="count" labelKey="_id" color="#3b82f6" height={120} />
          }
        </Card>

        {/* New users per day */}
        <Card title="Nuevos usuarios por día" icon={FiUsers} color="#6d28d9" delay={0.2}>
          {usersPerDay.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin registros en este período</p>
            : <BarChart data={usersPerDay} valueKey="count" labelKey="_id" color="#a78bfa" height={120} />
          }
        </Card>

        {/* Order status */}
        <Card title="Órdenes por estado" icon={FiTrendingUp} color="#f59e0b" delay={0.25}>
          {statusDist.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin órdenes</p>
            : <div className="space-y-3">
                {statusDist.map(s => (
                  <HBar
                    key={s._id}
                    label={STATUS_LABELS[s._id] ?? s._id}
                    value={s.count}
                    max={maxStatus}
                    color={STATUS_COLORS[s._id] ?? '#94a3b8'}
                    sub={`${s.count} órdenes`}
                  />
                ))}
              </div>
          }
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top products */}
        <Card title="Productos más vendidos" icon={FiShoppingBag} color="#10b981" delay={0.3}>
          {topProducts.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin ventas registradas</p>
            : <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <HBar
                    key={p._id ?? i}
                    label={p.title ?? 'Producto eliminado'}
                    value={p.unitsSold}
                    max={maxProduct}
                    color="#10b981"
                    sub={`${p.unitsSold} uds · ${fmtMoney(p.revenue)}`}
                  />
                ))}
              </div>
          }
        </Card>

        {/* Revenue by provider */}
        <Card title="Ingresos por proveedor" icon={FiDollarSign} color="#f59e0b" delay={0.35}>
          {revenueByProvider.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sin datos</p>
            : <div className="space-y-3">
                {revenueByProvider.map((p, i) => (
                  <HBar
                    key={p._id ?? i}
                    label={p._id ?? 'Desconocido'}
                    value={p.revenue}
                    max={maxProvider}
                    color={['#6d28d9','#3b82f6','#22d3ee','#10b981','#f59e0b','#ef4444'][i % 6]}
                    sub={fmtMoney(p.revenue)}
                  />
                ))}
              </div>
          }
        </Card>
      </div>
    </div>
  )
}
