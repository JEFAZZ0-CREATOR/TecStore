import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiActivity } from 'react-icons/fi'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { priceHistoryAPI } from '../services/api'
import { GlassCard, LoadingSpinner, EmptyState, Badge } from '../components/common'

const MiniLineChart = ({ prices = [], height = 120 }) => {
  if (!prices.length) {
    return (
      <div className="h-28 flex items-center justify-center text-slate-500 text-sm">
        Sin datos de precio
      </div>
    )
  }

  const values = prices.map((p) => p.price)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 280
  const padding = 8

  const points = values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
      <polyline
        fill="none"
        stroke="url(#priceGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <defs>
        <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function PriceHistory() {
  const [summary, setSummary] = useState(null)
  const [selected, setSelected] = useState(null)
  const [detailHistory, setDetailHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await priceHistoryAPI.getSummary()
      setSummary(data)
      if (data?.products?.length) {
        selectProduct(data.products[0])
      }
    } catch (error) {
      console.error('Error loading price summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectProduct = async (product) => {
    setSelected(product)
    try {
      setDetailLoading(true)
      const data = await priceHistoryAPI.getHistory(product.identifier)
      setDetailHistory(data?.history || product.prices || [])
    } catch (error) {
      setDetailHistory(product.prices || [])
    } finally {
      setDetailLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const products = summary?.products || []
  const stats = summary?.stats || {}

  if (!products.length) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <EmptyState
          icon={FiActivity}
          title="Sin historial de precios"
          description="Añade productos a favoritos o registra compras desde el carrito para empezar a rastrear precios"
        />
      </div>
    )
  }

  const chartPrices = detailHistory.length
    ? detailHistory.map((row) => ({ price: row.price, recordedAt: row.recordedAt }))
    : (selected?.prices || [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
          <FiActivity /> Historial de Precios
        </h1>
        <p className="text-slate-400 mt-2">
          Seguimiento de precios en favoritos y compras registradas
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingDown className="text-success text-2xl" />
            <span className="text-sm text-slate-400">Precio más bajo</span>
          </div>
          <p className="text-2xl font-bold text-success">${stats.globalMin?.toFixed(2) || '0.00'}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="text-warning text-2xl" />
            <span className="text-sm text-slate-400">Precio promedio</span>
          </div>
          <p className="text-2xl font-bold text-warning">${stats.globalAvg?.toFixed(2) || '0.00'}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiCalendar className="text-accent text-2xl" />
            <span className="text-sm text-slate-400">Productos rastreados</span>
          </div>
          <p className="text-2xl font-bold">{stats.trackedProducts || 0}</p>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="p-4 lg:col-span-1 max-h-[32rem] overflow-y-auto">
          <h2 className="font-bold mb-3">Productos</h2>
          <div className="space-y-2">
            {products.map((product) => (
              <button
                key={product.identifier}
                type="button"
                onClick={() => selectProduct(product)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selected?.identifier === product.identifier
                    ? 'border-accent bg-accent/10'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <p className="font-semibold text-sm line-clamp-2">{product.title}</p>
                <p className="text-xs text-slate-400 capitalize mt-1">{product.provider}</p>
                <p className="text-accent font-bold mt-1">
                  ${product.currentPrice?.toFixed(2) || '—'}
                </p>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selected.title}</h2>
                  <p className="text-sm text-slate-400 capitalize">{selected.provider}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="primary">Mín: ${selected.minPrice?.toFixed(2) || '—'}</Badge>
                  <Badge variant="warning">Máx: ${selected.maxPrice?.toFixed(2) || '—'}</Badge>
                  {selected.change !== 0 && (
                    <Badge variant={selected.change < 0 ? 'success' : 'danger'}>
                      {selected.change > 0 ? '+' : ''}{selected.change?.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-12"><LoadingSpinner /></div>
              ) : (
                <MiniLineChart prices={chartPrices} />
              )}
            </>
          ) : (
            <p className="text-slate-400 text-center py-12">Selecciona un producto</p>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Cambios de precio</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left py-2 px-4">Producto</th>
              <th className="text-left py-2 px-4">Proveedor</th>
              <th className="text-right py-2 px-4">Precio</th>
              <th className="text-right py-2 px-4">Cambio</th>
              <th className="text-left py-2 px-4">Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {products.flatMap((product) => {
              const rows = product.prices || []
              return rows.map((row, idx) => {
                const prev = idx > 0 ? rows[idx - 1].price : null
                const diff = prev !== null ? row.price - prev : 0
                const pct = prev ? ((diff / prev) * 100).toFixed(1) : 0
                return (
                  <tr key={`${product.identifier}-${idx}`} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium">{product.title}</td>
                    <td className="py-3 px-4 capitalize">{product.provider}</td>
                    <td className="py-3 px-4 text-right font-semibold">${row.price?.toFixed(2)}</td>
                    <td className={`py-3 px-4 text-right ${diff < 0 ? 'text-success' : diff > 0 ? 'text-danger' : 'text-slate-400'}`}>
                      {idx === 0 ? '—' : `${diff > 0 ? '+' : ''}$${diff.toFixed(2)} (${pct}%)`}
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(row.recordedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </td>
                  </tr>
                )
              })
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}
