import { create } from 'zustand'

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

export const useCartStore = create((set) => ({
  items: [],
  total: 0,
  itemCount: 0,

  addItem: (product) => set((state) => {
    const existingItem = state.items.find(item => item.productId === product.productId)
    let newItems
    
    if (existingItem) {
      newItems = state.items.map(item =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + (product.quantity || 1) }
          : item
      )
    } else {
      newItems = [...state.items, { ...product, quantity: product.quantity || 1 }]
    }

    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items: newItems,
      total: newTotal,
      itemCount: newItemCount,
    }
  }),

  removeItem: (productId) => set((state) => {
    const newItems = state.items.filter(item => item.productId !== productId)
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items: newItems,
      total: newTotal,
      itemCount: newItemCount,
    }
  }),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return useCartStore.getState().removeItem(productId)
    }

    const newItems = state.items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    )
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

    return {
      items: newItems,
      total: newTotal,
      itemCount: newItemCount,
    }
  }),

  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
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
    notifications: state.notifications.filter(n => n.id !== id),
  })),
}))

export const useFiltersStore = create((set) => ({
  filters: {},
  sortBy: 'relevance',

  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearFilters: () => set({ filters: {}, sortBy: 'relevance' }),
}))
