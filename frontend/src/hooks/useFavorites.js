import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { favoritesAPI } from '../services/api'
import { getProductIdentifier } from '../utils/product'

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const data = await favoritesAPI.getAll()
      const list = Array.isArray(data) ? data : (data?.favorites || [])
      setFavoriteIds(new Set(list.map((fav) => fav.identifier || fav.productData?.id || fav._id)))
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isFavorite = useCallback(
    (product) => favoriteIds.has(getProductIdentifier(product)),
    [favoriteIds]
  )

  const toggleFavorite = useCallback(async (product) => {
    const identifier = getProductIdentifier(product)
    if (!identifier) return

    const currentlyFavorite = favoriteIds.has(identifier)

    try {
      if (currentlyFavorite) {
        await favoritesAPI.remove(identifier)
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(identifier)
          return next
        })
        toast.success('Eliminado de favoritos')
      } else {
        await favoritesAPI.add({
          identifier,
          productId: product._id || product.id || null,
          productData: {
            id: product.id || product._id || identifier,
            title: product.title || product.name,
            name: product.name || product.title,
            price: product.price,
            image: product.image,
            url: product.url,
            provider: product.provider,
            category: product.category,
            rating: product.rating,
          },
        })
        setFavoriteIds((prev) => new Set(prev).add(identifier))
        toast.success('Añadido a favoritos')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      const msg = error.response?.data?.message || 'No se pudo actualizar favoritos'
      toast.error(msg)
    }
  }, [favoriteIds])

  return {
    favoriteIds,
    loading,
    refresh,
    isFavorite,
    toggleFavorite,
    count: favoriteIds.size,
  }
}
