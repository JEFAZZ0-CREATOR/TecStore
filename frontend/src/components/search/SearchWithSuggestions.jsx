import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiClock, FiTrendingUp } from 'react-icons/fi'
import { searchAPI } from '../../services/api'

const RECENT_KEY = 'tecstore_recent_searches'
const MAX_RECENT = 5

export const SearchWithSuggestions = ({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Buscar productos...',
  navigateOnSubmit = false,
  autoFocus = false,
  className = '',
}) => {
  const navigate = useNavigate()
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    try {
      setRecentSearches(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'))
    } catch { /* noop */ }
  }, [])

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchAPI.suggestions(value)
        setSuggestions(Array.isArray(data) ? data.slice(0, 6) : [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const saveRecent = (term) => {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter(r => r !== term)].slice(0, MAX_RECENT)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }

  const handleSelect = (term) => {
    if (!term?.trim()) return
    saveRecent(term)
    onChange?.({ target: { value: term } })
    setIsOpen(false)
    setActiveIndex(-1)
    if (navigateOnSubmit) {
      navigate(`/store?q=${encodeURIComponent(term)}`)
    } else {
      onSubmit?.(term)
    }
  }

  const allItems = [
    ...(!value ? recentSearches.map(t => ({ type: 'recent', text: t })) : []),
    ...suggestions.map(s => ({
      type: 'suggestion',
      text: typeof s === 'string' ? s : (s.title || s.name || ''),
    })),
  ]

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && allItems[activeIndex]) {
        handleSelect(allItems[activeIndex].text)
      } else {
        handleSelect(value)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const removeRecent = (e, term) => {
    e.stopPropagation()
    const updated = recentSearches.filter(r => r !== term)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }

  const showDropdown = isOpen && allItems.length > 0
  const recentCount = !value ? recentSearches.length : 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-accent pointer-events-none"
          size={16}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          className="input-field pl-10 pr-8 w-full"
        />
        {value && !loading && (
          <button
            type="button"
            onClick={() => {
              onChange?.({ target: { value: '' } })
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <FiX size={14} />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-secondary border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {recentCount > 0 && (
              <div className="py-1">
                <p className="px-4 pt-2 pb-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Búsquedas recientes
                </p>
                {recentSearches.map((term, i) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelect(term)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      activeIndex === i
                        ? 'bg-slate-700 text-white'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <FiClock size={13} className="text-slate-500 flex-shrink-0" />
                    <span className="flex-1 truncate">{term}</span>
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => removeRecent(e, term)}
                      className="text-slate-600 hover:text-slate-300 p-0.5 rounded"
                    >
                      <FiX size={11} />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="py-1">
                {recentCount > 0 && (
                  <div className="mx-4 border-t border-slate-700/60 my-1" />
                )}
                <p className="px-4 pt-2 pb-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Sugerencias
                </p>
                {suggestions.map((s, i) => {
                  const text = typeof s === 'string' ? s : (s.title || s.name || '')
                  const idx = recentCount + i
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelect(text)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        activeIndex === idx
                          ? 'bg-slate-700 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <FiTrendingUp size={13} className="text-accent flex-shrink-0" />
                      <span className="flex-1 truncate">{text}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchWithSuggestions
