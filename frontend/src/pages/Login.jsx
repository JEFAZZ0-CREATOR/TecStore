import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/store'
import { Input, Button, GlassCard } from '../components/common'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    try {
      setLoading(true)
      const res = await authAPI.login(formData)
      setToken(res.token)
      setUser(res.user)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
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
            <p className="text-slate-400">Bienvenido de vuelta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              Iniciar Sesión
              <FiArrowRight />
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-accent hover:text-accent-light font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Forgot Password */}
          <button className="mt-4 w-full text-center text-accent hover:text-accent-light text-sm">
            ¿Olvidaste tu contraseña?
          </button>
        </GlassCard>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-lg border border-accent/30 bg-accent/5 text-center text-sm text-slate-300"
        >
          Demo: usa cualquier credencial
        </motion.div>
      </motion.div>
    </div>
  )
}
