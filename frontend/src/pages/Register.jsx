import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { authAPI } from '../services/api'
import { Input, Button, GlassCard } from '../components/common'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)
      const res = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">TecStore</h1>
            <p className="text-slate-400">Crea tu cuenta hoy</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Nombre Completo</label>
              <Input
                icon={FiUser}
                type="text"
                name="name"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Email</label>
              <Input
                icon={FiMail}
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Contraseña</label>
              <Input
                icon={FiLock}
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Confirmar Contraseña</label>
              <Input
                icon={FiLock}
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-danger/20 border border-danger text-danger rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button
              variant="primary"
              type="submit"
              loading={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              Crear Cuenta
              <FiArrowRight />
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-accent hover:text-accent-light font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-4 text-xs text-slate-500 text-center">
            Al registrarte, aceptas nuestros{' '}
            <button className="text-accent hover:text-accent-light">Términos de Servicio</button>
          </p>
        </GlassCard>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-lg border border-accent/30 bg-accent/5 text-center text-sm text-slate-300"
        >
          Obtén 10% de descuento en tu primer compra
        </motion.div>
      </motion.div>
    </div>
  )
}
