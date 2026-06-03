import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './styles.css'

// Lazy load pages
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
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

// Loading fallback
const LoadingFallback = () => (
  <div className="w-full h-screen bg-gradient-primary flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-5xl font-bold text-gradient mb-4">TecStore</h1>
      <p className="text-xl text-slate-300">Cargando...</p>
    </div>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)

  // Check for token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken && !token) {
      setToken(storedToken)
    }
  }, [token, setToken])

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar */}
      {token && <Sidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {token && <Header />}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Store /></ProtectedRoute>} />
                <Route path="/products/:productId" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/price-history" element={<ProtectedRoute><PriceHistory /></ProtectedRoute>} />
                <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />

                {/* Catch all - redirect to login if no token */}
                <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  )
}
