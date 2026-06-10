import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUserPlus, FiShoppingBag, FiRefreshCw, FiAlertCircle,
  FiActivity, FiClock, FiUser
} from 'react-icons/fi'
import { adminAPI } from '../../services/adminAPI'

const fmtDate = (d) => {
  if (!d) return '—'
  const now  = new Date()
  const date = new Date(d)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60)   return 'Hace unos segundos'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400)return `Hace ${Math.floor(diff / 3600)} h`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

const STATUS_COLORS = { pending:'#f59e0b', paid:'#10b981', shipped:'#3b82f6', cancelled:'#ef4444' }
const STATUS_LABELS = { pending:'Pendiente', paid:'Pagado', shipped:'Enviado', cancelled:'Cancelado' }

const EVENT_CONFIG = {
  new_user:  { icon: FiUserPlus,   color: '#6d28d9', bg: 'rgba(109,40,217,.15)', label: 'Nuevo usuario'  },
  new_order: { icon: FiShoppingBag, color: '#10b981', bg: 'rgba(16,185,129,.15)', label: 'Nueva orden'    },
}

function EventCard({ event, index }) {
  const cfg = EVENT_CONFIG[event.type] ?? { icon: FiActivity, color: '#94a3b8', bg: 'rgba(148,163,184,.1)', label: event.type }
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex items-start gap-4 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-colors group"
      style={{ background: 'rgba(20,20,55,.7)' }}
    >
      {/* Icon */}
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}40` }}>
        <Icon size={15} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-white text-sm font-medium">{event.message}</p>
          <span className="text-slate-600 text-xs shrink-0 flex items-center gap-1">
            <FiClock size={10} /> {fmtDate(event.date)}
          </span>
        </div>

        {/* User badge */}
        {event.user && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-accent flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {event.user.avatarUrl
                ? <img src={event.user.avatarUrl} alt="" className="w-5 h-5 rounded-md object-cover" />
                : event.user.name?.[0]?.toUpperCase() ?? <FiUser size={10} />
              }
            </div>
            <span className="text-slate-400 text-xs truncate">{event.user.name}</span>
            <span className="text-slate-600 text-xs truncate hidden sm:block">· {event.user.email}</span>
          </div>
        )}

        {/* Order details */}
        {event.type === 'new_order' && (
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-success text-xs font-semibold">{fmtMoney(event.total)}</span>
            {event.status && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                style={{
                  color: STATUS_COLORS[event.status] ?? '#94a3b8',
                  borderColor: `${STATUS_COLORS[event.status] ?? '#94a3b8'}40`,
                  background: `${STATUS_COLORS[event.status] ?? '#94a3b8'}15`,
                }}>
                {STATUS_LABELS[event.status] ?? event.status}
              </span>
            )}
            <span className="text-slate-600 text-xs font-mono">#{String(event.orderId).slice(-8).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Type label */}
      <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium hidden sm:block"
        style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    </motion.div>
  )
}

export default function AdminActivity() {
  const [events, setEvents] = useState([])
  const [loading, setLoad]  = useState(true)
  const [error, setError]   = useState(null)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoad(true)
    adminAPI.getActivity()
      .then(setEvents)
      .catch(() => setError('No se pudo cargar la actividad'))
      .finally(() => setLoad(false))
  }
  useEffect(load, [])

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)

  const newUsers  = events.filter(e => e.type === 'new_user').length
  const newOrders = events.filter(e => e.type === 'new_order').length

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Actividad reciente</h2>
          <p className="text-slate-500 text-sm">{events.length} eventos — últimos registros y órdenes</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all">
          <FiRefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'all',       label: `Todo (${events.length})`,       color: '#94a3b8' },
          { id: 'new_user',  label: `Usuarios (${newUsers})`,        color: '#6d28d9' },
          { id: 'new_order', label: `Órdenes (${newOrders})`,        color: '#10b981' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`text-xs px-4 py-1.5 rounded-full font-medium border transition-all ${
              filter === f.id
                ? 'text-white border-white/30 bg-white/10'
                : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {filtered.length === 0
          ? <div className="text-center py-16 text-slate-500">
              <FiActivity size={32} className="mx-auto mb-3 opacity-30" />
              <p>Sin actividad reciente</p>
            </div>
          : filtered.map((event, i) => <EventCard key={i} event={event} index={i} />)
        }
      </div>
    </div>
  )
}
