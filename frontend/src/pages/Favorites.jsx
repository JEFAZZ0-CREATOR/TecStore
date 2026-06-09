import React, { useEffect, useState } from 'react'
import { FiHeart } from 'react-icons/fi'
import { favoritesAPI } from '../services/api'
import { useCartStore } from '../store/store'
import { useFavorites } from '../hooks/useFavorites'
import { favoriteToProduct } from '../utils/product'
import { ProductGrid } from '../components/product/ProductCard'
import { EmptyState } from '../components/common'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite, refresh } = useFavorites()

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await favoritesAPI.getAll()
      const list = Array.isArray(data) ? data : (data?.favorites || [])
      setFavorites(list.map(favoriteToProduct))
      await refresh()
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (product) => {
    await toggleFavorite(product)
    setFavorites((prev) => prev.filter((fav) => fav.identifier !== product.identifier))
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
          description="Marca productos con el corazón en la tienda para guardarlos aquí"
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
        isFavoriteFn={isFavorite}
      />
    </div>
  )
}
