import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiShoppingCart, FiX, FiMinus, FiPlus } from 'react-icons/fi'
import { useCartStore } from '../store/store'
import { GlassCard, Button, EmptyState } from '../components/common'

export default function Cart() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  if (items.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <EmptyState
          icon={FiShoppingCart}
          title="Tu carrito está vacío"
          description="Explora nuestros productos y añade algunos a tu carrito"
          action={<Link to="/products" className="btn-primary">Seguir Comprando</Link>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-gradient">Mi Carrito</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <GlassCard className="p-4 flex gap-4">
                <img
                  src={item.image || 'https://via.placeholder.com/100'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <Link to={`/products/${item.productId}`} className="font-semibold hover:text-accent">
                    {item.name}
                  </Link>
                  <p className="text-sm text-slate-400 mt-1">${item.price} c/u</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="btn-icon"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="btn-icon"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gradient">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="btn-icon text-danger mt-2"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-20 h-fit"
        >
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-xl font-bold">Resumen del Pedido</h3>

            <div className="space-y-2 text-sm border-b border-slate-700 pb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="text-success">Gratis</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos:</span>
                <span>${(total * 0.16).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-gradient">${(total * 1.16).toFixed(2)}</span>
            </div>

            <Button
              variant="primary"
              className="w-full"
              loading={isCheckingOut}
              onClick={() => {
                setIsCheckingOut(true)
                // Simulate checkout
                setTimeout(() => setIsCheckingOut(false), 1000)
              }}
            >
              Proceder al Pago
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => clearCart()}
            >
              Vaciar Carrito
            </Button>

            <Link to="/products" className="block text-center text-accent hover:text-accent-light text-sm">
              Seguir comprando
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
