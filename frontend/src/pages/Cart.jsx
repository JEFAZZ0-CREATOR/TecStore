import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingCart, FiX, FiMinus, FiPlus, FiExternalLink, FiGlobe } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCartStore } from '../store/store'
import { purchasesAPI } from '../services/api'
import { openUrlInNewTab, groupUrlsByProvider } from '../utils/openUrls'
import { GlassCard, Button, EmptyState, Badge } from '../components/common'

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore()
  const [isOpening, setIsOpening] = useState(false)
  const [linkModal, setLinkModal] = useState(null)

  const itemsWithUrl = items.filter((item) => item.url && item.url.startsWith('http'))
  const uniqueProviders = [...new Set(items.map((item) => item.provider).filter(Boolean))]
  const providerGroups = groupUrlsByProvider(items)

  const openAllSites = async () => {
    if (items.length === 0) return

    if (itemsWithUrl.length === 0) {
      toast.error('Ningún producto del carrito tiene enlace a tienda externa')
      return
    }

    setIsOpening(true)
    try {
      await purchasesAPI.register({ items, source: 'cart' })

      const uniqueUrls = [...new Set(itemsWithUrl.map((item) => item.url))]
      uniqueUrls.forEach((url) => openUrlInNewTab(url))

      setLinkModal({
        groups: providerGroups,
        urls: uniqueUrls,
      })

      toast.success('Compra registrada. Usa los enlaces si el navegador bloqueó pestañas.', { duration: 6000 })
      clearCart()
    } catch (error) {
      console.error('Error registering purchase:', error)
      toast.error('No se pudo registrar la compra. Intenta de nuevo.')
    } finally {
      setIsOpening(false)
    }
  }

  const openSingleSite = (url) => {
    if (!url) return
    openUrlInNewTab(url)
  }

  const openAllFromModal = () => {
    linkModal?.urls?.forEach((url) => openUrlInNewTab(url))
    toast.success('Enlaces abiertos')
  }

  if (items.length === 0 && !linkModal) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <EmptyState
          icon={FiShoppingCart}
          title="Tu carrito está vacío"
          description="Explora la tienda, añade productos al carrito y luego abre los sitios de cada proveedor"
          action={<Link to="/products" className="btn-primary">Ir a la Tienda</Link>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AnimatePresence>
        {linkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setLinkModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="card max-w-lg w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gradient flex items-center gap-2">
                <FiGlobe /> Abrir tiendas
              </h3>
              <p className="text-sm text-slate-400">
                Si el navegador bloqueó pestañas automáticas, abre cada enlace manualmente:
              </p>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {linkModal.groups.map(({ provider, links }) => (
                  <div key={provider} className="border border-slate-700 rounded-lg p-3">
                    <p className="font-semibold capitalize mb-2 text-accent">{provider}</p>
                    <div className="space-y-2">
                      {links.map((link) => (
                        <button
                          key={link.url}
                          type="button"
                          onClick={() => openSingleSite(link.url)}
                          className="w-full text-left text-sm p-2 rounded bg-slate-800/80 hover:bg-slate-700 flex items-center gap-2"
                        >
                          <FiExternalLink className="shrink-0" />
                          <span className="line-clamp-1">{link.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={openAllFromModal}>
                  Reintentar abrir todos
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => setLinkModal(null)}>
                  Cerrar
                </Button>
              </div>
              <Link to="/orders" className="block text-center text-accent text-sm hover:underline">
                Ver historial de compras →
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gradient">Mi Carrito</h1>
              <p className="text-slate-400 mt-1">
                {items.length} producto{items.length !== 1 ? 's' : ''} · {uniqueProviders.length} proveedor{uniqueProviders.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <Link to="/orders" className="text-accent hover:text-accent-light text-sm">
              Ver historial de compras →
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <motion.div key={item.productId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-4 flex flex-col sm:flex-row gap-4">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        {item.provider && <Badge variant="primary" className="text-xs capitalize">{item.provider}</Badge>}
                      </div>
                      <p className="text-sm text-slate-400">${item.price.toFixed(2)} c/u</p>
                      {item.url ? (
                        <button type="button" onClick={() => openSingleSite(item.url)} className="text-sm text-accent hover:text-accent-light flex items-center gap-1 mt-2">
                          <FiExternalLink size={14} /> Abrir en tienda
                        </button>
                      ) : (
                        <p className="text-xs text-warning mt-2">Sin enlace externo</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="btn-icon"><FiMinus size={16} /></button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="btn-icon"><FiPlus size={16} /></button>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between">
                      <p className="font-bold text-gradient">${(item.price * item.quantity).toFixed(2)}</p>
                      <button type="button" onClick={() => removeItem(item.productId)} className="btn-icon text-danger mt-2"><FiX size={16} /></button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-20 h-fit">
              <GlassCard className="p-6 space-y-4">
                <h3 className="text-xl font-bold">Resumen</h3>
                <div className="space-y-2 text-sm border-b border-slate-700 pb-4">
                  <div className="flex justify-between"><span>Subtotal:</span><span>${total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Enlaces disponibles:</span><span>{itemsWithUrl.length} / {items.length}</span></div>
                  <div className="flex justify-between"><span>Sitios únicos:</span><span>{providerGroups.length}</span></div>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total estimado:</span>
                  <span className="text-gradient">${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Se abrirá un modal con todos los enlaces por si el navegador bloquea pestañas múltiples.
                </p>
                <Button variant="primary" className="w-full flex items-center justify-center gap-2" loading={isOpening} disabled={itemsWithUrl.length === 0} onClick={openAllSites}>
                  <FiGlobe /> Abrir todos los sitios
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => clearCart()}>Vaciar carrito</Button>
                <Link to="/products" className="block text-center text-accent hover:text-accent-light text-sm">Seguir comprando</Link>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
