import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiGrid, FiUsers, FiShoppingBag, FiLogOut, FiMenu, FiX,
  FiShield, FiChevronRight, FiBox, FiTrendingUp, FiActivity,
  FiExternalLink
} from 'react-icons/fi'
import { useAuthStore } from '../../store/store'
import AdminDashboard  from './AdminDashboard'
import AdminUsers      from './AdminUsers'
import AdminOrders     from './AdminOrders'
import AdminProducts   from './AdminProducts'
import AdminAnalytics  from './AdminAnalytics'
import AdminActivity   from './AdminActivity'
import { Toaster } from 'react-hot-toast'

const TABS = [
  { id: 'dashboard', label: 'Dashboard',   icon: FiGrid,        section: 'General'    },
  { id: 'analytics', label: 'Analíticas',  icon: FiTrendingUp,  section: 'General'    },
  { id: 'activity',  label: 'Actividad',   icon: FiActivity,    section: 'General'    },
  { id: 'users',     label: 'Usuarios',    icon: FiUsers,       section: 'Gestión'    },
  { id: 'orders',    label: 'Órdenes',     icon: FiShoppingBag, section: 'Gestión'    },
  { id: 'products',  label: 'Productos',   icon: FiBox,         section: 'Gestión'    },
]

const SECTIONS = ['General', 'Gestión']

const GlowOrb = ({ color, size, top, left, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ background: color, width: size, height: size, top, left, opacity: 0.1, filter: 'blur(80px)' }}
    animate={{ y: [0, -20, 0], opacity: [0.08, 0.14, 0.08] }}
    transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
)

export default function AdminPanel() {
  const [tab, setTab]        = useState('dashboard')
  const [sidebarOpen, setSB] = useState(false)
  const { user, logout }     = useAuthStore()
  const navigate             = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const currentTab = TABS.find(t => t.id === tab)

  const SidebarContent = ({ mobile = false }) => (
    <aside
      className={`${mobile ? 'w-full' : 'w-64 min-h-screen'} flex flex-col border-r border-white/8`}
      style={{ background: 'rgba(8,8,22,.99)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-neon shrink-0"
          style={{ background: 'linear-gradient(135deg,#6d28d9 0%,#3b82f6 60%,#22d3ee 100%)' }}
        >
          TS
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm font-display leading-none">TecStore</p>
          <p className="text-accent-light text-xs flex items-center gap-1 mt-0.5">
            <FiShield size={9} /> Panel de Admin
          </p>
        </div>
        {mobile && (
          <button onClick={() => setSB(false)}
            className="ml-auto text-slate-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {SECTIONS.map(section => (
          <div key={section} className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              {section}
            </p>
            <div className="space-y-0.5">
              {TABS.filter(t => t.section === section).map(({ id, label, icon: Icon }) => {
                const active = tab === id
                return (
                  <button
                    key={id}
                    onClick={() => { setTab(id); setSB(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={active ? {
                      background: 'linear-gradient(135deg,rgba(109,40,217,.28),rgba(59,130,246,.18))',
                      border: '1px solid rgba(109,40,217,.35)',
                    } : {}}
                  >
                    <Icon size={16} className={active ? 'text-accent-light' : ''} />
                    <span>{label}</span>
                    {active && <FiChevronRight size={12} className="ml-auto opacity-50" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: user + actions */}
      <div className="px-3 py-3 border-t border-white/8 space-y-1">
        {/* Go to store */}
        <button
          onClick={() => navigate('/products')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400
                     hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <FiExternalLink size={15} />
          <span>Ir a la tienda</span>
        </button>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-8 h-8 object-cover" />
                : user.name?.[0]?.toUpperCase() ?? '?'
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate leading-none">{user.name}</p>
              <p className="text-slate-500 text-[10px] truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400
                     hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <FiLogOut size={15} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-void relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: `linear-gradient(rgba(109,40,217,.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(109,40,217,.6) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <GlowOrb color="rgba(109,40,217,1)" size="500px" top="-80px"  left="-80px" delay={0} />
        <GlowOrb color="rgba(59,130,246,1)" size="400px" top="60%"    left="70%"   delay={3} />
        <GlowOrb color="rgba(34,211,238,1)" size="300px" top="40%"    left="-10%"  delay={5} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex relative z-10 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(7,7,26,.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSB(false)}
          >
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-64 h-full"
              onClick={e => e.stopPropagation()}
            >
              <SidebarContent mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-5 md:px-7 py-3.5 border-b border-white/8 shrink-0"
          style={{ background: 'rgba(8,8,22,.92)', backdropFilter: 'blur(14px)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSB(true)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400
                         hover:text-white hover:bg-white/10 transition-all"
            >
              <FiMenu size={18} />
            </button>
            <div>
              <h1 className="text-white font-bold font-display text-base leading-none flex items-center gap-2">
                {currentTab && <currentTab.icon size={16} className="text-accent-light" />}
                {currentTab?.label}
              </h1>
              <p className="text-slate-600 text-xs mt-0.5 hidden sm:block">
                TecStore · Panel de administración
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-accent-light bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full font-medium">
              <FiShield size={10} /> Administrador
            </span>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
            >
              <FiExternalLink size={12} />
              <span className="hidden sm:inline">Ver tienda</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 md:px-7 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {tab === 'dashboard' && <AdminDashboard />}
              {tab === 'analytics' && <AdminAnalytics />}
              {tab === 'activity'  && <AdminActivity />}
              {tab === 'users'     && <AdminUsers />}
              {tab === 'orders'    && <AdminOrders />}
              {tab === 'products'  && <AdminProducts />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}
