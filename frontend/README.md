# TecStore — Frontend

Interfaz web de **TecStore**, una tienda virtual futurista especializada en **componentes de computadora**. Construida con **React**, **Vite** y **Tailwind CSS**, consume la API REST del backend mediante **Axios**.

Este README está escrito para que **cualquier persona** pueda entender, instalar y ejecutar el frontend sin conocimientos previos avanzados.

---

## Tabla de contenidos

1. [¿Qué es este frontend?](#qué-es-este-frontend)
2. [Características principales](#características-principales)
3. [Stack tecnológico](#stack-tecnológico)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación paso a paso](#instalación-paso-a-paso)
6. [Ejecutar la aplicación](#ejecutar-la-aplicación)
7. [Variables de entorno](#variables-de-entorno)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Páginas y rutas](#páginas-y-rutas)
10. [Componentes reutilizables](#componentes-reutilizables)
11. [Estado global (Zustand)](#estado-global-zustand)
12. [Servicios API (Axios)](#servicios-api-axios)
13. [Diseño y paleta de colores](#diseño-y-paleta-de-colores)
14. [Autenticación y rutas protegidas](#autenticación-y-rutas-protegidas)
15. [Flujo de usuario típico](#flujo-de-usuario-típico)
16. [Endpoints que consume el frontend](#endpoints-que-consume-el-frontend)
17. [Diseño responsive](#diseño-responsive)
18. [Build y despliegue](#build-y-despliegue)
19. [Errores comunes](#errores-comunes)
20. [Relación con el backend](#relación-con-el-backend)
21. [Criterios del proyecto MERN](#criterios-del-proyecto-mern)

---

## ¿Qué es este frontend?

TecStore Frontend es la **cara visible** de la tienda: lo que el usuario ve en el navegador. Es una **Single Page Application (SPA)**, lo que significa que la página no se recarga completa al navegar; React actualiza solo las partes que cambian.

La aplicación se comunica con el backend (Node.js + Express + MongoDB) para:

- Registrar e iniciar sesión
- Buscar y mostrar productos de hardware
- Gestionar carrito, favoritos y pedidos
- Ver perfil del usuario y historial de precios
- Explorar ofertas y dejar reseñas

```
┌─────────────┐     HTTP/JSON      ┌─────────────┐     Mongoose     ┌──────────┐
│   React     │ ◄───────────────► │   Express   │ ◄──────────────► │ MongoDB  │
│  (Vite)     │    Axios + JWT    │   API REST  │                  │          │
│  :5174      │                   │   :3000     │                  │          │
└─────────────┘                   └─────────────┘                  └──────────┘
```

---

## Características principales

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Autenticación** | Registro e inicio de sesión con JWT |
| 🏠 **Inicio (Home)** | Panel principal con resumen y accesos rápidos |
| 🏪 **Tienda (Store)** | Catálogo con búsqueda, filtros y paginación |
| 📦 **Detalle de producto** | Información completa, specs y reseñas |
| 🛒 **Carrito** | Agregar, modificar cantidad y eliminar productos |
| 📋 **Pedidos** | Historial y seguimiento de órdenes |
| ❤️ **Favoritos** | Lista de productos guardados |
| 👤 **Perfil** | Datos personales y avatar |
| 💰 **Historial de precios** | Seguimiento de cambios de precio |
| 🔥 **Ofertas (Deals)** | Productos con descuento |
| ⭐ **Reseñas** | Calificaciones y comentarios |

---

## Stack tecnológico

| Tecnología | Versión | Para qué sirve |
|------------|---------|----------------|
| **React** | 18.2 | Biblioteca para construir la interfaz con componentes |
| **Vite** | 5.2 | Herramienta de desarrollo rápida (reemplaza Create React App) |
| **React Router** | 6.14 | Navegación entre páginas sin recargar |
| **Tailwind CSS** | 3.3 | Estilos utilitarios (clases en el HTML/JSX) |
| **Framer Motion** | 10.16 | Animaciones fluidas (hover, transiciones, loading) |
| **Zustand** | 4.4 | Estado global ligero (auth, carrito, UI) |
| **Axios** | 1.5 | Peticiones HTTP al backend |
| **React Hot Toast** | 2.4 | Notificaciones emergentes (éxito, error) |
| **React Icons** | 4.11 | Iconos (Feather Icons, etc.) |
| **date-fns** | 2.30 | Formateo de fechas |
| **React Query** | 3.39 | Caché y gestión de datos del servidor |
| **Stripe** | 14.0 | Integración de pagos en el cliente |

---

## Requisitos previos

| Herramienta | Cómo verificar | Notas |
|-------------|----------------|-------|
| **Node.js** (v18+) | `node -v` | [nodejs.org](https://nodejs.org) |
| **npm** | `npm -v` | Viene con Node.js |
| **Backend corriendo** | `http://localhost:3000` | Ver `backend/README.md` |
| **MongoDB activo** | — | Requerido por el backend |

---

## Instalación paso a paso

### 1. Entrar a la carpeta del frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

Esto descarga React, Vite, Tailwind y el resto de librerías en `node_modules/`.

### 3. Verificar que el backend esté activo

En otra terminal:

```bash
cd backend
npm run dev
```

Debes ver: `Server running on http://localhost:3000`

### 4. (Opcional) Crear archivo `.env`

Si necesitas cambiar la URL del backend, crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

> **Nota:** Actualmente `src/services/api.js` usa la URL `http://127.0.0.1:3000/api/v1` directamente. Si cambias el puerto del backend, actualiza también ese archivo o configura la variable de entorno y modifica `api.js` para leerla con `import.meta.env.VITE_API_URL`.

---

## Ejecutar la aplicación

### Modo desarrollo (recomendado)

```bash
npm run dev
```

La aplicación abrirá en: **`http://localhost:5174`**

> El puerto `5174` está configurado en `vite.config.js` con `strictPort: true`, es decir, si está ocupado Vite mostrará error en lugar de cambiar de puerto.

### Vista previa de producción

```bash
npm run build
npm run preview
```

### Construir para producción

```bash
npm run build
```

Genera archivos optimizados en la carpeta `dist/` listos para desplegar en Netlify, Vercel, GitHub Pages, etc.

---

## Variables de entorno

| Variable | Valor recomendado | Descripción |
|----------|-------------------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | URL base de la API del backend |

Las variables en Vite deben empezar con `VITE_` para ser accesibles en el código del cliente.

---

## Estructura del proyecto

```
frontend/
├── public/                    # Archivos estáticos (favicon, etc.)
├── src/
│   ├── pages/                 # Una página por ruta
│   │   ├── Home.jsx           # Panel principal
│   │   ├── Store.jsx          # Catálogo / tienda
│   │   ├── ProductDetail.jsx  # Detalle de un producto
│   │   ├── Cart.jsx           # Carrito de compras
│   │   ├── Orders.jsx         # Historial de pedidos
│   │   ├── Profile.jsx        # Perfil de usuario
│   │   ├── Favorites.jsx      # Productos favoritos
│   │   ├── PriceHistory.jsx   # Historial de precios
│   │   ├── Deals.jsx          # Ofertas
│   │   ├── Login.jsx          # Inicio de sesión
│   │   ├── Register.jsx       # Registro
│   │   └── AuthSelection.jsx  # Selección de autenticación
│   ├── components/
│   │   ├── common/            # Componentes reutilizables
│   │   │   └── index.jsx      # GlassCard, Badge, LoadingSpinner, etc.
│   │   ├── layout/            # Estructura de la app
│   │   │   ├── Header.jsx     # Barra superior
│   │   │   └── Sidebar.jsx    # Menú lateral
│   │   └── product/
│   │       └── ProductCard.jsx # Tarjeta de producto
│   ├── services/
│   │   └── api.js             # Todas las llamadas HTTP al backend
│   ├── store/
│   │   └── store.js           # Estado global con Zustand
│   ├── App.jsx                # Rutas y layout principal
│   ├── main.jsx               # Punto de entrada de React
│   └── styles.css             # Estilos globales y clases Tailwind
├── index.html                 # HTML base
├── vite.config.js             # Configuración de Vite (puerto 5174)
├── tailwind.config.js         # Colores, animaciones, tema
├── postcss.config.js          # Procesador CSS
├── package.json
└── README.md                  # Este archivo
```

### Responsabilidad de cada carpeta

| Carpeta | Qué contiene |
|---------|--------------|
| `pages/` | Pantallas completas; cada una corresponde a una ruta URL |
| `components/` | Piezas de UI reutilizables (botones, tarjetas, layout) |
| `services/` | Lógica de comunicación con el backend (sin UI) |
| `store/` | Estado compartido entre componentes (usuario, carrito, filtros) |

---

## Páginas y rutas

Definidas en `src/App.jsx` con **React Router v6**:

### Rutas públicas (sin iniciar sesión)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/login` | `Login.jsx` | Formulario de inicio de sesión |
| `/register` | `Register.jsx` | Formulario de registro |

### Rutas protegidas (requieren JWT)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `Home.jsx` | Página de inicio / dashboard |
| `/products` | `Store.jsx` | Catálogo con búsqueda y filtros |
| `/products/:productId` | `ProductDetail.jsx` | Detalle de un producto |
| `/cart` | `Cart.jsx` | Carrito de compras |
| `/orders` | `Orders.jsx` | Mis pedidos |
| `/profile` | `Profile.jsx` | Mi perfil |
| `/favorites` | `Favorites.jsx` | Mis favoritos |
| `/price-history` | `PriceHistory.jsx` | Historial de precios |
| `/deals` | `Deals.jsx` | Ofertas especiales |

### Comportamiento de navegación

- Si el usuario **no tiene token**, cualquier ruta desconocida redirige a `/login`.
- Si **tiene token**, las rutas protegidas muestran el layout con **Sidebar** y **Header**.
- Las páginas se cargan con **lazy loading** (`React.lazy`) para mejorar el rendimiento inicial.

---

## Componentes reutilizables

Ubicados en `src/components/common/index.jsx`:

| Componente | Uso |
|------------|-----|
| `LoadingSpinner` | Indicador de carga animado (tamaños: sm, md, lg) |
| `GlassCard` | Tarjeta con efecto cristal y animación hover |
| `Badge` | Etiqueta de estado (variantes: primary, success, etc.) |
| `EmptyState` | Pantalla vacía con icono, título y acción |
| `ErrorBoundary` | Captura errores de renderizado en hijos |

### Layout

| Componente | Ubicación | Función |
|------------|-----------|---------|
| `Header` | Parte superior | Búsqueda, notificaciones, usuario |
| `Sidebar` | Lateral izquierdo | Navegación principal entre secciones |
| `ProductCard` | Grid de productos | Muestra imagen, precio, rating y acciones |

---

## Estado global (Zustand)

Archivo: `src/store/store.js`

Zustand es una librería de estado **más simple que Redux**. El proyecto define 4 stores:

### `useAuthStore` — Autenticación

| Estado / Acción | Descripción |
|-----------------|-------------|
| `user` | Datos del usuario logueado |
| `token` | JWT (también en `localStorage`) |
| `setUser(user)` | Guardar usuario |
| `setToken(token)` | Guardar token en estado y localStorage |
| `logout()` | Limpiar sesión |

### `useCartStore` — Carrito local

| Estado / Acción | Descripción |
|-----------------|-------------|
| `items` | Lista de productos en carrito |
| `total` | Precio total calculado |
| `itemCount` | Cantidad total de ítems |
| `addItem(product)` | Agregar o incrementar cantidad |
| `removeItem(productId)` | Quitar producto |
| `updateQuantity(productId, qty)` | Cambiar cantidad |
| `clearCart()` | Vaciar carrito |

### `useUiStore` — Interfaz

| Estado / Acción | Descripción |
|-----------------|-------------|
| `sidebarOpen` | Sidebar visible u oculto |
| `searchOpen` | Panel de búsqueda abierto |
| `toggleSidebar()` | Mostrar/ocultar sidebar |
| `notifications` | Lista de notificaciones |

### `useFiltersStore` — Filtros de búsqueda

| Estado / Acción | Descripción |
|-----------------|-------------|
| `filters` | Filtros activos (categoría, precio, etc.) |
| `sortBy` | Criterio de ordenamiento |
| `setFilters(filters)` | Aplicar filtros |
| `clearFilters()` | Restablecer filtros |

---

## Servicios API (Axios)

Archivo: `src/services/api.js`

Centraliza **todas** las peticiones al backend. Usa una instancia de Axios con:

- **Base URL:** `http://127.0.0.1:3000/api/v1`
- **Interceptor de request:** Agrega automáticamente `Authorization: Bearer <token>` si existe en `localStorage`
- **Interceptor de response:** Si recibe `401`, cierra sesión y redirige a `/login`

### Módulos de API exportados

| Export | Endpoints que usa |
|--------|-------------------|
| `authAPI` | `/auth/register`, `/auth/login` |
| `usersAPI` | `/users/me`, `/users/me/avatar` |
| `productsAPI` | `/products`, `/products/:id` |
| `searchAPI` | `/search`, `/search/suggestions` |
| `categoriesAPI` | `/categories` |
| `reviewsAPI` | `/reviews/product/:id`, `/reviews` |
| `favoritesAPI` | `/favorites` |
| `cartAPI` | `/cart`, `/cart/items` |
| `ordersAPI` | `/orders`, `/orders/:id` |
| `paymentsAPI` | `/payments/checkout`, `/payments/confirm` |
| `priceHistoryAPI` | `/price-history/:productId` |

### Ejemplo de uso en un componente

```jsx
import { searchAPI } from '../services/api'

// Dentro de un useEffect o handler:
const productos = await searchAPI.search('rtx 4060', { minPrice: 200 })
```

---

## Diseño y paleta de colores

Tema **futurista oscuro** con acentos neón azules. Configurado en `tailwind.config.js`:

### Colores principales

| Nombre Tailwind | Hex | Uso |
|-----------------|-----|-----|
| `primary` | `#0f172a` | Fondo principal (azul muy oscuro) |
| `secondary` | `#1e293b` | Fondos de tarjetas y sidebar |
| `accent` | `#3b82f6` | Botones, enlaces, elementos activos |
| `accent-light` | `#60a5fa` | Hover y detalles |
| `accent-dark` | `#1e40af` | Gradientes |
| `success` | `#10b981` | Confirmaciones, stock disponible |
| `warning` | `#f59e0b` | Alertas |
| `danger` | `#ef4444` | Errores, eliminar |

### Efectos visuales

| Efecto | Descripción |
|--------|-------------|
| `bg-gradient-primary` | Degradado de fondo 135° |
| `shadow-neon` | Resplandor azul tipo neón |
| `animate-pulse-glow` | Pulso de brillo en elementos destacados |
| `animate-float` | Flotación suave para hero sections |
| `GlassCard` | Tarjetas con `backdrop-blur` (efecto cristal) |

### Tipografía y componentes

- Fuente del sistema (sans-serif por defecto de Tailwind)
- Botones con gradiente `gradient-accent` y sombra neón
- Inputs con borde sutil y foco en color `accent`
- Notificaciones toast en esquina inferior derecha

---

## Autenticación y rutas protegidas

### Flujo de login

```
Usuario ingresa email/password en Login.jsx
        │
        ▼
authAPI.login({ email, password })
        │
        ▼
Backend valida y devuelve { user, token }
        │
        ▼
setToken(token) → localStorage + Zustand
        │
        ▼
Redirige a Home (/)
```

### Componente `ProtectedRoute`

```jsx
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}
```

Todas las rutas excepto `/login` y `/register` están envueltas en `ProtectedRoute`.

### Persistencia de sesión

1. Al cargar la app, `App.jsx` lee `localStorage.getItem('token')`.
2. Si hay token, llama a `usersAPI.getCurrentUser()` para poblar el store.
3. Si el token expiró, el interceptor de Axios redirige a login.

---

## Flujo de usuario típico

```
1. Registro o Login
        │
        ▼
2. Home — ver resumen y accesos
        │
        ▼
3. Tienda — buscar "memoria RAM DDR4"
        │         (consulta /search en el backend)
        ▼
4. Detalle de producto — ver specs y reseñas
        │
        ├── Agregar al carrito
        └── Agregar a favoritos
        │
        ▼
5. Carrito — revisar cantidades y total
        │
        ▼
6. Crear pedido (Orders)
        │
        ▼
7. Pago con Stripe (si está configurado)
        │
        ▼
8. Ver pedido en historial
```

---

## Endpoints que consume el frontend

Resumen de la comunicación con `http://127.0.0.1:3000/api/v1`:

| Funcionalidad | Método | Endpoint |
|---------------|--------|----------|
| Registro | POST | `/auth/register` |
| Login | POST | `/auth/login` |
| Mi perfil | GET | `/users/me` |
| Actualizar perfil | PUT | `/users/me` |
| Subir avatar | PUT | `/users/me/avatar` |
| Listar productos | GET | `/products` |
| Producto por ID | GET | `/products/:id` |
| Buscar | GET | `/search?q=...` |
| Categorías | GET | `/categories` |
| Reseñas de producto | GET | `/reviews/product/:id` |
| Crear reseña | POST | `/reviews` |
| Mis favoritos | GET | `/favorites` |
| Agregar favorito | POST | `/favorites` |
| Ver carrito | GET | `/cart` |
| Agregar al carrito | POST | `/cart/items` |
| Mis pedidos | GET | `/orders` |
| Crear pedido | POST | `/orders` |
| Checkout pago | POST | `/payments/checkout` |
| Historial precios | GET | `/price-history/:productId` |

---

## Diseño responsive

La interfaz sigue un enfoque **Mobile-First**:

| Característica | Comportamiento |
|----------------|----------------|
| Sidebar | Colapsable en pantallas pequeñas |
| Header | Menú hamburguesa en móvil |
| Grid de productos | De 1 columna (móvil) a 3–4 (desktop) |
| Tarjetas | Se adaptan al ancho disponible |
| Toast | Siempre visible en esquina inferior derecha |

Breakpoints estándar de Tailwind: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

---

## Build y despliegue

### Generar build de producción

```bash
npm run build
```

### Desplegar en Netlify / Vercel

1. Conecta el repositorio de GitHub.
2. Directorio raíz: `frontend`
3. Comando de build: `npm run build`
4. Carpeta de salida: `dist`
5. Variable de entorno: `VITE_API_URL=https://tu-api.com/api/v1`

### GitHub Pages (con base path)

Ajusta `vite.config.js` con `base: '/nombre-repo/'` si despliegas en subruta.

---

## Errores comunes

### La página carga pero no hay productos

- Verifica que el **backend** esté corriendo en el puerto 3000.
- Abre la consola del navegador (F12 → Network) y revisa si las peticiones fallan.
- Ejecuta `npm run seed` en el backend para datos locales.

### `Network Error` o `CORS`

- El backend debe estar activo antes que el frontend.
- Comprueba que la URL en `api.js` coincida con el puerto del backend.

### Redirige siempre a `/login`

- El token puede haber expirado; vuelve a iniciar sesión.
- Limpia `localStorage` en DevTools → Application → Local Storage.

### Puerto 5174 ocupado

```powershell
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

O cambia el puerto en `vite.config.js`.

### Pantalla en blanco después de build

- Revisa la consola por errores de rutas o imports.
- Verifica que `VITE_API_URL` apunte a la API de producción.

---

## Relación con el backend

| Aspecto | Frontend | Backend |
|---------|----------|---------|
| Puerto | `5174` | `3000` |
| Tecnología | React + Vite | Node.js + Express |
| Datos | Consume API vía Axios | Expone `/api/v1` |
| Auth | JWT en localStorage | Firma y valida tokens |
| Base de datos | No tiene (solo UI) | MongoDB |

### Orden de arranque

```bash
# Terminal 1 — Base de datos (si es local)
mongod

# Terminal 2 — Backend
cd backend
npm run dev

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Abre el navegador en: **http://localhost:5174**

---

## Criterios del proyecto MERN

Este frontend cumple los requisitos académicos del stack MERN:

| Requisito | Cómo se cumple |
|-----------|----------------|
| **React con Vite** | `main.jsx` + `vite.config.js` |
| **Axios / async-await** | `src/services/api.js` con Promesas |
| **Sin recarga de página** | SPA con React Router |
| **Dashboard dinámico** | `Home.jsx` con datos de la API |
| **Formularios validados** | Login, Register, Profile |
| **CRUD visual** | Productos, carrito, pedidos, favoritos |
| **JWT en rutas protegidas** | `ProtectedRoute` + interceptor Axios |
| **Diseño responsive** | Tailwind + sidebar colapsable |
| **Separación cliente/servidor** | Frontend solo UI; lógica en backend |

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor de desarrollo en `:5174` |
| `npm run build` | Compilar para producción → `dist/` |
| `npm run preview` | Previsualizar el build localmente |

---

## Contribuir

1. Haz fork del repositorio.
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Realiza tus cambios y commit: `git commit -m 'Agrega mi mejora'`
4. Push: `git push origin feature/mi-mejora`
5. Abre un Pull Request.

---

## Licencia

Proyecto académico — consulta el repositorio para detalles.

---

**Hecho con dedicación para una experiencia de compra futurista en componentes de PC.**
