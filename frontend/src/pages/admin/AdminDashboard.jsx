import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp,
  FiPackage, FiClock, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi'
import { adminAPI } from '../../services/adminAPI'

const fmt = (n) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Number(n ?? 0).toFixed(2)}`

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="relative p-6 rounded-2xl border border-white/10 overflow-hidden"
    style={{ background: 'linear-gradient(145deg,rgba(20,20,60,.92),rgba(13,13,30,.97))' }}
  >
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl"
      style={{ background: color }} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white font-display">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  </motion.div>
)

const STATUS_COLORS = {
  pending:   '#f59e0b',
  paid:      '#10b981',
  shipped:   '#3b82f6',
  cancelled: '#ef4444',
}
const STATUS_LABELS = {
  pending: 'Pendiente', paid: 'Pagado', shipped: 'Enviado', cancelled: 'Cancelado'
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    adminAPI.getStats()
      .then(setStats)
      .catch(() => setError('No se pudo cargar las estadísticas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return (
    <div className="flex items-center gap-2 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm">
      <FiAlertCircle /> {error}
    </div>
  )

  const { totalUsers, newUsersMonth, newUsersWeek, totalOrders, ordersThisWeek,
          totalRevenue, revenueThisWeek, ordersByStatus = {} } = stats

  const statCards = [
    { icon: FiUsers,       label: 'Usuarios totales',   value: totalUsers,    sub: `+${newUsersWeek} esta semana`,   color: '#6d28d9', delay: 0    },
    { icon: FiShoppingBag, label: 'Órdenes totales',    value: totalOrders,   sub: `+${ordersThisWeek} esta semana`, color: '#3b82f6', delay: 0.1  },
    { icon: FiDollarSign,  label: 'Ingresos totales',   value: fmt(totalRevenue),  sub: `${fmt(revenueThisWeek)} esta semana`, color: '#22d3ee', delay: 0.2 },
    { icon: FiTrendingUp,  label: 'Nuevos (30 días)',   value: newUsersMonth, sub: 'Usuarios registrados',           color: '#10b981', delay: 0.3  },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white font-display mb-1">Dashboard</h2>
        <p className="text-slate-500 text-sm">Resumen general de TecStore</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Order status breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl border border-white/10"
        style={{ background: 'linear-gradient(145deg,rgba(20,20,60,.92),rgba(13,13,30,.97))' }}
      >
        <h3 className="text-white font-semibold font-display mb-5 flex items-center gap-2">
          <FiPackage className="text-accent-light" /> Órdenes por estado
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['pending','paid','shipped','cancelled'].map((s) => (
            <div key={s} className="p-4 rounded-xl border border-white/8"
              style={{ background: `${STATUS_COLORS[s]}10`, borderColor: `${STATUS_COLORS[s]}30` }}>
              <p className="text-2xl font-bold font-display" style={{ color: STATUS_COLORS[s] }}>
                {ordersByStatus[s] ?? 0}
              </p>
              <p className="text-slate-400 text-xs mt-1">{STATUS_LABELS[s]}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl border border-accent/20 bg-accent/5"
      >
        <div className="flex items-center gap-3 text-accent-light">
          <FiCheckCircle size={18} />
          <p className="text-sm font-semibold">Panel de administración activo</p>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Tienes acceso completo a la gestión de usuarios, órdenes y configuración del sistema.
        </p>
      </motion.div>
    </div>
  )
}
