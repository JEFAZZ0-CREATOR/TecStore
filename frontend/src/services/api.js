import axios from 'axios'

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

// AUTH ENDPOINTS
export const authAPI = {
  register: (payload) => API.post('/auth/register', payload).then(r => r.data),
  login: (payload) => API.post('/auth/login', payload).then(r => r.data),
  logout: () => localStorage.removeItem('token'),
}

// USERS ENDPOINTS
export const usersAPI = {
  getCurrentUser: () => API.get('/users/me').then(r => r.data),
  updateProfile: (payload) => API.put('/users/profile', payload).then(r => r.data),
  getProfile: (userId) => API.get(`/users/${userId}`).then(r => r.data),
}

// PRODUCTS ENDPOINTS
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }).then(r => r.data),
  getById: (id) => API.get(`/products/${id}`).then(r => r.data),
  create: (payload) => API.post('/products', payload).then(r => r.data),
  update: (id, payload) => API.put(`/products/${id}`, payload).then(r => r.data),
  delete: (id) => API.delete(`/products/${id}`).then(r => r.data),
}

// SEARCH ENDPOINTS
export const searchAPI = {
  search: (query, filters) => API.get('/search', { 
    params: { q: query, ...filters } 
  }).then(r => r.data),
  suggestions: (query) => API.get('/search/suggestions', { 
    params: { q: query } 
  }).then(r => r.data),
}

// CATEGORIES ENDPOINTS
export const categoriesAPI = {
  getAll: () => API.get('/categories').then(r => r.data),
  getById: (id) => API.get(`/categories/${id}`).then(r => r.data),
}

// REVIEWS ENDPOINTS
export const reviewsAPI = {
  getByProduct: (productId) => API.get(`/reviews/product/${productId}`).then(r => r.data),
  create: (payload) => API.post('/reviews', payload).then(r => r.data),
  update: (id, payload) => API.put(`/reviews/${id}`, payload).then(r => r.data),
  delete: (id) => API.delete(`/reviews/${id}`).then(r => r.data),
}

// FAVORITES ENDPOINTS
export const favoritesAPI = {
  getAll: () => API.get('/favorites').then(r => r.data),
  add: (productId) => API.post('/favorites', { productId }).then(r => r.data),
  remove: (productId) => API.delete(`/favorites/${productId}`).then(r => r.data),
  isFavorite: (productId) => API.get(`/favorites/check/${productId}`).then(r => r.data),
}

// CART ENDPOINTS
export const cartAPI = {
  getCart: () => API.get('/cart').then(r => r.data),
  addItem: (productId, quantity) => API.post('/cart/items', { productId, quantity }).then(r => r.data),
  updateItem: (productId, quantity) => API.put(`/cart/items/${productId}`, { quantity }).then(r => r.data),
  removeItem: (productId) => API.delete(`/cart/items/${productId}`).then(r => r.data),
  clear: () => API.delete('/cart').then(r => r.data),
}

// ORDERS ENDPOINTS
export const ordersAPI = {
  getAll: (params) => API.get('/orders', { params }).then(r => r.data),
  getById: (id) => API.get(`/orders/${id}`).then(r => r.data),
  create: (payload) => API.post('/orders', payload).then(r => r.data),
  updateStatus: (id, status) => API.put(`/orders/${id}`, { status }).then(r => r.data),
  cancel: (id) => API.post(`/orders/${id}/cancel`).then(r => r.data),
}

// PAYMENTS ENDPOINTS
export const paymentsAPI = {
  createPayment: (payload) => API.post('/payments', payload).then(r => r.data),
  getPaymentStatus: (paymentId) => API.get(`/payments/${paymentId}`).then(r => r.data),
  refund: (paymentId) => API.post(`/payments/${paymentId}/refund`).then(r => r.data),
}

// PRICE HISTORY ENDPOINTS
export const priceHistoryAPI = {
  getHistory: (productId) => API.get(`/price-history/${productId}`).then(r => r.data),
}

export default API
