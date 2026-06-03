import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiHeart, FiX } from 'react-icons/fi'
import { favoritesAPI } from '../services/api'
import { useCartStore } from '../store/store'
import { ProductGrid } from '../components/product/ProductCard'
import { GlassCard, Button, EmptyState } from '../components/common'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await favoritesAPI.getAll()
      setFavorites(data.favorites || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (productId) => {
    try {
      await favoritesAPI.remove(productId)
      setFavorites(favorites.filter(fav => fav._id !== productId))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <EmptyState
          icon={FiHeart}
          title="No hay favoritos"
          description="Marca productos como favoritos para guardarlos aquí"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gradient">Mis Favoritos</h1>
        <span className="text-sm text-slate-400">{favorites.length} productos</span>
      </div>

      <ProductGrid
        products={favorites}
        loading={loading}
        onAddCart={addItem}
        onToggleFavorite={handleRemoveFavorite}
        favorites={favorites.map(f => f._id)}
      />
    </div>
  )
}
