import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:3001/api/v1' })

export const register = (payload) => API.post('/auth/register', payload).then(r => r.data)
export const login = (payload) => API.post('/auth/login', payload).then(r => r.data)
export const fetchProducts = () => API.get('/products').then(r => r.data)

export default API
