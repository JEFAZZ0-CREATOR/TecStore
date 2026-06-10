import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const d = (r) => r.data?.data ?? r.data

export const adminAPI = {
  getStats:                  ()            => API.get('/admin/stats').then(d),
  getAnalytics:              ()            => API.get('/admin/analytics').then(d),
  getActivity:               ()            => API.get('/admin/activity').then(d),
  getUsers:                  ()            => API.get('/admin/users').then(d),
  getUserDetail:             (id)          => API.get(`/admin/users/${id}`).then(d),
  updateUserRole:            (id, role)    => API.patch(`/admin/users/${id}/role`, { role }).then(d),
  deleteUser:                (id)          => API.delete(`/admin/users/${id}`).then(d),
  getOrders:                 ()            => API.get('/admin/orders').then(d),
  updateOrderStatus:         (id, status)  => API.patch(`/admin/orders/${id}/status`, { status }).then(d),
  getProducts:               ()            => API.get('/admin/products').then(d),
  toggleProductAvailability: (id)          => API.patch(`/admin/products/${id}/availability`).then(d),
  deleteProduct:             (id)          => API.delete(`/admin/products/${id}`).then(d),
}
