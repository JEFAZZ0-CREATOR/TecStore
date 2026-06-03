# 📱 TecStore Frontend - Documentación Completa

## 🎯 Descripción General

Frontend futurista y moderno para TecStore, una tienda tecnológica online. Construido con React, React Router, Tailwind CSS y Framer Motion para proporcionar una experiencia de usuario excepcional.

---

## 📋 Páginas Implementadas

### 1. **Página de Inicio** (`/`)
- **Archivo**: `src/pages/Home.jsx`
- **Características**:
  - Hero section con call-to-action
  - Carrusel de características
  - Grid de productos destacados
  - CTA para crear cuenta
- **Componentes utilizados**: ProductGrid, GlassCard, Button
- **Estado**: useCartStore, useAuthStore

### 2. **Tienda/Catálogo** (`/products`)
- **Archivo**: `src/pages/Store.jsx`
- **Características**:
  - Grid de productos con lazy loading
  - Búsqueda en tiempo real
  - Filtros avanzados por categoría
  - Filtro por rango de precio
  - Opciones de ordenamiento (precio, rating, fecha)
  - Vista responsive
- **Componentes utilizados**: ProductGrid, Input, Button, GlassCard
- **Estado**: useFiltersStore, useCartStore

### 3. **Detalle de Producto** (`/products/:productId`)
- **Archivo**: `src/pages/ProductDetail.jsx`
- **Características**:
  - Galería de imágenes interactiva
  - Información detallada del producto
  - Selector de cantidad
  - Insignias de descuento
  - Sistema de reseñas y ratings
  - Información de envío y garantía
  - Botones de "Agregar al carrito" y "Favorito"
- **Componentes utilizados**: LoadingSpinner, Badge, GlassCard
- **APIs**: productsAPI, reviewsAPI

### 4. **Carrito de Compras** (`/cart`)
- **Archivo**: `src/pages/Cart.jsx`
- **Características**:
  - Vista de items en el carrito
  - Actualización de cantidad (incrementar/decrementar)
  - Eliminar items individuales
  - Resumen de pedido en tiempo real
  - Cálculo de subtotal, impuestos y total
  - Vaciar carrito completo
  - Enlace para continuar comprando
  - Estado vacío con CTA
- **Estado**: useCartStore
- **Componentes**: GlassCard, Button, EmptyState

### 5. **Órdenes/Pedidos** (`/orders`)
- **Archivo**: `src/pages/Orders.jsx`
- **Características**:
  - Listado de todas las órdenes del usuario
  - Filtrado por estado (all, pending, processing, shipped, delivered, cancelled)
  - Información de cada orden: ID, fecha, estado, total
  - Preview de items en la orden
  - Dirección de envío
  - Badges de estado con color
  - Animaciones suaves en cada elemento
- **APIs**: ordersAPI
- **Componentes**: GlassCard, LoadingSpinner, EmptyState, Badge

### 6. **Favoritos** (`/favorites`)
- **Archivo**: `src/pages/Favorites.jsx`
- **Características**:
  - Grid de productos marcados como favoritos
  - Opción de eliminar favorito
  - Integración con carrito (agregar a carrito)
  - Estado vacío con mensaje
  - Contador de favoritos
- **APIs**: favoritesAPI
- **Componentes**: ProductGrid, EmptyState
- **Estado**: useCartStore

### 7. **Historial de Precios** (`/price-history`)
- **Archivo**: `src/pages/PriceHistory.jsx`
- **Características**:
  - Tarjetas con estadísticas de precios (más bajo, promedio)
  - Gráfico de evolución de precios
  - Tabla de cambios históricos
  - Visualización de ahorros potenciales
  - Duración del seguimiento
- **APIs**: priceHistoryAPI
- **Componentes**: GlassCard, LoadingSpinner

### 8. **Ofertas Especiales** (`/deals`)
- **Archivo**: `src/pages/Deals.jsx`
- **Características**:
  - Hero section especial
  - Estadísticas de ofertas (cantidad, ahorro total, duración)
  - Grid de productos con descuento
  - Resaltado de productos limitados
  - Badges de descuento prominentes
- **APIs**: productsAPI
- **Componentes**: ProductGrid, GlassCard, Button

### 9. **Perfil de Usuario** (`/profile`)
- **Archivo**: `src/pages/Profile.jsx`
- **Características**:
  - Avatar del usuario
  - Información personal editable
  - Cambio de contraseña
  - Estadísticas de cuenta (órdenes, dinero gastado, puntos)
  - Opción de cerrar sesión
  - Modo edición/visualización
- **APIs**: usersAPI
- **Componentes**: GlassCard, Input, Button, LoadingSpinner
- **Estado**: useAuthStore

### 10. **Login** (`/login`)
- **Archivo**: `src/pages/Login.jsx`
- **Características**:
  - Formulario de email y contraseña
  - Validación de formulario
  - Manejo de errores
  - Link a página de registro
  - Link a recuperación de contraseña
  - Diseño futurista con efectos de vidrio
- **APIs**: authAPI
- **Componentes**: Input, Button, GlassCard
- **Estado**: useAuthStore

### 11. **Registro** (`/register`)
- **Archivo**: `src/pages/Register.jsx`
- **Características**:
  - Formulario de registro completo
  - Validación de campos
  - Confirmación de contraseña
  - Link a login
  - Aceptación de términos
  - Oferta de bienvenida (descuento)
- **APIs**: authAPI
- **Componentes**: Input, Button, GlassCard

---

## 🧩 Componentes Reutilizables

### Common Components (`src/components/common/index.jsx`)

#### `LoadingSpinner`
```jsx
<LoadingSpinner size="md" /> // sm, md, lg
```
- Spinner animado con rotación suave

#### `GlassCard`
```jsx
<GlassCard className="custom-class">
  Content here
</GlassCard>
```
- Tarjeta con efecto de vidrio y hover

#### `Badge`
```jsx
<Badge variant="primary"> // primary, success, warning, danger
  Texto
</Badge>
```
- Insignia con colores temáticos

#### `EmptyState`
```jsx
<EmptyState
  icon={FiIcon}
  title="Título"
  description="Descripción"
  action={<Button>Acción</Button>}
/>
```
- Estado vacío con ícono y CTA

#### `Input`
```jsx
<Input
  icon={FiIcon}
  type="text"
  placeholder="..."
  error="Error opcional"
/>
```
- Input personalizado con ícono y validación

#### `Button`
```jsx
<Button
  variant="primary" // primary, secondary
  size="md" // sm, md, lg
  loading={false}
  onClick={handler}
>
  Texto
</Button>
```
- Botón con animaciones y estados

### Layout Components

#### `Header` (`src/components/layout/Header.jsx`)
- Logo con gradient
- Barra de búsqueda
- Ícono de favoritos con badge
- Carrito con contador
- Menú de usuario
- Navegación responsive

#### `Sidebar` (`src/components/layout/Sidebar.jsx`)
- Navegación principal
- Menú de usuario
- Links activos destacados
- Colapsable en móvil
- Overlay en dispositivos pequeños

### Product Components

#### `ProductCard` (`src/components/product/ProductCard.jsx`)
- Imagen con hover effects
- Badge de descuento
- Rating con estrellas
- Precio original tachado
- Stock disponible
- Botones de agregar carrito y favorito

#### `ProductGrid` (`src/components/product/ProductCard.jsx`)
- Grid responsivo (1-4 columnas)
- Loading skeleton
- Estado vacío
- Integración con acciones

---

## 🎨 Sistema de Diseño

### Colores
```css
primary: '#0f172a'
secondary: '#1e293b'
accent: '#3b82f6'
accent-light: '#60a5fa'
accent-dark: '#1e40af'
success: '#10b981'
warning: '#f59e0b'
danger: '#ef4444'
```

### Efecto Neón
```css
box-shadow: 0 0 20px rgba(59, 130, 246, 0.5)
```

### Animaciones
- **Pulse-glow**: Efecto de brillo pulsante
- **Float**: Flotación suave
- **Transiciones**: 300ms por defecto

---

## 📊 Estado Global (Zustand)

### `useAuthStore`
```javascript
{
  user: null,
  token: string,
  isLoading: false,
  error: null,
  setUser: (user) => {},
  setToken: (token) => {},
  logout: () => {},
}
```

### `useCartStore`
```javascript
{
  items: [],
  total: number,
  itemCount: number,
  addItem: (product) => {},
  removeItem: (productId) => {},
  updateQuantity: (productId, quantity) => {},
  clearCart: () => {},
}
```

### `useUiStore`
```javascript
{
  sidebarOpen: boolean,
  searchOpen: boolean,
  notifications: [],
  toggleSidebar: () => {},
  toggleSearch: () => {},
  addNotification: (notification) => {},
}
```

### `useFiltersStore`
```javascript
{
  filters: {},
  sortBy: string,
  setFilters: (filters) => {},
  setSortBy: (sortBy) => {},
  clearFilters: () => {},
}
```

---

## 🔌 Servicios API

### Estructura (`src/services/api.js`)
```javascript
// Agrupados por módulo
authAPI = { register, login, logout }
usersAPI = { getCurrentUser, updateProfile, getProfile }
productsAPI = { getAll, getById, create, update, delete }
cartAPI = { getCart, addItem, updateItem, removeItem, clear }
ordersAPI = { getAll, getById, create, updateStatus, cancel }
favoritesAPI = { getAll, add, remove, isFavorite }
reviewsAPI = { getByProduct, create, update, delete }
searchAPI = { search, suggestions }
paymentsAPI = { createPayment, getPaymentStatus, refund }
priceHistoryAPI = { getHistory }
```

---

## 🛡️ Rutas Protegidas

```javascript
<Route 
  path="/protected" 
  element={
    <ProtectedRoute>
      <ProtectedComponent />
    </ProtectedRoute>
  } 
/>
```

Las rutas protegidas requieren un token válido. Si no existe, redirige a `/login`.

---

## 🎭 Rutas Públicas vs Protegidas

### Públicas
- `/login`
- `/register`

### Protegidas
- `/` (Home)
- `/products` (Tienda)
- `/products/:productId` (Detalle)
- `/cart`
- `/orders`
- `/profile`
- `/favorites`
- `/price-history`
- `/deals`

---

## 📦 Estructura de Carpetas

```
frontend/
├── src/
│   ├── pages/              # Páginas completas
│   ├── components/
│   │   ├── common/         # Componentes reutilizables
│   │   ├── layout/         # Header y Sidebar
│   │   └── product/        # Componentes de productos
│   ├── services/
│   │   └── api.js          # Configuración de API
│   ├── store/
│   │   └── store.js        # Estado global
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css          # Estilos globales
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🚀 Getting Started

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con la URL correcta del backend
   ```

3. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

4. **Acceder**
   - http://localhost:3000

---

## 🎓 Conceptos Implementados

- ✅ Routing avanzado con React Router v6
- ✅ Autenticación con JWT
- ✅ Gestión de estado con Zustand
- ✅ API REST consumption
- ✅ Componentes funcionales con Hooks
- ✅ Custom Hooks
- ✅ Animaciones con Framer Motion
- ✅ Responsive design con Tailwind
- ✅ Validación de formularios
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states

---

## 📝 Notas Importantes

1. El token JWT se almacena en `localStorage`
2. Todas las solicitudes API incluyen automáticamente el token de autenticación
3. Las animaciones se cargan de forma opcional
4. El carrito se mantiene en el estado global durante la sesión
5. Las rutas no protegidas redirigen a login si no hay token

---

## 🔮 Futuras Mejoras

- [ ] Paginación en listados
- [ ] Filtros avanzados con facetas
- [ ] Sistema de reseñas completo
- [ ] Wishlist compartible
- [ ] Notificaciones en tiempo real
- [ ] Dark/Light mode toggle
- [ ] Multi-idioma
- [ ] PWA capabilities
- [ ] Offline mode

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Autor**: TecStore Team
