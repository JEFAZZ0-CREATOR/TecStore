import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShoppingCart, FiX, FiMinus, FiPlus, FiExternalLink, FiGlobe,
  FiArrowRight, FiTrash2, FiPackage, FiAlertTriangle
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCartStore } from '../store/store'
import { purchasesAPI } from '../services/api'
import { openUrlInNewTab, groupUrlsByProvider } from '../utils/openUrls'

const PROVIDER_COLORS = {
  amazon:    { bg: 'rgba(255,153,0,.15)',  border: 'rgba(255,153,0,.35)',  text: '#ff9900' },
  mercadolibre: { bg: 'rgba(255,230,0,.12)', border: 'rgba(255,230,0,.3)',  text: '#ffe600' },
  liverpool:  { bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)',   text: '#ef4444' },
  palacio:    { bg: 'rgba(109,40,217,.15)', border: 'rgba(109,40,217,.35)', text: '#a78bfa' },
  default:    { bg: 'rgba(148,163,184,.1)', border: 'rgba(148,163,184,.25)',text: '#94a3b8' },
}

const getProviderColor = (name) => {
  const key = (name ?? '').toLowerCase()
  for (const [k, v] of Object.entries(PROVIDER_COLORS)) {
    if (key.includes(k)) return v
  }
  return PROVIDER_COLORS.default
}

const fmtMoney = (n) => `$${Number(n ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

function ProviderBadge({ name }) {
  const c = getProviderColor(name)
  return (
    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {name}
    </span>
  )
}

function CartItem({ item, onUpdate, onRemove, onOpen }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="group flex gap-4 p-4 rounded-2xl border border-white/10 hover:border-white/18 transition-all"
      style={{ background: 'linear-gradient(135deg,rgba(20,20,55,.85),rgba(12,12,32,.9))' }}
    >
      {/* Image */}
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/8">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-slate-600">
              <FiPackage size={24} />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 flex-1">{item.name}</h3>
        </div>
        <div className="flex items-center gap-2 mb-2">
          {item.provider && <ProviderBadge name={item.provider} />}
          <span className="text-slate-400 text-xs">{fmtMoney(item.price)} c/u</span>
        </div>
        {item.url ? (
          <button type="button" onClick={() => onOpen(item.url)}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors">
            <FiExternalLink size={11} /> Abrir en tienda
          </button>
        ) : (
          <span className="flex items-center gap-1 text-xs text-warning/70">
            <FiAlertTriangle size={11} /> Sin enlace
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end justify-between shrink-0">
        {/* Qty */}
        <div className="flex items-center gap-1 bg-white/6 border border-white/12 rounded-xl overflow-hidden">
          <button type="button" onClick={() => onUpdate(item.productId, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <FiMinus size={12} />
          </button>
          <span className="w-7 text-center text-sm font-bold text-white select-none">{item.quantity}</span>
          <button type="button" onClick={() => onUpdate(item.productId, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <FiPlus size={12} />
          </button>
        </div>

        {/* Price + remove */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-sm" style={{
            background: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {fmtMoney(item.price * item.quantity)}
          </span>
          <button type="button" onClick={() => onRemove(item.productId)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600
                       hover:text-danger hover:bg-danger/15 transition-all opacity-0 group-hover:opacity-100">
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore()
  const [isOpening, setIsOpening] = useState(false)
  const [linkModal, setLinkModal] = useState(null)

  const itemsWithUrl     = items.filter(i => i.url?.startsWith('http'))
  const uniqueProviders  = [...new Set(items.map(i => i.provider).filter(Boolean))]
  const providerGroups   = groupUrlsByProvider(items)
  const itemCount        = items.reduce((s, i) => s + i.quantity, 0)

  const openAllSites = async () => {
    if (!items.length) return
    if (!itemsWithUrl.length) { toast.error('Ningún producto tiene enlace a tienda externa'); return }

    setIsOpening(true)
    try {
      await purchasesAPI.register({ items, source: 'cart' })
      const uniqueUrls = [...new Set(itemsWithUrl.map(i => i.url))]
      uniqueUrls.forEach(openUrlInNewTab)
      setLinkModal({ groups: providerGroups, urls: uniqueUrls })
      toast.success('Compra registrada. Usa los enlaces si el navegador bloqueó pestañas.', { duration: 6000 })
      clearCart()
    } catch {
      toast.error('No se pudo registrar la compra. Intenta de nuevo.')
    } finally {
      setIsOpening(false)
    }
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!items.length && !linkModal) {
    return (
      <div className="min-h-[480px] flex flex-col items-center justify-center text-center px-4 py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="w-24 h-24 rounded-3xl mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,rgba(109,40,217,.2),rgba(59,130,246,.2))', border: '1px solid rgba(109,40,217,.3)' }}
        >
          <FiShoppingCart size={36} className="text-accent/70" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mb-2 font-display">
          Tu carrito está vacío
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="text-slate-400 text-sm max-w-sm mb-8">
          Explora la tienda, añade productos que te interesen y ábrelos todos de un solo clic.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Link to="/products" className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">
            Explorar tienda <FiArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Link modal */}
      <AnimatePresence>
        {linkModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(7,7,26,.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setLinkModal(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full rounded-3xl border border-white/12 overflow-hidden"
              style={{ background: 'linear-gradient(145deg,rgba(18,18,50,.98),rgba(10,10,28,.99))' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1" style={{ background: 'linear-gradient(90deg,#6d28d9,#3b82f6,#22d3ee)' }} />
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(109,40,217,.2)', border: '1px solid rgba(109,40,217,.4)' }}>
                    <FiGlobe size={18} className="text-accent-light" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold font-display">Abrir tiendas</h3>
                    <p className="text-slate-500 text-xs">Si el navegador bloqueó pestañas, ábrelas aquí</p>
                  </div>
                  <button onClick={() => setLinkModal(null)}
                    className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                    <FiX size={15} />
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {linkModal.groups.map(({ provider, links }) => (
                    <div key={provider} className="rounded-xl border border-white/10 overflow-hidden"
                      style={{ background: 'rgba(255,255,255,.03)' }}>
                      <div className="px-3 py-2 border-b border-white/8">
                        <span className="text-xs font-semibold capitalize" style={{ color: getProviderColor(provider).text }}>
                          {provider}
                        </span>
                      </div>
                      <div className="p-2 space-y-1">
                        {links.map(link => (
                          <button key={link.url} type="button"
                            onClick={() => openUrlInNewTab(link.url)}
                            className="w-full text-left text-xs px-3 py-2 rounded-lg text-slate-300 hover:text-white
                                       hover:bg-white/8 flex items-center gap-2 transition-colors">
                            <FiExternalLink size={11} className="shrink-0 text-slate-500" />
                            <span className="truncate">{link.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { linkModal.urls.forEach(openUrlInNewTab); toast.success('Enlaces abiertos') }}
                    className="btn-primary flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
                    <FiGlobe size={14} /> Reintentar abrir todos
                  </button>
                  <button onClick={() => setLinkModal(null)}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/15 text-slate-300
                               hover:bg-white/8 hover:text-white transition-all">
                    Cerrar
                  </button>
                </div>
                <Link to="/orders" className="block text-center text-xs text-accent hover:text-accent-light transition-colors">
                  Ver historial de compras →
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold font-display text-white mb-1">
                Mi Carrito
                <span className="ml-3 text-xl font-normal text-slate-500">({itemCount})</span>
              </h1>
              <p className="text-slate-400 text-sm">
                {items.length} producto{items.length !== 1 ? 's' : ''} · {uniqueProviders.length} proveedor{uniqueProviders.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <Link to="/orders" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
              Historial de compras <FiArrowRight size={12} />
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map(item => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onUpdate={updateQuantity}
                    onRemove={removeItem}
                    onOpen={openUrlInNewTab}
                  />
                ))}
              </AnimatePresence>

              {/* Clear cart */}
              <motion.button
                onClick={() => { if (window.confirm('¿Vaciar el carrito?')) clearCart() }}
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-danger transition-colors py-2 pl-1"
                whileHover={{ x: 2 }}
              >
                <FiTrash2 size={12} /> Vaciar carrito
              </motion.button>
            </div>

            {/* Summary panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sticky top-6 h-fit"
            >
              <div className="rounded-2xl border border-white/12 overflow-hidden"
                style={{ background: 'linear-gradient(145deg,rgba(20,20,60,.95),rgba(10,10,28,.98))' }}>
                <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#6d28d9,#3b82f6,#22d3ee)' }} />

                <div className="p-6 space-y-5">
                  <h3 className="font-bold text-white font-display text-lg">Resumen del pedido</h3>

                  {/* Breakdown */}
                  <div className="space-y-3 pb-5 border-b border-white/8">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Productos ({itemCount})</span>
                      <span className="text-white font-medium">{fmtMoney(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Con enlace externo</span>
                      <span className={itemsWithUrl.length === items.length ? 'text-success text-xs font-medium' : 'text-warning text-xs font-medium'}>
                        {itemsWithUrl.length} / {items.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Proveedores</span>
                      <span className="text-white font-medium">{uniqueProviders.length}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-end">
                    <span className="text-white font-semibold">Total estimado</span>
                    <span className="text-2xl font-bold font-display"
                      style={{
                        background: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>
                      {fmtMoney(total)}
                    </span>
                  </div>

                  {/* Info */}
                  {itemsWithUrl.length < items.length && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20 text-xs text-warning/80">
                      <FiAlertTriangle size={13} className="shrink-0 mt-0.5" />
                      {items.length - itemsWithUrl.length} producto(s) sin enlace no podrán abrirse.
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={openAllSites}
                    disabled={isOpening || !itemsWithUrl.length}
                    className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isOpening ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Registrando compra…
                      </>
                    ) : (
                      <>
                        <FiGlobe size={15} /> Abrir todos los sitios
                      </>
                    )}
                  </button>

                  <Link to="/products"
                    className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1">
                    <FiArrowRight size={11} className="rotate-180" />
                    Seguir comprando
                  </Link>
                </div>
              </div>

              {/* Providers mini list */}
              {uniqueProviders.length > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-white/8 space-y-2"
                  style={{ background: 'rgba(255,255,255,.03)' }}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedores incluidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueProviders.map(p => <ProviderBadge key={p} name={p} />)}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
