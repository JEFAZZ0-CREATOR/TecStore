import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FiSearch, FiUser, FiTrash2, FiEye, FiShield, FiRefreshCw,
  FiChevronUp, FiChevronDown, FiAlertCircle, FiUserCheck
} from 'react-icons/fi'
import { adminAPI } from '../../services/adminAPI'
import AdminUserDetail from './AdminUserDetail'
import toast from 'react-hot-toast'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', {
  year: 'numeric', month: 'short', day: 'numeric',
}) : '—'
const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

const Avatar = ({ user, size = 8 }) => (
  user.avatarUrl
    ? <img src={user.avatarUrl} alt="" className={`w-${size} h-${size} rounded-lg object-cover`} />
    : <div className={`w-${size} h-${size} rounded-lg bg-gradient-accent flex items-center justify-center text-white font-bold text-xs`}>
        {user.name?.[0]?.toUpperCase() ?? '?'}
      </div>
)

export default function AdminUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('all')
  const [sortField, setSort]    = useState('createdAt')
  const [sortDir, setSortDir]   = useState('desc')
  const [page, setPage]         = useState(1)
  const [detail, setDetail]     = useState(null)
  const [detailLoading, setDL]  = useState(false)
  const PER_PAGE = 10

  const load = () => {
    setLoading(true)
    adminAPI.getUsers()
      .then(setUsers)
      .catch(() => setError('No se pudo cargar los usuarios'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSort(field); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let list = [...users]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    }
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter)
    list.sort((a, b) => {
      const va = a[sortField] ?? ''
      const vb = b[sortField] ?? ''
      const cmp = sortDir === 'asc' ? 1 : -1
      if (typeof va === 'number') return (va - vb) * cmp
      return String(va).localeCompare(String(vb)) * cmp
    })
    return list
  }, [users, search, roleFilter, sortField, sortDir])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openDetail = async (id) => {
    setDL(true)
    try { setDetail(await adminAPI.getUserDetail(id)) }
    catch { toast.error('No se pudo cargar el detalle') }
    finally { setDL(false) }
  }

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin'
    try {
      const updated = await adminAPI.updateUserRole(user._id, newRole)
      setUsers(u => u.map(x => x._id === user._id ? { ...x, role: updated.role } : x))
      toast.success(`Rol cambiado a ${newRole}`)
    } catch { toast.error('Error al cambiar el rol') }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return
    try {
      await adminAPI.deleteUser(user._id)
      setUsers(u => u.filter(x => x._id !== user._id))
      toast.success('Usuario eliminado')
    } catch { toast.error('Error al eliminar el usuario') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />
  }

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
          <h2 className="text-2xl font-bold text-white font-display">Usuarios</h2>
          <p className="text-slate-500 text-sm">{users.length} usuarios registrados</p>
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
            placeholder="Buscar por nombre o email…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-white/10 rounded-xl text-white placeholder-slate-500
                       focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRole(e.target.value); setPage(1) }}
          className="px-4 py-2 text-sm bg-surface border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
        >
          <option value="all">Todos los roles</option>
          <option value="customer">Cliente</option>
          <option value="admin">Admin</option>
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
                  { field: 'name',       label: 'Usuario'        },
                  { field: 'role',       label: 'Rol'            },
                  { field: 'createdAt',  label: 'Registro'       },
                  { field: 'lastLoginAt',label: 'Último acceso'  },
                  { field: 'orderCount', label: 'Órdenes'        },
                  { field: 'totalSpent', label: 'Total gastado'  },
                  { field: null,         label: 'Acciones'       },
                ].map(({ field, label }) => (
                  <th key={label}
                    onClick={() => field && toggleSort(field)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider
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
                  <td colSpan={7} className="py-12 text-center text-slate-500">No se encontraron usuarios</td>
                </tr>
              )}
              {current.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/3 transition-colors group"
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate max-w-[140px]">{user.name}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[140px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${
                      user.role === 'admin'
                        ? 'bg-accent/20 text-accent-light border-accent/40'
                        : 'bg-white/8 text-slate-300 border-white/20'
                    }`}>
                      {user.role === 'admin' ? <><FiShield size={10} /> Admin</> : <><FiUser size={10} /> Cliente</>}
                    </span>
                  </td>
                  {/* Dates */}
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(user.lastLoginAt)}</td>
                  {/* Orders */}
                  <td className="px-4 py-3">
                    <span className="text-white font-semibold">{user.orderCount ?? 0}</span>
                  </td>
                  {/* Spent */}
                  <td className="px-4 py-3">
                    <span className="text-success font-semibold">{fmtMoney(user.totalSpent)}</span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openDetail(user._id)}
                        disabled={detailLoading}
                        title="Ver detalle"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                   hover:text-white hover:bg-accent/20 transition-all"
                      >
                        <FiEye size={14} />
                      </button>
                      <button
                        onClick={() => handleRoleToggle(user)}
                        title={user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                   hover:text-accent-light hover:bg-accent/20 transition-all"
                      >
                        {user.role === 'admin' ? <FiUser size={14} /> : <FiUserCheck size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        title="Eliminar usuario"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                   hover:text-danger hover:bg-danger/20 transition-all"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
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
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition-all ${
                    p === page
                      ? 'bg-accent text-white'
                      : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {detail && <AdminUserDetail detail={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
