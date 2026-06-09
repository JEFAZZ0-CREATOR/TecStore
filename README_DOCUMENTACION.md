# TecStore — Documentación del Proyecto

**Tienda Virtual de Componentes de PC**

Aplicación e-commerce especializada en hardware de computadora construida con stack MERN.

---

## Índice

1. [Introducción](#introducción)
2. [Problema a solucionar](#problema-a-solucionar)
3. [Justificación](#justificación)
4. [Objetivo](#objetivo)
5. [Modelo de Monetización](#modelo-de-monetización)
6. [Flujo de Datos](#flujo-de-datos)
7. [Desarrollo](#desarrollo)
8. [Retos y Aprendizajes](#retos-y-aprendizajes)
9. [Conclusión](#conclusión)

---

## Introducción

**TecStore** es una aplicación web e-commerce de hardware de PC (procesadores, GPUs, RAM, etc.) construida con stack **MERN** (MongoDB, Express, React, Node.js). Permite buscar productos en múltiples tiendas externas (MercadoLibre, Cyberpuerta, DDTech, Newegg, Amazon) mediante scraping, gestionar carrito, pedidos, pagos con Stripe, favoritos, reseñas e historial de precios.

**Estructura:**
- **Backend**: API REST (Node.js + Express + MongoDB)
- **Frontend**: React + Vite + Tailwind CSS

---

## Problema a Solucionar

1. **Fragmentación del mercado**: Productos distribuidos en múltiples tiendas, obligando a visitar varios sitios
2. **Dificultad de comparación**: Interfaces y formatos inconsistentes entre proveedores
3. **Falta de historial de precios**: Imposible rastrear variaciones de precios
4. **Experiencia dispersa**: Proceso de compra fragmentado en diferentes plataformas
5. **Información desorganizada**: Especificaciones técnicas inconsistentes

**Solución**: Centralizar búsqueda, comparación y compra en una interfaz unificada.

---

## Justificación

- **Necesidad del mercado**: Crecimiento del hardware (gaming, IA, trabajo remoto)
- **Valor para el usuario**: Ahorro de tiempo, mejor toma de decisiones, experiencia unificada
- **Viabilidad técnica**: Stack MERN maduro, Puppeteer para scraping, MongoDB flexible, Stripe robusto
- **Escalabilidad**: Arquitectura modular, API versionada, sistema de caché
- **Contexto académico**: Cumple requisitos MERN, demuestra desarrollo full-stack

---

## Objetivo

Desarrollar e-commerce de componentes de PC que permita buscar, comparar y comprar hardware de múltiples proveedores con carrito, pagos, favoritos, reseñas e historial de precios.

**Objetivos específicos:**
1. API REST con Node.js/Express
2. Frontend React/Vite
3. Scraping multi-proveedor
4. Autenticación JWT
5. Pagos Stripe
6. Interface responsive
7. Sistema reseñas/favoritos
8. Historial precios

---

## Modelo de Monetización

**Modelo principal**: B2C con comisión por transacción + Freemium

### Suscripción Premium

| Característica | Gratis | Premium |
|----------------|--------|---------|
| Búsqueda | ✅ Ilimitado | ✅ Ilimitado |
| Comparación | 3 productos | Ilimitado |
| Historial precios | ❌ | 90 días |
| Alertas precio | ❌ | Ilimitadas |
| Reseñas | Básicas | Con fotos |
| Soporte | Normal | 24/7 |
| Descuentos | ❌ | 5-10% |

**Precios**: Mensual $4.99 USD, Anual $49.99 USD

### Freemium / In-App

**Gratis**: Búsqueda, auth, carrito, pedidos, reseñas básicas, 20 favoritos

**Pago**: Historial precios ($2.99), alertas ($1.99/mes), comparación avanzada ($0.99), reseñas con fotos ($0.49), favoritos extra ($0.99/mes)

### Publicidad

- Banners discretos en sidebar (160x600px)
- Native ads en resultados
- Solo usuarios gratis (premium sin anuncios)
- Máximo 3 por sesión

### B2B

- **Educación**: $199/año (100 usuarios) - panel admin, proyectos colaborativos
- **Empresa**: $499/año (50 usuarios) - ERP, facturación, API dedicada

### Costos vs Ingresos

**Costos mensuales**: $122 (MongoDB $57, hosting $20, dominio $15, scraping $30)

**Ingresos esperados**:
- Conservador (1K usuarios): $1,750/mes
- Moderado (5K usuarios): $8,750/mes
- Optimista (10K usuarios): $17,500/mes

**Punto equilibrio**: ~200 usuarios activos

### Impacto Técnico

- Módulo pasarela Stripe (suscripciones, compras in-app)
- Sistema roles/permisos (subscriptionTier, features)
- Espacio anuncios (sidebar 160px)
- Dashboard monetización
- Webhooks Stripe

---

## Flujo de Datos

### Proceso de Compra

```
Usuario → Registro/Login (JWT) → Búsqueda (scraping paralelo 5 tiendas) 
→ Visualización/Filtrado → Detalle producto → Carrito (Zustand + backend) 
→ Pedido → Pago Stripe → Seguimiento → Historial precios (job 24h)
```

### Arquitectura

```
Frontend (React/Vite:5174) → Axios/JWT → Backend (Express:3000) 
→ MongoDB + Stripe + Scraping (Puppeteer)
```

### Autenticación

```
Login → POST /auth/login → Validar Joi → Buscar MongoDB → Comparar password 
→ Generar JWT → Token en localStorage/Zustand → Interceptor Axios 
→ Rutas protegidas verifican token
```

---

## Desarrollo

### Metodología

**SCRUM** adaptado para proyecto académico:
- Sprints de 2 semanas
- Historias de usuario (auth, búsqueda, carrito, pedidos, pagos)
- Backlog con épicas y priorización MoSCoW
- Git + GitHub Issues

### Stack Tecnológico

**Backend**: Node.js 18+, Express 4.18, MongoDB/Mongoose 7.7, JWT, Joi, Puppeteer 24.42, Stripe 12.0, Helmet, CORS, Multer, node-cron

**Frontend**: React 18.2, Vite 5.2, React Router 6.14, Tailwind 3.3, Framer Motion 10.16, Zustand 4.4, Axios 1.5, React Hot Toast

**Nota**: No se utiliza MCP ni IA actualmente. Scraping tradicional con Puppeteer/Cheerio.

### Backend

**Base de datos MongoDB** (virtual-store):

**Colecciones**:
- `users`: name, email, password (hash), role, avatarUrl, subscriptionTier
- `products`: title, description, provider, image, price, rating, specs, externalId
- `categories`: name, slug, description
- `carts`: userId, items[], subtotal
- `orders`: userId, items[], subtotal/tax/shipping/total, status, paymentStatus
- `reviews`: productId, userId, rating, comment, images
- `favorites`: userId, productId
- `price-history`: productId, price, provider, change

**Estructura**:
```
backend/src/
├── server.js, app.js
├── api/v1/ (routes versionadas)
├── modules/ (auth, users, products, search, cart, orders, payments, reviews)
│   └── Cada módulo: routes.js, controller.js, service.js, model.js
├── providers/ (scrapers: amazon, mercadoLibre, cyberpuerta, ddtech, newegg)
├── config/ (database, cors, port, rateLimit)
├── security/ (helmet, xss)
├── shared/ (middlewares, utils)
├── cache/, jobs/, monitoring/
```

**Patrones**: MVC, Repository, Strategy (providers), Singleton (MongoDB), AsyncHandler, Factory (errors)

### API REST

**Base**: `http://localhost:3000/api/v1`

**Endpoints principales**:
- `POST /auth/register`, `/auth/login`
- `GET /users/me`, `PUT /users/me`, `PUT /users/me/avatar`
- `GET/POST/PUT/DELETE /products`
- `GET /search?q=...&category=...&minPrice=...&maxPrice=...&provider=...`
- `GET /categories`
- `GET/POST/PUT/DELETE /cart`
- `POST /orders`, `GET /orders`, `GET /orders/:id`
- `POST /payments/checkout`, `/payments/confirm`, `/payments/webhook`
- `GET/POST /favorites`
- `GET /reviews/product/:id`, `POST /reviews`
- `GET /price-history/:productId`

### Frontend

**Estructura**:
```
frontend/src/
├── pages/ (Home, Store, ProductDetail, Cart, Orders, Profile, Favorites, etc.)
├── components/ (common, layout, product)
├── services/api.js (Axios configurado)
├── store/store.js (Zustand: auth, cart, ui, filters)
├── hooks/, utils/
```

**Diseño**:
- Tema oscuro futurista con acentos azules neón
- Paleta: primary #0f172a, secondary #1e293b, accent #3b82f6
- Componentes: GlassCard, ProductCard, LoadingSpinner, Badge
- Responsive: mobile-first, sidebar colapsable, grid 1-4 columnas
- Animaciones: Framer Motion (fade, slide, hover scale)

**Páginas**: Login, Register, Home, Store (búsqueda/filtros), ProductDetail, Cart, Orders, Profile, Favorites, PriceHistory, Deals

---

## Retos y Aprendizajes

### Retos Técnicos

1. **Scraping multi-proveedor**: Estructuras HTML diferentes → Solución: patrón Strategy, selectores flexibles, caché 30s
2. **Normalización datos**: Formatos inconsistentes → Solución: mappers, validación, esquemas flexibles
3. **Estado frontend**: Sincronización sin prop drilling → Solución: Zustand stores por dominio
4. **Autenticación JWT**: Expiración y refresh → Solución: interceptor Axios, manejo 401
5. **Integración Stripe**: Pagos seguros → Solución: SDK oficial, webhooks, estados
6. **Performance búsquedas**: Scraping lento (5-10s) → Solución: caché, paralelo, loading states
7. **Responsive**: Múltiples pantallas → Solución: mobile-first, Tailwind breakpoints

### Aprendizajes

- Arquitectura modular facilita mantenimiento
- Documentación continua es crítica
- Testing automatizado previene bugs
- Seguridad por capas (validación, auth, sanitización)
- UX determina éxito del producto
- Diseñar escalabilidad desde inicio
- Comunicación frontend/backend es clave

---

## Conclusión

**TecStore** es una aplicación e-commerce completa que demuestra dominio del stack MERN y buenas prácticas de desarrollo.

**Logros**:
- Arquitectura sólida con separación frontend/backend
- Funcionalidad completa (auth → pagos)
- Integraciones avanzadas (scraping, Stripe, JWT)
- UX moderna y responsive
- Seguridad por capas
- Escalabilidad modular
- Documentación exhaustiva

**Valor**:
- Usuario: centraliza búsqueda, facilita comparación
- Desarrollador: portfolio full-stack completo
- Negocio: modelo monetización diversificado, escalable

**Futuras mejoras**: IA para recomendaciones, app móvil nativa, comunidad, marketplace propio, analytics avanzado, notificaciones push, chat en vivo.

---

**TecStore** — El futuro de la compra de hardware de PC.

*Última actualización: Junio 2026 | Versión 1.0.0*
│  - /payments/* → payments.routes.js                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARES                                  │
│                                                                 │
│  1. authMiddleware (si ruta protegida)                          │
│     - Verifica token JWT                                        │
│     - Adjunta req.user                                          │
│                                                                 │
│  2. validationMiddleware (si corresponde)                       │
│     - Valida con Joi                                            │
│     - Retorna error si inválido                                 │
│                                                                 │
│  3. asyncHandler (wrapper)                                     │
│     - Captura errores async                                     │
│     - Pasa al siguiente middleware de error                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONTROLLER (Lógica de presentación)            │
│                                                                 │
│  auth.controller.login():                                       │
│  1. Recibe req.body (email, password)                           │
│  2. Llama a auth.service.login()                                │
│  3. Maneja errores                                              │
│  4. Formatea respuesta                                           │
│  5. Retorna res.status(200).json({ success, data })            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE (Reglas de negocio)                  │
│                                                                 │
│  auth.service.login():                                           │
│  1. Busca usuario en MongoDB (User.findOne)                     │
│  2. Compara password (bcrypt.compare)                           │
│  3. Genera token JWT (jsonwebtoken.sign)                        │
│  4. Retorna { user, token }                                     │
│                                                                 │
│  search.service.searchProducts():                               │
│  1. Verifica caché                                              │
│  2. Si no hay caché:                                             │
│     - Llama a providers en paralelo                              │
│     - Normaliza resultados                                      │
│     - Aplica filtros                                             │
│     - Guarda en caché                                           │
│  3. Retorna resultados paginados                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MODEL (Acceso a datos)                      │
│                                                                 │
│  User (Mongoose Schema):                                         │
│  - findOne({ email })                                           │
│  - create({ name, email, password })                             │
│  - toJSON() (excluye password)                                  │
│                                                                 │
│  Product (Mongoose Schema):                                      │
│  - find(filters)                                                │
│  - findById(id)                                                 │
│  - create(data)                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MONGODB (Base de datos)                      │
│                                                                 │
│  Colecciones:                                                   │
│  - users                                                        │
│  - products                                                     │
│  - categories                                                   │
│  - carts                                                        │
│  - orders                                                       │
│  - reviews                                                      │
│  - favorites                                                    │
│  - price-history                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Prototipado y diseño

#### Wireframes conceptuales

**1. Página de Login/Registro**
```
┌─────────────────────────────────────┐
│           [LOGO TecStore]          │
│                                     │
│      ┌─────────────────────┐       │
│      │  Email              │       │
│      └─────────────────────┘       │
│                                     │
│      ┌─────────────────────┐       │
│      │  Password           │       │
│      └─────────────────────┘       │
│                                     │
│         [INICIAR SESIÓN]           │
│                                     │
│      ¿No tienes cuenta?            │
│         [Regístrate]               │
└─────────────────────────────────────┘
```

**2. Página Principal (Dashboard)**
```
┌─────────────────────────────────────────────────────────────┐
│  [🔍 Buscar productos...]  [🔔]  [👤]        ☰              │
├──────────┬──────────────────────────────────────────────────┤
│          │  Bienvenido a TecStore                           │
│  Home    │                                                  │
│  Tienda  │  [📦 Productos destacados]                       │
│  Carrito │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  Pedidos │  │ IMG │ │ IMG │ │ IMG │ │ IMG │               │
│  Favoritos│  │$XXX │ │$XXX │ │$XXX │ │$XXX │               │
│  Perfil  │  └─────┘ └─────┘ └─────┘ └─────┘               │
│          │                                                  │
│          │  [🔥 Ofertas del día]                            │
│          │  ┌─────┐ ┌─────┐                                 │
│          │  │ IMG │ │ IMG │                                 │
│          │  │$XXX │ │$XXX │                                 │
│          │  └─────┘ └─────┘                                 │
└──────────┴──────────────────────────────────────────────────┘
```

**3. Página de Tienda con Resultados**
```
┌─────────────────────────────────────────────────────────────┐
│  [🔍 RTX 4060...]  [Filtros ▼]  [Ordenar ▼]  [🔔]  [👤]    │
├──────────┬──────────────────────────────────────────────────┤
│          │  Resultados para "RTX 4060" (45 productos)       │
│ Categoría│                                                  │
│  ☑ CPU   │  ┌─────────────┐ ┌─────────────┐               │
│  ☑ GPU   │  │    IMG      │ │    IMG      │               │
│  ☑ RAM   │  │ NVIDIA RTX  │ │ NVIDIA RTX  │               │
│  ☑ SSD   │  │   4060      │ │   4060 Ti   │               │
│  ☑ MB    │  │   $299.99   │ │   $359.99   │               │
│          │  │ ⭐4.5 ML    │ │ ⭐4.7 CP    │               │
│ Precio   │  │ [🛒] [❤️]   │ │ [🛒] [❤️]   │               │
│  $0-$100 │  └─────────────┘ └─────────────┘               │
│  $100-$300│                                                  │
│  $300-$500│  ┌─────────────┐ ┌─────────────┐               │
│  $500+    │  │    IMG      │ │    IMG      │               │
│          │  │ NVIDIA RTX  │ │ NVIDIA RTX  │               │
│ Proveedor│  │   4060      │ │   4060      │               │
│  ☑ ML    │  │   $289.99   │ │   $310.00   │               │
│  ☑ CP    │  │ ⭐4.3 DD    │ │ ⭐4.6 NG    │               │
│  ☑ DD    │  │ [🛒] [❤️]   │ │ [🛒] [❤️]   │               │
│  ☑ NG    │  └─────────────┘ └─────────────┘               │
│  ☑ AMZ   │                                                  │
│          │  [← Anterior]  Página 1 de 3  [Siguiente →]    │
└──────────┴──────────────────────────────────────────────────┘
```

**4. Página de Carrito**
```
┌─────────────────────────────────────────────────────────────┐
│  🛒 Mi Carrito                          [🔔]  [👤]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [IMG]  NVIDIA RTX 4060                    [$299.99] │   │
│  │        MercadoLibre                               │   │
│  │        Cantidad: [-] 1 [+]                        │   │
│  │        [Eliminar]                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [IMG]  AMD Ryzen 5 5600X                   [$179.99] │   │
│  │        Cyberpuerta                                 │   │
│  │        Cantidad: [-] 1 [+]                        │   │
│  │        [Eliminar]                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [IMG]  Corsair Vengeance 16GB              [$79.99]  │   │
│  │        Newegg                                      │   │
│  │        Cantidad: [-] 2 [+]                        │   │
│  │        [Eliminar]                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    ─────────────────                      │
│  Subtotal:                                    $639.96      │
│  Impuestos (16%):                              $102.39      │
│  Envío:                                        $15.00       │
│                    ─────────────────                      │
│  Total:                                       $757.35      │
│                                                             │
│                    [PROCESAR COMPRA]                       │
└─────────────────────────────────────────────────────────────┘
```

### Descripción del desarrollo del Frontend

#### Estructura del proyecto Frontend

```
frontend/
├── public/                    # Archivos estáticos
│   └── favicon.ico
├── src/
│   ├── main.jsx               # Punto de entrada React
│   ├── App.jsx                # Rutas y layout principal
│   ├── styles.css             # Estilos globales
│   │
│   ├── pages/                 # Páginas de la aplicación
│   │   ├── Home.jsx           # Dashboard principal
│   │   ├── Store.jsx          # Catálogo de productos
│   │   ├── ProductDetail.jsx  # Detalle de producto
│   │   ├── Cart.jsx           # Carrito de compras
│   │   ├── Orders.jsx         # Historial de pedidos
│   │   ├── Profile.jsx        # Perfil de usuario
│   │   ├── Favorites.jsx      # Productos favoritos
│   │   ├── PriceHistory.jsx   # Historial de precios
│   │   ├── Deals.jsx          # Ofertas especiales
│   │   ├── Login.jsx          # Inicio de sesión
│   │   ├── Register.jsx       # Registro
│   │   └── AuthSelection.jsx  # Selección de auth
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── common/            # Componentes genéricos
│   │   │   └── index.jsx      # GlassCard, Badge, LoadingSpinner
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── Header.jsx      # Barra superior
│   │   │   └── Sidebar.jsx     # Menú lateral
│   │   └── product/           # Componentes de producto
│   │       └── ProductCard.jsx # Tarjeta de producto
│   │
│   ├── services/              # Llamadas a API
│   │   └── api.js             # Cliente Axios configurado
│   │
│   ├── store/                 # Estado global (Zustand)
│   │   └── store.js           # Stores: auth, cart, ui, filters
│   │
│   ├── hooks/                 # Custom hooks
│   │   └── useAuth.js         # Hook de autenticación
│   │
│   └── utils/                 # Utilidades
│       ├── formatters.js      # Formateo de datos
│       └── validators.js      # Validaciones
│
├── index.html                 # HTML base
├── vite.config.js             # Configuración Vite
├── tailwind.config.js         # Configuración Tailwind
├── postcss.config.js          # Configuración PostCSS
├── package.json
└── README.md
```

#### Diseño de las pantallas

**1. Sistema de diseño**
- Mobile-first approach
- Grid system de Tailwind
- Componentes atómicos
- Consistencia visual

**2. Paleta de colores**

| Color | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| Primary Dark | `#0f172a` | `bg-primary` | Fondo principal |
| Secondary | `#1e293b` | `bg-secondary` | Tarjetas, sidebar |
| Accent | `#3b82f6` | `text-accent` | Botones, enlaces |
| Accent Light | `#60a5fa` | `text-accent-light` | Hover, detalles |
| Accent Dark | `#1e40af` | `bg-accent-dark` | Gradientes |
| Success | `#10b981` | `text-success` | Confirmaciones |
| Warning | `#f59e0b` | `text-warning` | Alertas |
| Danger | `#ef4444` | `text-danger` | Errores, eliminar |

**3. Tipografía**
- Fuente: Sans-serif (Inter por defecto de Tailwind)
- Títulos: `font-bold`, `text-2xl` a `text-4xl`
- Subtítulos: `font-semibold`, `text-lg` a `text-xl`
- Cuerpo: `font-normal`, `text-sm` a `text-base`
- Código: `font-mono`

**4. Tipos de botones**

```css
/* Botón primario */
.btn-primary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 
         text-white font-semibold px-6 py-2 rounded-lg
         shadow-lg hover:shadow-neon transition-all
         hover:scale-105 active:scale-95;
}

/* Botón secundario */
.btn-secondary {
  @apply bg-secondary text-accent font-semibold 
         px-6 py-2 rounded-lg border border-accent
         hover:bg-accent hover:text-white transition-all;
}

/* Botón danger */
.btn-danger {
  @apply bg-red-500 text-white font-semibold 
         px-4 py-2 rounded-lg hover:bg-red-600 transition-all;
}

/* Botón icono */
.btn-icon {
  @apply p-2 rounded-full hover:bg-secondary 
         transition-colors;
}
```

**5. Inputs de formulario**

```css
.input-field {
  @apply w-full px-4 py-2 rounded-lg 
         bg-secondary border border-gray-600 
         text-white placeholder-gray-400
         focus:border-accent focus:ring-2 
         focus:ring-accent/50 outline-none
         transition-all;
}

.input-error {
  @apply border-red-500 focus:border-red-500 
         focus:ring-red-500/50;
}
```

**6. Componentes principales**

**GlassCard** - Tarjeta con efecto cristal:
```jsx
<div className="glass-card">
  <div className="backdrop-blur-md bg-white/10 
                  border border-white/20 
                  rounded-xl p-6">
    {/* Contenido */}
  </div>
</div>
```

**ProductCard** - Tarjeta de producto:
```jsx
<div className="product-card">
  <img src={product.image} alt={product.title} />
  <h3>{product.title}</h3>
  <p className="price">${product.price}</p>
  <div className="rating">⭐ {product.rating}</div>
  <div className="actions">
    <button className="btn-add-cart">🛒</button>
    <button className="btn-favorite">❤️</button>
  </div>
</div>
```

**LoadingSpinner** - Indicador de carga:
```jsx
<div className="loading-spinner">
  <div className="animate-spin rounded-full 
                  h-12 w-12 border-b-2 
                  border-accent"></div>
</div>
```

**7. Layout responsive**

**Desktop (≥1024px)**:
- Sidebar fijo a la izquierda (250px)
- Header en la parte superior
- Contenido principal con scroll
- Grid de 3-4 columnas para productos

**Tablet (768px - 1023px)**:
- Sidebar colapsable
- Header simplificado
- Grid de 2 columnas para productos

**Mobile (<768px)**:
- Sidebar oculto (menú hamburguesa)
- Header compacto
- Grid de 1 columna para productos
- Navegación inferior (bottom nav)

**8. Animaciones (Framer Motion)**

```jsx
// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>

// Slide up
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.2 }}
>

// Hover scale
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
```

**9. Notificaciones (React Hot Toast)**

```jsx
// Success
toast.success('Producto agregado al carrito')

// Error
toast.error('Error al cargar productos')

// Loading
toast.promise(
  fetchProducts(),
  {
    loading: 'Cargando...',
    success: 'Productos cargados',
    error: 'Error al cargar'
  }
)
```

---

## Capturas de pantalla con descripción

*Nota: Como este es un documento de texto, las capturas de pantalla se describen conceptualmente. En un repositorio real, se incluirían imágenes reales.*

### 1. Pantalla de Login
**Descripción**: Muestra el formulario de inicio de sesión con el logo de TecStore, campos para email y contraseña, y botón "Iniciar Sesión". Incluye enlace para registrarse. Diseño minimalista con fondo oscuro y acentos azules neón.

### 2. Dashboard Principal (Home)
**Descripción**: Panel de bienvenida con acceso rápido a las secciones principales. Muestra productos destacados en un grid horizontal, ofertas del día, y estadísticas rápidas del usuario. Sidebar a la izquierda con navegación.

### 3. Tienda con Resultados de Búsqueda
**Descripción**: Grid de productos con tarjetas que incluyen imagen, título, precio, rating, proveedor y botones de acción. Barra de búsqueda en la parte superior con filtros de categoría, precio y proveedor. Paginación en la parte inferior.

### 4. Detalle de Producto
**Descripción**: Vista detallada de un producto con imagen grande, especificaciones técnicas, descripción, reseñas de usuarios, historial de precios (para usuarios premium), y botones para agregar al carrito o favoritos.

### 5. Carrito de Compras
**Descripción**: Lista de productos en el carrito con imagen, título, precio, cantidad (con controles +/-) y botón para eliminar. Resumen de subtotal, impuestos, envío y total. Botón "Procesar Compra" prominentemente displayed.

### 6. Proceso de Pago con Stripe
**Descripción**: Formulario de pago de Stripe integrado en la UI, mostrando resumen del pedido, campos para tarjeta de crédito, fecha de expiración y CVC. Indicadores de seguridad y encriptación.

### 7. Historial de Pedidos
**Descripción**: Tabla o lista de pedidos realizados con número de orden, fecha, estado, total y acciones para ver detalles. Estados con colores distintivos (pending: amarillo, paid: verde, shipped: azul, delivered: verde oscuro).

### 8. Perfil de Usuario
**Descripción**: Formulario para editar datos personales (nombre, email), sección para cambiar contraseña, y área para subir avatar. Muestra información de suscripción (free/premium) con opción de upgrade.

### 9. Página de Favoritos
**Descripción**: Grid de productos guardados como favoritos con opción de agregar al carrito directamente o eliminar de favoritos. Filtros por categoría y fecha de agregado.

### 10. Historial de Precios (Premium)
**Descripción**: Gráfico de línea mostrando la variación de precio de un producto a lo largo del tiempo. Puntos de datos con fechas y precios. Opción para exportar datos o configurar alertas de precio.

---

## Retos y aprendizajes

### Retos técnicos enfrentados

#### 1. Scraping de múltiples proveedores
**Reto**: Cada tienda externa tiene estructura HTML diferente, lo que dificulta mantener los scrapers funcionales.

**Solución**: 
- Implementar patrón Strategy para proveedores intercambiables
- Usar selectores CSS flexibles y fallbacks
- Sistema de logging para detectar fallos rápidamente
- Caché de resultados para reducir dependencia del scraping

**Aprendizaje**: La web es dinámica; los scrapers requieren mantenimiento continuo. Es importante tener un plan de monitoreo y alertas.

#### 2. Normalización de datos
**Reto**: Productos de diferentes proveedores tienen formatos inconsistentes (precios en diferentes monedas, especificaciones en distintos formatos).

**Solución**:
- Crear mappers para normalizar datos a formato común
- Implementar validación de datos antes de guardar
- Usar esquemas flexibles en MongoDB para especificaciones
- Sistema de limpieza de datos periódico

**Aprendizaje**: La calidad de datos es crítica. Invertir tiempo en normalización y validación ahorra problemas a largo plazo.

#### 3. Gestión de estado en frontend
**Reto**: Mantener sincronizado el estado entre componentes (carrito, usuario, filtros) sin prop drilling.

**Solución**:
- Implementar Zustand para estado global
- Separar stores por dominio (auth, cart, ui, filters)
- Usar localStorage para persistencia
- Implementar middleware para sincronización con backend

**Aprendizaje**: Elegir la herramienta adecuada de gestión de estado es crucial. Zustand fue más simple que Redux para este proyecto.

#### 4. Autenticación JWT
**Reto**: Implementar autenticación segura con manejo de expiración y refresh de tokens.

**Solución**:
- JWT con expiración configurable (8h)
- Interceptor de Axios para agregar token automáticamente
- Manejo de 401 con redirect a login
- Almacenamiento seguro en localStorage (considerar httpOnly cookies en producción)

**Aprendizaje**: La seguridad no debe ser afterthought. Implementar autenticación correctamente desde el inicio es fundamental.

#### 5. Integración de Stripe
**Reto**: Integrar pagos de forma segura y manejar webhooks para confirmación.

**Solución**:
- Usar Stripe SDK oficial
- Implementar webhooks para confirmación asíncrona
- Validar firmas de webhooks
- Manejar estados de pago (pending, processing, paid, failed)

**Aprendizaje**: Las integraciones de pagos requieren atención especial a seguridad y manejo de edge cases.

#### 6. Performance en búsquedas
**Reto**: Las búsquedas con scraping en tiempo real pueden ser lentas (5-10 segundos).

**Solución**:
- Implementar caché en memoria (30 segundos)
- Búsqueda paralela en múltiples proveedores
- Paginación para no sobrecargar el cliente
- Loading states claros para el usuario
- Búsqueda híbrida: local + externa

**Aprendizaje**: La UX depende del performance. El caché y la carga diferida son esenciales.

#### 7. Responsive design
**Reto**: Adaptar la interfaz a múltiples tamaños de pantalla manteniendo usabilidad.

**Solución**:
- Mobile-first approach con Tailwind
- Sidebar colapsable en móviles
- Grid adaptativo (1-4 columnas)
- Touch-friendly buttons y inputs
- Testing en múltiples dispositivos

**Aprendizaje**: El responsive no es solo CSS, es rediseñar la UX para cada contexto.

### Aprendizajes clave

#### 1. Arquitectura modular
**Lección**: Separar el código en módulos independientes facilita el mantenimiento y la colaboración.

**Aplicación**: Cada funcionalidad (auth, products, cart) tiene su propio módulo con routes, controller, service y model.

#### 2. Documentación continua
**Lección**: La documentación es tan importante como el código. READMEs detallados ahorran tiempo a futuro.

**Aplicación**: READMEs en backend, frontend y raíz con instrucciones claras de instalación y uso.

#### 3. Testing y debugging
**Lección**: Invertir en testing automatizado previene bugs en producción.

**Aplicación**: Uso de Thunder Client/Postman para probar endpoints, console.log estratégicos, manejo de errores con try-catch.

#### 4. Seguridad por capas
**Lección**: La seguridad no es un solo componente, es múltiples capas (validación, autenticación, sanitización, headers seguros).

**Aplicación**: Helmet, CORS, rate limiting, validación Joi, hash de passwords, JWT.

#### 5. Experiencia de usuario
**Lección**: La funcionalidad técnica no es suficiente; la UX determina el éxito del producto.

**Aplicación**: Loading states, notificaciones toast, manejo de errores amigable, diseño intuitivo, feedback visual.

#### 6. Escalabilidad desde el inicio
**Lección**: Diseñar para escalabilidad desde el inicio facilita crecimiento futuro.

**Aplicación**: Arquitectura modular, API versionada, caché, separación de concerns, configuración por entorno.

#### 7. Comunicación equipo
**Lección**: La comunicación clara entre frontend y backend es crítica.

**Aplicación**: Contratos de API claros, documentación de endpoints, reuniones de sincronización, código compartido para tipos de datos.

---

## Conclusión

**TecStore** es una aplicación web completa de e-commerce especializada en componentes de computadora que demuestra el dominio del stack MERN y buenas prácticas de desarrollo de software.

### Logros principales

1. **Arquitectura sólida**: Separación clara entre frontend y backend con API REST bien definida
2. **Funcionalidad completa**: Desde autenticación hasta pagos, pasando por búsqueda, carrito y pedidos
3. **Integración avanzada**: Scraping de múltiples proveedores, pagos con Stripe, autenticación JWT
4. **UX moderna**: Diseño responsive, animaciones fluidas, estados de carga claros
5. **Seguridad implementada**: Múltiples capas de seguridad (Helmet, CORS, rate limiting, validación)
6. **Escalabilidad**: Arquitectura modular preparada para crecimiento
7. **Documentación exhaustiva**: READMEs detallados en cada parte del proyecto

### Valor del proyecto

**Para el usuario**:
- Centraliza la búsqueda de hardware en múltiples tiendas
- Facilita comparación de precios y especificaciones
- Ofrece experiencia de compra unificada
- Proporciona historial de precios (premium)

**Para el desarrollador**:
- Demuestra habilidades full-stack
- Muestra conocimiento de patrones de diseño
- Implementa buenas prácticas de desarrollo
- Sirve como portfolio de proyecto completo

**Para el negocio**:
- Modelo de monetización diversificado (B2C, Freemium, B2B)
- Escalable a múltiples mercados
- Costos operativos controlados
- Potencial de expansión a nuevas categorías

### Futuras mejoras

1. **Integración de IA**: Recomendaciones personalizadas, búsqueda semántica
2. **Móvil nativo**: App iOS/Android con React Native
3. **Comunidad**: Foros, guías de armado de PC, comparativas
4. **Marketplace**: Vender productos propios además de scraping
5. **Analytics avanzado**: Dashboard de métricas para administradores
6. **Notificaciones push**: Alertas de precio, estado de pedidos
7. **Chat en vivo**: Soporte en tiempo real
8. **Integración social**: Login con Google, Facebook; compartir productos

### Reflexión final

El desarrollo de TecStore ha sido un viaje completo desde la concepción hasta la implementación, pasando por diseño arquitectónico, desarrollo frontend y backend, integración de servicios externos y pruebas. El proyecto no solo cumple con los requisitos académicos del stack MERN, sino que también ofrece una solución real a un problema del mercado, con potencial de convertirse en un producto comercial viable.

La aplicación demuestra que con las herramientas adecuadas, una arquitectura bien pensada y dedicación al detalle, es posible construir sistemas complejos que sean tanto técnicamente sólidos como agradables de usar. TecStore es un testimonio del poder del desarrollo web moderno y las posibilidades que ofrece el e-commerce en la era digital.

---

**TecStore** — El futuro de la compra de hardware de PC, hoy.

---

## Apéndices

### A. Enlaces útiles

- [Documentación del Backend](backend/README.md)
- [Documentación del Frontend](frontend/README.md)
- [Repositorio en GitHub](https://github.com/tu-usuario/tecstore)
- [Demo en vivo](https://tecstore-demo.com) (cuando esté desplegado)

### B. Contacto

- Desarrolladores: [tu-email@ejemplo.com]
- Issues: [GitHub Issues](https://github.com/tu-usuario/tecstore/issues)

### C. Licencia

Proyecto académico. Consulta el repositorio para detalles de licencia.

---

**Última actualización**: Junio 2026
**Versión**: 1.0.0
