import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiShoppingBag, FiShoppingCart, FiHeart, FiUser,
  FiTrendingUp, FiBarChart2, FiSettings, FiLogOut, FiMenu
} from 'react-icons/fi'
import { useAuthStore, useUiStore } from '../../store/store'

const menuItems = [
  { icon: FiHome, label: 'Inicio', path: '/' },
  { icon: FiShoppingBag, label: 'Productos', path: '/products' },
  { icon: FiShoppingCart, label: 'Carrito', path: '/cart' },
  { icon: FiHeart, label: 'Favoritos', path: '/favorites' },
  { icon: FiTrendingUp, label: 'Ofertas', path: '/deals' },
  { icon: FiBarChart2, label: 'Historial de Precios', path: '/price-history' },
]

const userMenuItems = [
  { icon: FiUser, label: 'Mi Perfil', path: '/profile' },
  { icon: FiShoppingBag, label: 'Historial de Compras', path: '/orders' },
  { icon: FiSettings, label: 'Configuración', path: '/settings' },
]

export const Sidebar = () => {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const { user, logout } = useAuthStore()

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        exit={{ x: -300 }}
        className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-secondary border-r border-slate-700 overflow-y-auto z-40 md:static md:translate-x-0 md:top-0 md:h-screen"
      >
        <div className="p-4 space-y-8">
          {/* Main Navigation */}
          <div>
            <h3 className="text-xs uppercase font-semibold text-slate-400 mb-3">Navegación</h3>
            <nav className="space-y-1">
              {menuItems.map(({ icon: Icon, label, path }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive(path)
                      ? 'bg-gradient-accent text-white shadow-neon'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Navigation */}
          {user && (
            <div>
              <h3 className="text-xs uppercase font-semibold text-slate-400 mb-3">Usuario</h3>
              <nav className="space-y-1">
                {userMenuItems.map(({ icon: Icon, label, path }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => window.innerWidth < 768 && toggleSidebar()}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive(path)
                        ? 'bg-gradient-accent text-white shadow-neon'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="border-t border-slate-700 pt-4 space-y-2">
            {user && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  logout()
                  window.location.href = '/login'
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-danger hover:bg-danger/10 rounded-lg transition-all"
              >
                <FiLogOut size={20} />
                <span>Cerrar Sesión</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
