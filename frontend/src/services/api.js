import axios from 'axios'
import { useAuthStore } from '../store/store'

const API = axios.create({ 
  baseURL: 'http://127.0.0.1:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Token management
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const logout = useAuthStore.getState().logout
      if (logout) logout()
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const unwrapResponse = (r) => r.data?.data ?? r.data

// AUTH ENDPOINTS
export const authAPI = {
  register: (payload) => API.post('/auth/register', payload).then(r => r.data.data),
  login: (payload) => API.post('/auth/login', payload).then(r => r.data.data),
  logout: () => localStorage.removeItem('token'),
}

// USERS ENDPOINTS
export const usersAPI = {
  getCurrentUser: () => API.get('/users/me').then(unwrapResponse),
  updateProfile: (payload) => API.put('/users/me', payload).then(unwrapResponse),
  uploadAvatar: (formData) => API.put('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(unwrapResponse),
  getProfile: (userId) => API.get(`/users/${userId}`).then(unwrapResponse),
}

// PRODUCTS ENDPOINTS
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }).then(unwrapResponse),
  getById: (id) => API.get(`/products/${id}`).then(unwrapResponse),
  create: (payload) => API.post('/products', payload).then(unwrapResponse),
  update: (id, payload) => API.put(`/products/${id}`, payload).then(unwrapResponse),
  delete: (id) => API.delete(`/products/${id}`).then(unwrapResponse),
}

// SEARCH ENDPOINTS
export const searchAPI = {
  search: (query, filters = {}) => API.get('/search', { 
    params: { q: query, ...filters } 
  }).then(r => {
    const payload = r.data && r.data.data ? r.data.data : [];
    if (payload && payload.items) {
      if (filters.page || filters.perPage) {
        return { items: payload.items, meta: payload.meta || {} };
      }
      return payload.items;
    }
    return payload;
  }),
  suggestions: (query) => API.get('/search/suggestions', { 
    params: { q: query } 
  }).then(r => r.data.data),
}

// CATEGORIES ENDPOINTS
export const categoriesAPI = {
  getAll: () => API.get('/categories').then(unwrapResponse),
  getById: (id) => API.get(`/categories/${id}`).then(unwrapResponse),
}

// REVIEWS ENDPOINTS
export const reviewsAPI = {
  getByProduct: (productId) => API.get(`/reviews/product/${productId}`).then(unwrapResponse),
  create: (payload) => API.post('/reviews', payload).then(unwrapResponse),
  update: (id, payload) => API.put(`/reviews/${id}`, payload).then(unwrapResponse),
  delete: (id) => API.delete(`/reviews/${id}`).then(unwrapResponse),
}

// FAVORITES ENDPOINTS
export const favoritesAPI = {
  getAll: () => API.get('/favorites').then(unwrapResponse),
  add: (payload) => API.post('/favorites', payload).then(unwrapResponse),
  remove: (productId) => API.delete(`/favorites/${productId}`).then(unwrapResponse),
  isFavorite: (productId) => API.get(`/favorites/check/${productId}`).then(unwrapResponse),
}

// CART ENDPOINTS
export const cartAPI = {
  getCart: () => API.get('/cart').then(unwrapResponse),
  addItem: (productId, quantity) => API.post('/cart/items', { productId, quantity }).then(unwrapResponse),
  updateItem: (productId, quantity) => API.put(`/cart/items/${productId}`, { quantity }).then(unwrapResponse),
  removeItem: (productId) => API.delete(`/cart/items/${productId}`).then(unwrapResponse),
  clear: () => API.delete('/cart').then(unwrapResponse),
}

// ORDERS ENDPOINTS
export const ordersAPI = {
  getAll: (params) => API.get('/orders', { params }).then(unwrapResponse),
  getById: (id) => API.get(`/orders/${id}`).then(unwrapResponse),
  create: (payload) => API.post('/orders', payload).then(unwrapResponse),
  updateStatus: (id, status) => API.put(`/orders/${id}`, { status }).then(unwrapResponse),
  cancel: (id) => API.post(`/orders/${id}/cancel`).then(unwrapResponse),
}

// PAYMENTS ENDPOINTS
export const paymentsAPI = {
  createPayment: (payload) => API.post('/payments', payload).then(unwrapResponse),
  getPaymentStatus: (paymentId) => API.get(`/payments/${paymentId}`).then(unwrapResponse),
  refund: (paymentId) => API.post(`/payments/${paymentId}/refund`).then(unwrapResponse),
}

// PRICE HISTORY ENDPOINTS
export const priceHistoryAPI = {
  getHistory: (productId) => API.get(`/price-history/${productId}`).then(unwrapResponse),
}

export default API
