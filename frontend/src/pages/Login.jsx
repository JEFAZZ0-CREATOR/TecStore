import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiShield } from 'react-icons/fi'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/store'

const ADMIN_EMAILS = [
  'luischv1979@gmail.com',
  'derek.vallejo.alp@cbtis258.edu.mx',
  'orlando.torres.alp@cbtis258.edu.mx',
  'juanaldair.ramos.alp@cbtis258.edu.mx',
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const GlowOrb = ({ color, size, top, left, delay }) => (
  <motion.div className="absolute rounded-full pointer-events-none"
    style={{ background: color, width: size, height: size, top, left, opacity: 0.12, filter: 'blur(70px)' }}
    animate={{ y: [0, -20, 0], opacity: [0.1, 0.18, 0.1] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
)

function FieldWrapper({ label, error, success, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-danger font-medium">
            <FiAlertCircle size={11} /> {error}
          </motion.p>
        )}
        {success && !error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs text-success font-medium">
            <FiCheckCircle size={11} /> {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Login() {
  const [formData, setFormData]     = useState({ email: '', password: '' })
  const [touched, setTouched]       = useState({ email: false, password: false })
  const [showPass, setShowPass]     = useState(false)
  const [serverError, setServerErr] = useState(null)
  const [loading, setLoading]       = useState(false)
  const navigate  = useNavigate()
  const { setUser, setToken } = useAuthStore()

  // Per-field validation
  const errors = {
    email: touched.email
      ? !formData.email.trim()       ? 'El correo es requerido'
      : !emailRegex.test(formData.email) ? 'Ingresa un correo electrónico válido'
      : null
      : null,
    password: touched.password
      ? !formData.password           ? 'La contraseña es requerida'
      : formData.password.length < 6 ? 'Mínimo 6 caracteres'
      : null
      : null,
  }

  const emailOk    = touched.email    && !errors.email    && formData.email
  const passwordOk = touched.password && !errors.password && formData.password

  const isFormValid = emailRegex.test(formData.email) && formData.password.length >= 6

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setServerErr(null)
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!isFormValid) return

    setServerErr(null)
    setLoading(true)
    try {
      const res = await authAPI.login({ email: formData.email.trim().toLowerCase(), password: formData.password })
      setToken(res.token)
      setUser(res.user)
      const email   = (res.user?.email ?? '').toLowerCase()
      const isAdmin = res.user?.role === 'admin' || ADMIN_EMAILS.includes(email)
      navigate(isAdmin ? '/admin' : '/home')
    } catch (err) {
      const msg = err.response?.data?.message || ''
      if (msg.toLowerCase().includes('contraseña') || msg.toLowerCase().includes('password')) {
        setServerErr('Contraseña incorrecta. Verifica e intenta de nuevo.')
      } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('usuario')) {
        setServerErr('No existe una cuenta con ese correo.')
      } else {
        setServerErr(msg || 'Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(109,40,217,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(109,40,217,.5) 1px,transparent 1px)`,
            backgroundSize: '55px 55px',
          }}
        />
        <GlowOrb color="rgba(109,40,217,1)" size="500px" top="-100px" left="-80px"   delay={0}   />
        <GlowOrb color="rgba(59,130,246,1)" size="400px" top="50%"    left="65%"     delay={2.5} />
        <GlowOrb color="rgba(34,211,238,1)" size="280px" top="75%"    left="5%"      delay={4}   />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/12 shadow-glass-lg overflow-hidden"
          style={{ background: 'linear-gradient(145deg,rgba(18,18,50,.97),rgba(10,10,28,.99))' }}>

          {/* Top accent bar */}
          <div className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg,#6d28d9,#3b82f6,#22d3ee)' }} />

          <div className="px-8 pt-8 pb-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl shadow-neon-lg"
                style={{ background: 'linear-gradient(135deg,#6d28d9 0%,#3b82f6 60%,#22d3ee 100%)' }}
              >
                TS
              </motion.div>
              <h1 className="text-3xl font-bold font-display text-white mb-1">Bienvenido</h1>
              <p className="text-slate-400 text-sm">Inicia sesión en tu cuenta de TecStore</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <FieldWrapper
                label="Correo electrónico"
                error={errors.email}
                success={emailOk ? 'Correo válido' : null}
              >
                <div className="relative">
                  <FiMail size={15}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      errors.email ? 'text-danger' : emailOk ? 'text-success' : 'text-slate-500'
                    }`}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 bg-white/5
                                border transition-all duration-200 focus:outline-none focus:ring-2
                                ${errors.email
                                  ? 'border-danger/60 focus:border-danger focus:ring-danger/20'
                                  : emailOk
                                  ? 'border-success/60 focus:border-success focus:ring-success/20'
                                  : 'border-white/12 focus:border-accent/60 focus:ring-accent/15 hover:border-white/20'
                                }`}
                  />
                  {emailOk && (
                    <FiCheckCircle size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success" />
                  )}
                </div>
              </FieldWrapper>

              {/* Password */}
              <FieldWrapper
                label="Contraseña"
                error={errors.password}
                success={passwordOk ? 'Contraseña válida' : null}
              >
                <div className="relative">
                  <FiLock size={15}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                      errors.password ? 'text-danger' : passwordOk ? 'text-success' : 'text-slate-500'
                    }`}
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder-slate-500 bg-white/5
                                border transition-all duration-200 focus:outline-none focus:ring-2
                                ${errors.password
                                  ? 'border-danger/60 focus:border-danger focus:ring-danger/20'
                                  : passwordOk
                                  ? 'border-success/60 focus:border-success focus:ring-success/20'
                                  : 'border-white/12 focus:border-accent/60 focus:ring-accent/15 hover:border-white/20'
                                }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {formData.password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[6, 8, 12].map((len, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        formData.password.length >= len
                          ? i === 0 ? 'bg-danger' : i === 1 ? 'bg-warning' : 'bg-success'
                          : 'bg-white/10'
                      }`} />
                    ))}
                    <span className="text-[10px] text-slate-500 shrink-0 ml-1">
                      {formData.password.length < 6 ? 'Débil' : formData.password.length < 8 ? 'Regular' : formData.password.length < 12 ? 'Buena' : 'Fuerte'}
                    </span>
                  </div>
                )}
              </FieldWrapper>

              {/* Remember me + forgot */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-accent" />
                  Recordarme
                </label>
                <button type="button" className="text-accent hover:text-accent-light transition-colors font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Server error */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-danger/12 border border-danger/30 text-sm"
                  >
                    <FiAlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                    <p className="text-danger leading-snug">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>Iniciar sesión <FiArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-white/8 text-center">
              <p className="text-slate-400 text-sm">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-accent hover:text-accent-light font-semibold transition-colors">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Admin hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600"
        >
          <FiShield size={11} />
          <span>Conexión segura · TecStore 2025</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
