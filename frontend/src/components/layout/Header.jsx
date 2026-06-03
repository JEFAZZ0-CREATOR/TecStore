import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMenu, FiX, FiShoppingCart, FiSearch, FiUser, FiHeart } from 'react-icons/fi'
import { useAuthStore, useCartStore, useUiStore } from '../../store/store'

export const Header = () => {
  const { sidebarOpen, toggleSidebar, searchOpen, toggleSearch } = useUiStore()
  const { user, logout } = useAuthStore()
  const { itemCount } = useCartStore()

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-primary/80 border-b border-slate-700"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:shadow-neon transition-shadow">
            TS
          </div>
          <span className="text-gradient font-bold hidden sm:inline">TecStore</span>
        </Link>

        {/* Search Bar */}
        <motion.div
          className="flex-1 max-w-md hidden md:block mx-4"
          whileFocus={{ scale: 1.02 }}
        >
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="input-field pl-10 w-full"
            />
          </div>
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search Mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSearch}
            className="btn-icon md:hidden"
          >
            <FiSearch size={20} />
          </motion.button>

          {/* Favorites */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="btn-icon relative"
            title="Favoritos"
          >
            <FiHeart size={20} />
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </motion.button>

          {/* Cart */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="btn-icon relative"
            title="Carrito"
          >
            <FiShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </motion.button>

          {/* User Menu */}
          {user ? (
            <motion.div className="relative group">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="btn-icon flex items-center gap-2"
              >
                <FiUser size={20} />
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </motion.button>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-secondary border border-slate-700 rounded-lg shadow-neon opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
              >
                <Link to="/profile" className="block px-4 py-2 hover:bg-slate-700 rounded-t-lg">
                  Mi Perfil
                </Link>
                <Link to="/orders" className="block px-4 py-2 hover:bg-slate-700">
                  Mis Órdenes
                </Link>
                <button
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700 rounded-b-lg text-danger"
                >
                  Cerrar Sesión
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <Link to="/login" className="btn-primary text-sm">
              Iniciar Sesión
            </Link>
          )}

          {/* Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="btn-icon md:hidden"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
