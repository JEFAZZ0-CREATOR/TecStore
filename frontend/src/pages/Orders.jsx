import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiPackage, FiCalendar, FiMapPin, FiDollarSign, FiChevronRight } from 'react-icons/fi'
import { ordersAPI } from '../services/api'
import { GlassCard, LoadingSpinner, EmptyState } from '../components/common'
import { formatDistanceToNow } from 'date-fns'

const statusColors = {
  pending: 'badge-warning',
  processing: 'badge-primary',
  shipped: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [filter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersAPI.getAll({ status: filter === 'all' ? undefined : filter })
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <EmptyState
          icon={FiPackage}
          title="No hay órdenes"
          description="Realiza tu primera compra y verás tus órdenes aquí"
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-gradient">Mis Órdenes</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-all ${
              filter === status
                ? 'bg-gradient-accent shadow-neon'
                : 'bg-secondary hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-6 hover:shadow-neon-lg cursor-pointer">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold">Pedido #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                    <FiCalendar size={14} />
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <span className={`badge ${statusColors[order.status]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">Cantidad de items</p>
                  <p className="font-semibold">{order.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="font-bold text-gradient">${order.total}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <FiMapPin size={14} />
                    Dirección
                  </p>
                  <p className="text-sm truncate">{order.shippingAddress?.address}</p>
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-lg border-2 border-slate-700 overflow-hidden">
                      <img
                        src={item.image || 'https://via.placeholder.com/40'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="w-10 h-10 rounded-lg border-2 border-slate-700 bg-slate-700 flex items-center justify-center text-xs font-bold">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <FiChevronRight className="text-accent" />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
