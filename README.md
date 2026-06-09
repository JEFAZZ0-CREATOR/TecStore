# TecStore — Tienda Virtual de Componentes de PC

**TecStore** es una aplicación web completa tipo e-commerce especializada en **hardware de computadora** (procesadores, tarjetas madre, RAM, GPUs, almacenamiento, etc.). Está construida con el stack **MERN**:

| Letra | Tecnología | Carpeta |
|-------|------------|---------|
| **M** | MongoDB | Base de datos en el backend |
| **E** | Express.js | API REST en `backend/` |
| **R** | React | Interfaz de usuario en `frontend/` |
| **N** | Node.js | Servidor en `backend/` |

Este README es la **guía de inicio rápido** del repositorio. Para documentación detallada, consulta los README de cada parte del proyecto.

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| **[Backend — API REST](backend/README.md)** | Instalación, endpoints, MongoDB, JWT, scraping, Stripe, seguridad |
| **[Frontend — React](frontend/README.md)** | Páginas, rutas, Zustand, Axios, diseño, despliegue |

---

## ¿Qué hace TecStore?

TecStore permite a los usuarios:

- **Registrarse e iniciar sesión** con autenticación JWT
- **Buscar productos** en tiendas externas (MercadoLibre, Cyberpuerta, DDTech, Newegg, Amazon) y en catálogo local
- **Explorar el catálogo** con filtros por categoría, precio y proveedor
- **Agregar productos al carrito** y gestionar cantidades
- **Guardar favoritos** y dejar **reseñas**
- **Crear pedidos** y pagar con **Stripe**
- **Consultar historial** de pedidos y precios
- **Gestionar su perfil** (datos personales y avatar)

### Modelo de negocio

Tienda virtual **B2C** (venta directa al consumidor): el usuario busca componentes, los compra y paga en línea. Técnicamente esto incluye módulos de carrito, pedidos y pasarela de pago (Stripe).

---

## Arquitectura del proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR                               │
│                   http://localhost:5174                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP + JSON + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│  Páginas · Componentes · Zustand · Axios · Tailwind CSS         │
└────────────────────────────┬────────────────────────────────────┘
                             │ /api/v1
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                 │
│  Auth · Products · Search · Cart · Orders · Payments · ...    │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────┐    ┌─────────────────────────────────┐
│        MongoDB           │    │   Proveedores externos          │
│  users, products,        │    │  (scraping con Puppeteer)       │
│  carts, orders, ...      │    │  MercadoLibre, Cyberpuerta...   │
└──────────────────────────┘    └─────────────────────────────────┘
```

---

## Estructura del repositorio

```
TecStore/
├── backend/                 # API REST (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── api/v1/          # Rutas versionadas
│   │   ├── modules/         # Auth, cart, orders, products, etc.
│   │   ├── providers/       # Scrapers de tiendas externas
│   │   ├── config/          # Entorno, MongoDB, CORS
│   │   └── shared/          # Middlewares y utilidades
│   ├── seed.js              # Datos de ejemplo
│   ├── .env.example         # Plantilla de variables de entorno
│   └── README.md            # 📖 Documentación del backend
│
├── frontend/                # Interfaz web (React + Vite)
│   ├── src/
│   │   ├── pages/           # Pantallas (Home, Store, Cart, ...)
│   │   ├── components/      # UI reutilizable
│   │   ├── services/        # Llamadas Axios al backend
│   │   └── store/           # Estado global (Zustand)
│   └── README.md            # 📖 Documentación del frontend
│
└── README.md                # Este archivo (inicio rápido)
```

---

## Requisitos previos

Antes de ejecutar el proyecto necesitas:

| Herramienta | Versión mínima | Verificar |
|-------------|----------------|-----------|
| **Node.js** | 18+ | `node -v` |
| **npm** | (incluido con Node) | `npm -v` |
| **MongoDB** | Local o Atlas | Servicio activo |
| **Git** | (opcional) | `git -v` |

> **Opcional:** cuenta de [Stripe](https://stripe.com) en modo test para probar pagos.

---

## Inicio rápido (5 pasos)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd TecStore
```

### 2. Configurar y arrancar el backend

```bash
cd backend
npm install
copy .env.example .env    # Windows
# cp .env.example .env    # Linux / macOS
```

Edita `backend/.env` con tus valores (mínimo: `JWT_SECRET` y `MONGO_URI`).

```bash
npm run seed    # Opcional: datos de ejemplo
npm run dev
```

Debes ver: `Server running on http://localhost:3000`

### 3. Arrancar el frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev
```

Abre el navegador en: **http://localhost:5174**

### 4. Crear una cuenta o iniciar sesión

- Ve a `/register` para registrarte, o
- Usa `/login` si ya tienes usuario (tras `npm run seed` puede haber usuarios de prueba).

### 5. Explorar la tienda

- **Inicio** (`/`) — panel principal
- **Tienda** (`/products`) — buscar y filtrar productos
- **Carrito** (`/cart`) — revisar compra
- **Pedidos** (`/orders`) — historial

---

## Puertos y URLs

| Servicio | URL | Notas |
|----------|-----|-------|
| **Frontend** | http://localhost:5174 | Vite (`strictPort`) |
| **Backend API** | http://localhost:3000/api/v1 | Prefijo versionado |
| **MongoDB** | mongodb://127.0.0.1:27017/virtual-store | Por defecto en `.env` |

---

## Variables de entorno

### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=cambia_esto_en_produccion
JWT_EXPIRES_IN=8h
MONGO_URI=mongodb://127.0.0.1:27017/virtual-store
STRIPE_SECRET=sk_test_tu_clave_opcional
```

### Frontend (`frontend/.env`) — opcional

```env
VITE_API_URL=http://localhost:3000/api/v1
```

> El frontend usa por defecto `http://127.0.0.1:3000/api/v1` en `src/services/api.js`. Si cambias el puerto del backend, actualiza esa URL o configura `VITE_API_URL`.

---

## Comandos útiles

### Backend

```bash
cd backend
npm install          # Instalar dependencias
npm run dev          # Desarrollo con recarga automática
npm start            # Producción
npm run seed         # Poblar base de datos con ejemplos
```

### Frontend

```bash
cd frontend
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo
npm run build        # Compilar para producción
npm run preview      # Vista previa del build
```

---

## Módulos principales

| Módulo | Backend | Frontend |
|--------|---------|----------|
| Autenticación | `/auth/register`, `/auth/login` | Login, Register |
| Usuarios | `/users/me`, avatar | Profile |
| Productos | `/products` | Store, ProductDetail |
| Búsqueda externa | `/search?q=...` | Store (búsqueda) |
| Categorías | `/categories` | Filtros en tienda |
| Carrito | `/cart` | Cart |
| Pedidos | `/orders` | Orders |
| Pagos | `/payments/checkout` | Checkout Stripe |
| Favoritos | `/favorites` | Favorites |
| Reseñas | `/reviews` | ProductDetail |
| Ofertas | — | Deals |
| Historial precios | — | PriceHistory |

Detalle completo de cada endpoint en **[backend/README.md](backend/README.md)**.

---

## Stack tecnológico resumido

### Backend
Node.js · Express · MongoDB · Mongoose · JWT · Joi · Puppeteer · Stripe · Helmet · CORS · Multer

### Frontend
React 18 · Vite · React Router · Tailwind CSS · Framer Motion · Zustand · Axios · React Hot Toast

---

## Probar sin el frontend

Puedes probar la API con **Thunder Client** (VS Code) o **Postman**:

1. Arranca el backend: `cd backend && npm run dev`
2. `POST http://localhost:3000/api/v1/auth/register` — crear usuario
3. `GET http://localhost:3000/api/v1/search?q=procesador` — buscar productos
4. Usa el token JWT en rutas protegidas: `Authorization: Bearer <token>`

Tutorial completo en **[backend/README.md → Probar la API](backend/README.md#probar-la-api-thunder-client--postman)**.

---

## Errores frecuentes

| Problema | Solución |
|----------|----------|
| Puerto 3000 ocupado | `netstat -ano \| findstr :3000` y `taskkill /PID <PID> /F` |
| Puerto 5174 ocupado | Igual con `:5174`, o cambia `vite.config.js` |
| `MongoNetworkError` | Inicia MongoDB o revisa `MONGO_URI` |
| Frontend sin datos | Verifica que el backend esté corriendo |
| Siempre redirige a login | Token expirado; vuelve a iniciar sesión |
| Búsqueda lenta o vacía | El scraping externo puede tardar; prueba `npm run seed` para datos locales |

Más soluciones en los README de [backend](backend/README.md#errores-comunes-y-soluciones) y [frontend](frontend/README.md#errores-comunes).

---

## Criterios del proyecto MERN (académico)

Este repositorio cumple los requisitos típicos de un proyecto final MERN:

| Criterio | Implementación |
|----------|----------------|
| Separación cliente/servidor | `frontend/` y `backend/` independientes |
| API REST con JSON | Prefijo `/api/v1`, respuestas `{ success, data }` |
| MongoDB + Mongoose | Colecciones: users, products, carts, orders, etc. |
| Arquitectura MVC | Modelos, controladores y rutas por módulo |
| React + Vite | SPA sin recarga de página |
| Axios / async-await | `frontend/src/services/api.js` |
| JWT | Rutas protegidas en backend y `ProtectedRoute` en frontend |
| CRUD | Productos, carrito, pedidos, favoritos, reseñas |
| Diseño responsive | Tailwind CSS, sidebar colapsable |
| Documentación | README en raíz, backend y frontend |

---

## Despliegue (producción)

1. **Backend:** despliega en Railway, Render, Fly.io o VPS con `npm start` y MongoDB Atlas.
2. **Frontend:** compila con `npm run build` y despliega `dist/` en Netlify, Vercel o GitHub Pages.
3. Configura `VITE_API_URL` con la URL pública de tu API.
4. Cambia `JWT_SECRET` y usa claves Stripe de producción.

---

## Contribuir

1. Fork del repositorio
2. Rama nueva: `git checkout -b feature/mi-mejora`
3. Commit: `git commit -m 'Descripción del cambio'`
4. Push y Pull Request

---

## Licencia

Proyecto académico. Consulta el repositorio para detalles de licencia.

---

## Enlaces rápidos

- [Documentación del Backend](backend/README.md)
- [Documentación del Frontend](frontend/README.md)
- API local: http://localhost:3000/api/v1
- App local: http://localhost:5174

---

**TecStore** — Experiencia de compra futurista para entusiastas del hardware de PC.
