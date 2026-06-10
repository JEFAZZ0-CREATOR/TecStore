import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles.css'

const ADMIN_EMAILS = [
  'luischv1979@gmail.com',
  'derek.vallejo.alp@cbtis258.edu.mx',
  'orlando.torres.alp@cbtis258.edu.mx',
  'juanaldair.ramos.alp@cbtis258.edu.mx',
]

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))
const Store = lazy(() => import('./pages/Store'))
const Cart = lazy(() => import('./pages/Cart'))
const Orders = lazy(() => import('./pages/Orders'))
const Profile = lazy(() => import('./pages/Profile'))
const Favorites = lazy(() => import('./pages/Favorites'))
const PriceHistory = lazy(() => import('./pages/PriceHistory'))
const Deals = lazy(() => import('./pages/Deals'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))

// Components
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'

// Store
import { useAuthStore } from './store/store'
import { usersAPI } from './services/api'

// Loading fallback
const LoadingFallback = () => (
  <div className="w-full h-screen bg-gradient-primary flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-5xl font-bold text-gradient mb-4">TecStore</h1>
      <p className="text-xl text-slate-300">Cargando...</p>
    </div>
  </div>
)

// Protected Route Component — also applies the page-level content wrapper
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) return <Navigate to="/" replace />
  return <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
}

// Admin-only route: checks token AND admin email/role
const AdminRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  const user  = useAuthStore((state) => state.user)
  if (!token) return <Navigate to="/login" replace />
  // Wait for user profile to load before deciding access
  if (!user) return <LoadingFallback />
  const email = user.email?.toLowerCase() ?? ''
  if (user.role !== 'admin' && !ADMIN_EMAILS.includes(email)) {
    return <Navigate to="/home" replace />
  }
  return children
}

export default function App() {
  const token  = useAuthStore((state) => state.token)
  const user   = useAuthStore((state) => state.user)
  const setToken = useAuthStore((state) => state.setToken)

  // Admin panel takes over the full screen — skip the normal layout
  const isAdminRoute = window.location.pathname.startsWith('/admin')

  // Check for token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken && !token) {
      setToken(storedToken)
    }
  }, [token, setToken])

  // When token exists, fetch current user to populate store (including avatar)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await usersAPI.getCurrentUser()
        const setUser = useAuthStore.getState().setUser
        setUser(user)
      } catch (err) {
        // ignore
      }
    }
    if (token) fetchUser()
  }, [token])

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* ── Admin panel (full-screen, own layout) ── */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

        {/* ── Regular app layout ── */}
        <Route path="*" element={
          <div className="flex h-screen bg-primary">
            {token && !isAdminRoute && <Sidebar />}
            <div className="flex-1 flex flex-col overflow-hidden">
              {token && !isAdminRoute && <Header />}
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={token ? <Navigate to="/home" replace /> : <Landing />} />
                  <Route path="/login"    element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected */}
                  <Route path="/home"                  element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/products"              element={<ProtectedRoute><Store /></ProtectedRoute>} />
                  <Route path="/products/:productId"   element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                  <Route path="/cart"                  element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/orders"                element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/profile"               element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/favorites"             element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                  <Route path="/price-history"         element={<ProtectedRoute><PriceHistory /></ProtectedRoute>} />
                  <Route path="/deals"                 element={<ProtectedRoute><Deals /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to={token ? "/home" : "/"} replace />} />
                </Routes>
              </main>
            </div>
            <Toaster position="bottom-right" />
          </div>
        } />
      </Routes>
    </Suspense>
  )
}
