import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FiSearch, FiRefreshCw, FiAlertCircle, FiTrash2,
  FiEye, FiToggleLeft, FiToggleRight, FiChevronUp, FiChevronDown,
  FiBox, FiStar, FiTag
} from 'react-icons/fi'
import { adminAPI } from '../../services/adminAPI'
import toast from 'react-hot-toast'

const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [providerFilter, setPF] = useState('all')
  const [availFilter, setAF]    = useState('all')
  const [sortField, setSort]    = useState('createdAt')
  const [sortDir, setSortDir]   = useState('desc')
  const [page, setPage]         = useState(1)
  const PER_PAGE = 12

  const load = () => {
    setLoading(true)
    adminAPI.getProducts()
      .then(setProducts)
      .catch(() => setError('No se pudo cargar los productos'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const providers = useMemo(() => [...new Set(products.map(p => p.provider).filter(Boolean))], [products])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSort(field); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let list = [...products]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
    }
    if (providerFilter !== 'all') list = list.filter(p => p.provider === providerFilter)
    if (availFilter === 'available')   list = list.filter(p => p.available)
    if (availFilter === 'unavailable') list = list.filter(p => !p.available)
    list.sort((a, b) => {
      const va = a[sortField] ?? '', vb = b[sortField] ?? ''
      const cmp = sortDir === 'asc' ? 1 : -1
      if (typeof va === 'number') return (va - vb) * cmp
      return String(va).localeCompare(String(vb)) * cmp
    })
    return list
  }, [products, search, providerFilter, availFilter, sortField, sortDir])

  const pages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleToggle = async (product) => {
    try {
      const updated = await adminAPI.toggleProductAvailability(product._id)
      setProducts(p => p.map(x => x._id === product._id ? { ...x, available: updated.available } : x))
      toast.success(updated.available ? 'Producto activado' : 'Producto desactivado')
    } catch { toast.error('Error al cambiar disponibilidad') }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`)) return
    try {
      await adminAPI.deleteProduct(product._id)
      setProducts(p => p.filter(x => x._id !== product._id))
      toast.success('Producto eliminado')
    } catch { toast.error('Error al eliminar el producto') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />
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

  const available   = products.filter(p => p.available).length
  const unavailable = products.length - available

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Productos</h2>
          <p className="text-slate-500 text-sm">
            {products.length} productos ·{' '}
            <span className="text-success">{available} activos</span>{' '}·{' '}
            <span className="text-slate-400">{unavailable} inactivos</span>
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
            placeholder="Buscar por título o categoría…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-white/10 rounded-xl text-white placeholder-slate-500
                       focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <select value={providerFilter} onChange={e => { setPF(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm bg-surface border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50">
          <option value="all">Todos los proveedores</option>
          {providers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={availFilter} onChange={e => { setAF(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm bg-surface border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50">
          <option value="all">Disponibilidad</option>
          <option value="available">Disponibles</option>
          <option value="unavailable">No disponibles</option>
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
                  { field: null,         label: 'Producto'        },
                  { field: 'provider',   label: 'Proveedor'       },
                  { field: 'category',   label: 'Categoría'       },
                  { field: 'price',      label: 'Precio'          },
                  { field: 'discount',   label: 'Descuento'       },
                  { field: 'rating',     label: 'Calificación'    },
                  { field: 'orderCount', label: 'Órdenes'         },
                  { field: 'available',  label: 'Estado'          },
                  { field: null,         label: 'Acciones'        },
                ].map(({ field, label }) => (
                  <th key={label}
                    onClick={() => field && toggleSort(field)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap
                                ${field ? 'cursor-pointer hover:text-white select-none' : ''}`}>
                    <span className="flex items-center gap-1">{label} {field && <SortIcon field={field} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {current.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-slate-500">No se encontraron productos</td></tr>
              )}
              {current.map((product, i) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/3 transition-colors"
                >
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image
                        ? <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                            <FiBox size={16} className="text-slate-500" />
                          </div>
                      }
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium line-clamp-2 max-w-[200px]">{product.title}</p>
                      </div>
                    </div>
                  </td>
                  {/* Provider */}
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-slate-300 font-medium border border-white/10">
                      {product.provider ?? '—'}
                    </span>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3">
                    {product.category
                      ? <span className="flex items-center gap-1 text-xs text-slate-400">
                          <FiTag size={10} /> {product.category}
                        </span>
                      : <span className="text-slate-600 text-xs">—</span>
                    }
                  </td>
                  {/* Price */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{fmtMoney(product.price)}</p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-slate-500 text-xs line-through">{fmtMoney(product.originalPrice)}</p>
                      )}
                    </div>
                  </td>
                  {/* Discount */}
                  <td className="px-4 py-3">
                    {product.discount > 0
                      ? <span className="text-xs font-semibold text-warning bg-warning/15 border border-warning/30 px-2 py-0.5 rounded-full">
                          -{product.discount}%
                        </span>
                      : <span className="text-slate-600 text-xs">—</span>
                    }
                  </td>
                  {/* Rating */}
                  <td className="px-4 py-3">
                    {product.rating
                      ? <span className="flex items-center gap-1 text-xs text-warning">
                          <FiStar size={11} className="fill-current" />
                          {Number(product.rating).toFixed(1)}
                        </span>
                      : <span className="text-slate-600 text-xs">—</span>
                    }
                  </td>
                  {/* Orders */}
                  <td className="px-4 py-3">
                    <span className="text-white font-semibold">{product.orderCount ?? 0}</span>
                  </td>
                  {/* Available */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      product.available
                        ? 'bg-success/15 text-success border-success/30'
                        : 'bg-white/8 text-slate-500 border-white/15'
                    }`}>
                      {product.available ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {product.url && (
                        <a href={product.url} target="_blank" rel="noreferrer"
                          title="Ver en tienda"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                     hover:text-accent-light hover:bg-accent/20 transition-all">
                          <FiEye size={13} />
                        </a>
                      )}
                      <button onClick={() => handleToggle(product)}
                        title={product.available ? 'Desactivar' : 'Activar'}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                   hover:text-warning hover:bg-warning/15 transition-all">
                        {product.available
                          ? <FiToggleRight size={15} className="text-success" />
                          : <FiToggleLeft size={15} />
                        }
                      </button>
                      <button onClick={() => handleDelete(product)}
                        title="Eliminar producto"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                                   hover:text-danger hover:bg-danger/15 transition-all">
                        <FiTrash2 size={13} />
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
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition-all ${
                    p === page ? 'bg-accent text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
