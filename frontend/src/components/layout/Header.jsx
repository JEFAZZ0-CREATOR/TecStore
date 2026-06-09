import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiShoppingCart, FiSearch, FiHeart } from 'react-icons/fi'
import { useAuthStore, useCartStore, useUiStore } from '../../store/store'
import { useFavorites } from '../../hooks/useFavorites'
import { SearchWithSuggestions } from '../search/SearchWithSuggestions'

export const Header = () => {
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, searchOpen, toggleSearch } = useUiStore()
  const { user, logout } = useAuthStore()
  const { itemCount } = useCartStore()
  const { count: favoriteCount } = useFavorites()
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMobileSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  const handleHeaderSearchSubmit = (term) => {
    if (!term?.trim()) return
    setHeaderSearch('')
    setMobileSearchOpen(false)
    navigate(`/store?q=${encodeURIComponent(term.trim())}`)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-primary/80 border-b border-slate-700"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="relative w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:shadow-neon transition-shadow">
            TS
          </div>
          <span className="text-gradient font-bold hidden sm:inline">TecStore</span>
        </Link>

        {/* Search Bar — desktop */}
        <SearchWithSuggestions
          value={headerSearch}
          onChange={(e) => setHeaderSearch(e.target.value)}
          onSubmit={handleHeaderSearchSubmit}
          placeholder="Buscar productos, componentes..."
          className="flex-1 max-w-md hidden md:block"
        />

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search toggle — mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileSearchOpen(v => !v)}
            className="btn-icon md:hidden"
            aria-label="Buscar"
          >
            <FiSearch size={20} />
          </motion.button>

          {/* Favorites */}
          <Link to="/favorites" title="Favoritos">
            <motion.span whileTap={{ scale: 0.9 }} className="btn-icon relative inline-flex">
              <FiHeart size={20} />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </motion.span>
          </Link>

          {/* Cart */}
          <Link to="/cart" title="Carrito">
            <motion.span whileTap={{ scale: 0.9 }} className="btn-icon relative inline-flex">
              <FiShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </motion.span>
          </Link>

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
                  Historial de Compras
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

          {/* Sidebar toggle — mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="btn-icon md:hidden"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-slate-700"
          >
            <div className="px-4 py-3">
              <SearchWithSuggestions
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onSubmit={handleHeaderSearchSubmit}
                placeholder="Buscar productos..."
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
