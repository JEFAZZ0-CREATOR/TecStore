import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiLineChart, FiTrendingDown, FiCalendar } from 'react-icons/fi'
import { priceHistoryAPI } from '../services/api'
import { GlassCard, LoadingSpinner } from '../components/common'
import { format, subDays } from 'date-fns'

export default function PriceHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const loadPriceHistory = async (productId) => {
    try {
      setLoading(true)
      const data = await priceHistoryAPI.getHistory(productId)
      setHistory(data.history || [])
    } catch (error) {
      console.error('Error loading price history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient flex items-center gap-3">
          <FiLineChart /> Historial de Precios
        </h1>
        <p className="text-slate-400 mt-2">
          Sigue la evolución de precios de tus productos favoritos
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingDown className="text-success text-2xl" />
            <span className="text-sm text-slate-400">Precio Más Bajo</span>
          </div>
          <p className="text-2xl font-bold text-success">$999.99</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiLineChart className="text-warning text-2xl" />
            <span className="text-sm text-slate-400">Precio Promedio</span>
          </div>
          <p className="text-2xl font-bold text-warning">$1,299.99</p>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FiCalendar className="text-accent text-2xl" />
            <span className="text-sm text-slate-400">Días Rastreados</span>
          </div>
          <p className="text-2xl font-bold">30</p>
        </GlassCard>
      </div>

      {/* Price History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FiLineChart /> Gráfico de Precios
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="h-64 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700">
            <p className="text-slate-400">Selecciona un producto para ver el historial de precios</p>
          </div>
        )}
      </motion.div>

      {/* History Table */}
      <GlassCard className="p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Cambios de Precio</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-4">Producto</th>
              <th className="text-right py-2 px-4">Precio Anterior</th>
              <th className="text-right py-2 px-4">Precio Actual</th>
              <th className="text-right py-2 px-4">Cambio</th>
              <th className="text-left py-2 px-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/50">
                <td className="py-3 px-4">
                  <p className="font-semibold">Laptop Gaming Pro</p>
                </td>
                <td className="text-right py-3 px-4">$1,499.99</td>
                <td className="text-right py-3 px-4">$1,299.99</td>
                <td className="text-right py-3 px-4 text-success font-bold">-$200 (-13%)</td>
                <td className="py-3 px-4">Hace 3 días</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  )
}
