import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiMail, FiCalendar, FiClock, FiShoppingBag,
  FiDollarSign, FiShield, FiUser, FiPackage
} from 'react-icons/fi'

const STATUS_COLORS = {
  pending: '#f59e0b', paid: '#10b981', shipped: '#3b82f6', cancelled: '#ef4444',
}
const STATUS_LABELS = {
  pending: 'Pendiente', paid: 'Pagado', shipped: 'Enviado', cancelled: 'Cancelado',
}
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '—'
const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AdminUserDetail({ detail, onClose }) {
  if (!detail) return null
  const { user, orders = [], totalSpent } = detail

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(7,7,26,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 shadow-glass-lg"
          style={{ background: 'linear-gradient(145deg,rgba(20,20,60,.97),rgba(13,13,30,.99))' }}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-5 border-b border-white/10"
            style={{ background: 'rgba(13,13,30,.98)', backdropFilter: 'blur(10px)' }}>
            <h2 className="text-lg font-bold text-white font-display">Detalle de usuario</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                         hover:text-white hover:bg-white/10 transition-all">
              <FiX size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile */}
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center
                              text-white font-bold text-2xl shadow-neon">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                  : user.name?.[0]?.toUpperCase() ?? <FiUser size={28} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-white font-display">{user.name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    user.role === 'admin'
                      ? 'bg-accent/20 text-accent-light border-accent/40'
                      : 'bg-white/10 text-slate-300 border-white/20'
                  }`}>
                    {user.role === 'admin' ? '👑 Admin' : 'Cliente'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                  <FiMail size={12} /> {user.email}
                </p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FiCalendar, label: 'Registro',       value: fmtDate(user.createdAt)   },
                { icon: FiClock,    label: 'Último acceso',  value: fmtDate(user.lastLoginAt) },
                { icon: FiShoppingBag, label: 'Órdenes',     value: orders.length             },
                { icon: FiDollarSign,  label: 'Total gastado', value: fmtMoney(totalSpent)    },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl border border-white/8 bg-white/4">
                  <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-1">
                    <Icon size={11} /> {label}
                  </p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Orders */}
            <div>
              <h4 className="text-white font-semibold font-display mb-3 flex items-center gap-2">
                <FiPackage className="text-accent-light" size={16} />
                Historial de órdenes ({orders.length})
              </h4>

              {orders.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Sin órdenes registradas</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {orders.map((o) => (
                    <div key={o._id}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/8 bg-white/3">
                      <div className="min-w-0">
                        <p className="text-white text-xs font-mono truncate max-w-[140px]">
                          #{o._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">{fmtDate(o.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                          style={{
                            color: STATUS_COLORS[o.status],
                            borderColor: `${STATUS_COLORS[o.status]}40`,
                            background: `${STATUS_COLORS[o.status]}15`,
                          }}>
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                        <span className="text-white font-semibold text-sm">{fmtMoney(o.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
