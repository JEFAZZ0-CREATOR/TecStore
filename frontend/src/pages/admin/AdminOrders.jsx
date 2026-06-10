import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FiSearch, FiRefreshCw, FiAlertCircle, FiPackage,
  FiChevronUp, FiChevronDown, FiEdit2
} from 'react-icons/fi'
import { adminAPI } from '../../services/adminAPI'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending: '#f59e0b', paid: '#10b981', shipped: '#3b82f6', cancelled: '#ef4444',
}
const STATUS_LABELS = {
  pending: 'Pendiente', paid: 'Pagado', shipped: 'Enviado', cancelled: 'Cancelado',
}
const PAY_COLORS = {
  unpaid: '#ef4444', processing: '#f59e0b', paid: '#10b981', failed: '#ef4444',
}
const PAY_LABELS = {
  unpaid: 'Sin pagar', processing: 'Procesando', paid: 'Pagado', failed: 'Fallido',
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '—'
const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

const Badge = ({ label, color }) => (
  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
    style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
    {label}
  </span>
)

export default function AdminOrders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [sortField, setSort]    = useState('createdAt')
  const [sortDir, setSortDir]   = useState('desc')
  const [page, setPage]         = useState(1)
  const [editing, setEditing]   = useState(null)
  const PER_PAGE = 12

  const load = () => {
    setLoading(true)
    adminAPI.getOrders()
      .then(setOrders)
      .catch(() => setError('No se pudo cargar las órdenes'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSort(field); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let list = [...orders]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o._id?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter)
    list.sort((a, b) => {
      const va = a[sortField] ?? '', vb = b[sortField] ?? ''
      const cmp = sortDir === 'asc' ? 1 : -1
      if (typeof va === 'number') return (va - vb) * cmp
      return String(va).localeCompare(String(vb)) * cmp
    })
    return list
  }, [orders, search, statusFilter, sortField, sortDir])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status)
      setOrders(o => o.map(x => x._id === orderId ? { ...x, status } : x))
      toast.success(`Estado actualizado: ${STATUS_LABELS[status]}`)
      setEditing(null)
    } catch { toast.error('Error al actualizar el estado') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />
  }

  const totalRevenue = useMemo(() =>
    filtered.reduce((s, o) => s + (o.total ?? 0), 0), [filtered])

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Órdenes</h2>
          <p className="text-slate-500 text-sm">
            {orders.length} órdenes — Ingresos filtrados: <span className="text-success font-semibold">{fmtMoney(totalRevenue)}</span>
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all">
          <FiRefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por ID, usuario o email…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-white/10 rounded-xl text-white placeholder-slate-500
                       focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-4 py-2 text-sm bg-surface border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(145deg,rgba(20,20,60,.9),rgba(13,13,30,.95))' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  { field: '_id',       label: 'ID'            },
                  { field: null,        label: 'Cliente'       },
                  { field: null,        label: 'Productos'     },
                  { field: 'total',     label: 'Total'         },
                  { field: 'status',    label: 'Estado'        },
                  { field: 'paymentStatus', label: 'Pago'      },
                  { field: 'createdAt', label: 'Fecha'         },
                  { field: null,        label: 'Acciones'      },
                ].map(({ field, label }) => (
                  <th key={label}
                    onClick={() => field && toggleSort(field)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap
                                ${field ? 'cursor-pointer hover:text-white select-none' : ''}`}>
                    <span className="flex items-center gap-1">
                      {label} {field && <SortIcon field={field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {current.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">No se encontraron órdenes</td>
                </tr>
              )}
              {current.map((order, i) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/3 transition-colors"
                >
                  {/* ID */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-400">
                      #{order._id?.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  {/* Client */}
                  <td className="px-4 py-3">
                    {order.user ? (
                      <div>
                        <p className="text-white text-xs font-medium truncate max-w-[120px]">{order.user.name}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[120px]">{order.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  {/* Items */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <FiPackage size={12} className="text-slate-500" />
                      <span className="text-slate-300 text-xs">{order.items?.length ?? 0} producto(s)</span>
                    </div>
                    {order.items?.[0] && (
                      <p className="text-slate-500 text-xs truncate max-w-[140px] mt-0.5">
                        {order.items[0].title}
                        {order.items.length > 1 && ` +${order.items.length - 1}`}
                      </p>
                    )}
                  </td>
                  {/* Total */}
                  <td className="px-4 py-3">
                    <span className="text-white font-semibold">{fmtMoney(order.total)}</span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {editing === order._id ? (
                      <select
                        defaultValue={order.status}
                        autoFocus
                        onBlur={() => setEditing(null)}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        className="text-xs bg-surface border border-white/20 rounded-lg px-2 py-1 text-white focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge label={STATUS_LABELS[order.status] ?? order.status} color={STATUS_COLORS[order.status] ?? '#94a3b8'} />
                    )}
                  </td>
                  {/* Payment */}
                  <td className="px-4 py-3">
                    <Badge
                      label={PAY_LABELS[order.paymentStatus] ?? order.paymentStatus}
                      color={PAY_COLORS[order.paymentStatus] ?? '#94a3b8'}
                    />
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {fmtDate(order.createdAt)}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditing(editing === order._id ? null : order._id)}
                      title="Editar estado"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                 hover:text-accent-light hover:bg-accent/20 transition-all"
                    >
                      <FiEdit2 size={13} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-slate-500 text-xs">
              Mostrando {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition-all ${
                    p === page ? 'bg-accent text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
