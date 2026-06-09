import { create } from 'zustand'
import { normalizeCartItem } from '../utils/product'

const CART_STORAGE_KEY = 'tecstore_cart'

const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return { items: [], total: 0, itemCount: 0 }
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed.items) ? parsed.items : []
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    return { items, total, itemCount }
  } catch {
    return { items: [], total: 0, itemCount: 0 }
  }
}

const persistCart = (state) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
    items: state.items,
    total: state.total,
    itemCount: state.itemCount,
  }))
}

const initialCart = loadCartFromStorage()

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
  clearError: () => set({ error: null }),
}))

export const useCartStore = create((set, get) => ({
  items: initialCart.items,
  total: initialCart.total,
  itemCount: initialCart.itemCount,

  addItem: (product) => set((state) => {
    const normalized = normalizeCartItem(product)
    const existingItem = state.items.find((item) => item.productId === normalized.productId)
    let newItems

    if (existingItem) {
      newItems = state.items.map((item) =>
        item.productId === normalized.productId
          ? { ...item, quantity: item.quantity + normalized.quantity }
          : item
      )
    } else {
      newItems = [...state.items, normalized]
    }

    const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
    const next = { items: newItems, total: newTotal, itemCount: newItemCount }
    persistCart(next)
    return next
  }),

  removeItem: (productId) => set((state) => {
    const newItems = state.items.filter((item) => item.productId !== productId)
    const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
    const next = { items: newItems, total: newTotal, itemCount: newItemCount }
    persistCart(next)
    return next
  }),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set((state) => {
      const newItems = state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const next = { items: newItems, total: newTotal, itemCount: newItemCount }
      persistCart(next)
      return next
    })
  },

  clearCart: () => {
    const next = { items: [], total: 0, itemCount: 0 }
    persistCart(next)
    set(next)
  },
}))

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  searchOpen: false,
  notificationOpen: false,
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  setNotificationOpen: (open) => set({ notificationOpen: open }),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }],
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
}))

export const useFiltersStore = create((set) => ({
  filters: {},
  sortBy: 'relevance',

  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearFilters: () => set({ filters: {}, sortBy: 'relevance' }),
}))
