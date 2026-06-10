import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiSearch, FiTrendingUp, FiZap, FiShield, FiArrowRight,
  FiStar, FiPackage, FiBarChart2, FiHeart, FiCheck,
  FiMonitor, FiCpu, FiHardDrive, FiSmartphone
} from 'react-icons/fi'

const GlowOrb = ({ color, size, top, left, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      background: color,
      width: size,
      height: size,
      top,
      left,
      opacity: 0.13,
      filter: 'blur(80px)',
    }}
    animate={{ y: [0, -30, 0], scale: [1, 1.12, 1], opacity: [0.1, 0.18, 0.1] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
)

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    whileHover={{ y: -6, scale: 1.02 }}
    className="relative p-6 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden group cursor-default"
    style={{ background: 'linear-gradient(145deg, rgba(20,20,60,0.92), rgba(13,13,30,0.97))' }}
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
      style={{ background: `radial-gradient(circle at 50% 50%, ${color}18, transparent 70%)` }}
    />
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <h3 className="text-lg font-bold text-white mb-2 font-display">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
)

const StatCard = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="text-center p-6 rounded-2xl border border-white/10 backdrop-blur-xl"
    style={{ background: 'linear-gradient(145deg, rgba(20,20,60,0.8), rgba(13,13,30,0.9))' }}
  >
    <div className="text-4xl font-bold text-gradient mb-1 font-display">{value}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </motion.div>
)

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-void"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Fixed Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(109,40,217,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(109,40,217,0.6) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Top glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% -8%, rgba(109,40,217,0.22) 0%, transparent 60%)',
          }}
        />
        <GlowOrb color="rgba(109,40,217,1)"  size="600px" top="-120px" left="-120px" delay={0}   />
        <GlowOrb color="rgba(59,130,246,1)"  size="500px" top="28%"   left="68%"   delay={2}   />
        <GlowOrb color="rgba(34,211,238,1)"  size="360px" top="68%"   left="12%"   delay={4}   />
        <GlowOrb color="rgba(124,58,237,1)"  size="260px" top="8%"    left="48%"   delay={1.5} />
      </div>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-neon"
            style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #3b82f6 60%, #22d3ee 100%)' }}
          >
            TS
          </div>
          <span className="text-xl font-bold text-gradient font-display">TecStore</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          {['#features', '#stats', '#cta'].map((href, i) => (
            <a key={i} href={href} className="hover:text-white transition-colors duration-200">
              {['Características', 'Estadísticas', 'Nosotros'][i]}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2 hidden sm:block"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 rounded-xl"
          >
            Registrarse <FiArrowRight size={13} />
          </button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-12 pb-24 flex flex-col lg:flex-row items-center gap-14">
        {/* Left: copy */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent-light text-xs font-semibold mb-6 uppercase tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            La mejor comparación de precios tech
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-tight mb-6 text-white"
          >
            Encuentra la{' '}
            <span className="text-gradient">mejor tecnología</span>
            {' '}al mejor precio
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            TecStore compara precios de tus productos tecnológicos favoritos en múltiples
            tiendas en tiempo real. Ahorra dinero, sigue el historial de precios y descubre
            las mejores ofertas del mercado.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button
              onClick={() => navigate('/register')}
              className="btn-primary px-8 py-3.5 text-base font-semibold flex items-center justify-center gap-2 rounded-xl"
            >
              Comenzar gratis <FiArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 text-base font-semibold border border-white/20 rounded-xl text-slate-200
                         hover:bg-white/5 hover:border-white/40 transition-all duration-200"
            >
              Ya tengo cuenta
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-5 justify-center lg:justify-start text-sm text-slate-500"
          >
            {['Sin costo', 'Datos en tiempo real', '5 tiendas comparadas'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <FiCheck size={13} className="text-success" /> {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right: animated product comparison card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 relative flex items-center justify-center w-full max-w-md lg:max-w-none"
        >
          <div className="relative w-full max-w-[420px]">
            {/* Main card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative rounded-2xl border border-white/15 backdrop-blur-xl p-5 shadow-glass-lg"
              style={{ background: 'linear-gradient(145deg, rgba(20,20,65,0.95), rgba(13,13,35,0.98))' }}
            >
              {/* Product header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <FiCpu size={18} className="text-accent-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">Intel Core i9-14900K</p>
                  <p className="text-slate-500 text-xs">Procesador · 24 núcleos</p>
                </div>
                <span className="shrink-0 text-xs bg-success/20 text-success border border-success/30 px-2 py-0.5 rounded-full font-medium">
                  −12%
                </span>
              </div>

              {/* Price comparison rows */}
              <div className="space-y-2">
                {[
                  { store: 'Amazon',       price: '$8,499', best: true  },
                  { store: 'MercadoLibre', price: '$8,799', best: false },
                  { store: 'Cyberpuerta',  price: '$9,199', best: false },
                ].map((item, i) => (
                  <motion.div
                    key={item.store}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                    className={`flex items-center justify-between p-2.5 rounded-xl ${
                      item.best
                        ? 'bg-success/10 border border-success/30'
                        : 'bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-slate-400 text-xs font-medium">{item.store}</span>
                    <div className="flex items-center gap-2">
                      {item.best && (
                        <span className="text-xs text-warning font-semibold">Mejor precio</span>
                      )}
                      <span className={`font-bold text-sm ${item.best ? 'text-success' : 'text-slate-300'}`}>
                        {item.price}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Card footer */}
              <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                <span className="text-slate-600 text-xs">Actualizado hace 2 min</span>
                <div className="flex items-center gap-1 text-accent-light text-xs hover:text-white cursor-pointer transition-colors">
                  <FiTrendingUp size={12} />
                  <span>Ver historial</span>
                </div>
              </div>
            </motion.div>

            {/* Floating badge: savings */}
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-4 -right-4 md:-right-8 bg-surface-raised border border-success/40 rounded-xl px-3 py-2 shadow-glass backdrop-blur-xl"
            >
              <p className="text-success font-bold text-sm">¡Ahorra $700!</p>
              <p className="text-slate-500 text-xs">vs precio más alto</p>
            </motion.div>

            {/* Floating badge: price drop alert */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -bottom-4 -left-4 md:-left-8 bg-surface-raised border border-accent/40 rounded-xl px-3 py-2 shadow-glass backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <FiTrendingUp size={14} className="text-accent-light" />
                <div>
                  <p className="text-white text-xs font-semibold">Precio bajó</p>
                  <p className="text-slate-500 text-xs">Esta semana</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-accent-light text-sm font-semibold uppercase tracking-widest mb-3 block">
            Características
          </span>
          <h2 className="text-4xl font-bold font-display text-white mb-4">
            ¿Por qué elegir <span className="text-gradient">TecStore</span>?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Todo lo que necesitas para tomar la mejor decisión de compra en tecnología, en un solo lugar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FiSearch,
              title: 'Comparación en tiempo real',
              description:
                'Compara precios de Amazon, MercadoLibre, Cyberpuerta, DDTech y Newegg al instante. Siempre la información más actualizada.',
              color: '#6d28d9',
              delay: 0,
            },
            {
              icon: FiTrendingUp,
              title: 'Historial de precios',
              description:
                'Visualiza cómo ha cambiado el precio a lo largo del tiempo y decide el momento perfecto para comprar.',
              color: '#3b82f6',
              delay: 0.1,
            },
            {
              icon: FiZap,
              title: 'Ofertas exclusivas',
              description:
                'Descubre las mejores promociones y descuentos en los productos tecnológicos que más te interesan.',
              color: '#22d3ee',
              delay: 0.2,
            },
            {
              icon: FiHeart,
              title: 'Lista de favoritos',
              description:
                'Guarda tus productos preferidos y monitorea sus precios de forma sencilla desde un solo panel.',
              color: '#ef4444',
              delay: 0.3,
            },
            {
              icon: FiShield,
              title: 'Datos confiables',
              description:
                'Información verificada y actualizada automáticamente cada pocos minutos directamente de las tiendas.',
              color: '#10b981',
              delay: 0.4,
            },
            {
              icon: FiBarChart2,
              title: 'Análisis inteligente',
              description:
                'Tendencias de precios, comparativas detalladas y estadísticas avanzadas para tomar mejores decisiones.',
              color: '#f59e0b',
              delay: 0.5,
            },
          ].map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div
          className="relative rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden p-10 md:p-14"
          style={{
            background: 'linear-gradient(145deg, rgba(109,40,217,0.14), rgba(59,130,246,0.08))',
          }}
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(109,40,217,1) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(59,130,246,1) 0%, transparent 50%)
              `,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold font-display text-white">TecStore en números</h2>
            <p className="text-slate-500 mt-2 text-sm">Nuestra plataforma, de un vistazo</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { value: '500+',  label: 'Productos disponibles', delay: 0    },
              { value: '5',     label: 'Tiendas comparadas',    delay: 0.1  },
              { value: '24/7',  label: 'Actualizaciones',       delay: 0.2  },
              { value: '100%',  label: 'Gratis para usuarios',  delay: 0.3  },
            ].map((s) => (
              <StatCard key={s.value} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold font-display text-white mb-3">
            Todo tipo de <span className="text-gradient">tecnología</span>
          </h2>
          <p className="text-slate-400 text-sm">Desde procesadores hasta smartphones, lo comparamos todo.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FiMonitor,    label: 'Monitores',      color: '#6d28d9' },
            { icon: FiCpu,        label: 'Procesadores',   color: '#3b82f6' },
            { icon: FiHardDrive,  label: 'Almacenamiento', color: '#22d3ee' },
            { icon: FiSmartphone, label: 'Smartphones',    color: '#10b981' },
          ].map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative p-6 rounded-2xl border border-white/10 flex flex-col items-center gap-3 cursor-default overflow-hidden group"
              style={{ background: 'linear-gradient(145deg, rgba(20,20,60,0.8), rgba(13,13,30,0.9))' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 80%, ${cat.color}22, transparent 70%)`,
                }}
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}
              >
                <cat.icon size={22} style={{ color: cat.color }} />
              </div>
              <span className="text-white font-medium text-sm">{cat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="cta" className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-accent/30 backdrop-blur-xl overflow-hidden p-10 md:p-16"
          style={{
            background:
              'linear-gradient(145deg, rgba(109,40,217,0.18), rgba(59,130,246,0.1), rgba(34,211,238,0.06))',
          }}
        >
          {/* Deco orbs */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(109,40,217,0.5), transparent)',
              filter: 'blur(60px)',
              opacity: 0.25,
            }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.5), transparent)',
              filter: 'blur(60px)',
              opacity: 0.2,
            }}
          />

          {/* Logo badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-neon-lg"
            style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #3b82f6 60%, #22d3ee 100%)' }}
          >
            TS
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold font-display text-white mb-4 leading-tight">
            ¿Listo para ahorrar en tecnología?
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Únete a TecStore y comienza a comparar precios, rastrear ofertas y tomar mejores
            decisiones de compra hoy mismo. Es completamente gratis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="btn-primary px-10 py-4 text-base font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              Crear cuenta gratis <FiArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 text-base font-semibold border border-white/20 rounded-xl text-slate-200
                         hover:bg-white/5 hover:border-white/40 transition-all duration-200"
            >
              Iniciar sesión
            </button>
          </div>

          {/* Perks */}
          <div className="mt-8 flex flex-wrap items-center gap-6 justify-center text-sm text-slate-500">
            {[
              'Sin tarjeta de crédito',
              'Sin anuncios',
              'Datos actualizados en tiempo real',
            ].map((perk) => (
              <span key={perk} className="flex items-center gap-1.5">
                <FiStar size={12} className="text-warning" /> {perk}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #3b82f6)' }}
            >
              TS
            </div>
            <span className="font-semibold text-slate-500">TecStore</span>
          </div>
          <p>© 2025 TecStore — Todos los derechos reservados.</p>
          <div className="flex gap-6">
            {['Privacidad', 'Términos', 'Contacto'].map((l) => (
              <a key={l} href="#" className="hover:text-slate-400 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
