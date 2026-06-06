import React, { useRef, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMenu, FiX, FiShoppingCart, FiSearch, FiUser, FiHeart } from 'react-icons/fi'
import { useAuthStore, useCartStore, useUiStore } from '../../store/store'

export const Header = () => {
  const { sidebarOpen, toggleSidebar, searchOpen, toggleSearch } = useUiStore()
  const { user, logout } = useAuthStore()
  const { itemCount } = useCartStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleEsc = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

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
            <div className="relative" ref={menuRef}>
              <button
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent rounded"
              >
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=64`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-accent"
                />
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </button>

              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={menuOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`absolute right-0 mt-2 w-56 bg-secondary border border-slate-700 rounded-lg shadow-neon transform origin-top-right ${menuOpen ? '' : 'pointer-events-none'}`}
              >
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-slate-700 rounded-t-lg">
                  Editar Perfil
                </Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-slate-700">
                  Ajustes
                </Link>
                <Link to="/preferences" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-slate-700">
                  Preferencias
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-slate-700">
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
            </div>
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
