# TecStore — Backend (API REST)

Backend de **TecStore**, una tienda virtual especializada en **componentes de computadora**. Expone una API REST versionada que gestiona usuarios, catálogo, búsqueda en proveedores externos, carrito, pedidos, pagos con Stripe, favoritos y reseñas.

Este documento está pensado para que **cualquier persona** — con o sin experiencia previa en Node.js — pueda entender qué hace el proyecto, cómo instalarlo y cómo usarlo.

---

## Tabla de contenidos

1. [¿Qué es TecStore?](#qué-es-tecstore)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura general](#arquitectura-general)
4. [Requisitos previos](#requisitos-previos)
5. [Instalación paso a paso](#instalación-paso-a-paso)
6. [Variables de entorno](#variables-de-entorno)
7. [Comandos disponibles](#comandos-disponibles)
8. [Estructura del proyecto](#estructura-del-proyecto)
9. [Base de datos MongoDB](#base-de-datos-mongodb)
10. [API REST — Endpoints](#api-rest--endpoints)
11. [Formato de respuestas](#formato-de-respuestas)
12. [Autenticación JWT](#autenticación-jwt)
13. [Búsqueda y scraping de productos](#búsqueda-y-scraping-de-productos)
14. [Pagos con Stripe](#pagos-con-stripe)
15. [Seguridad implementada](#seguridad-implementada)
16. [Patrones de diseño](#patrones-de-diseño)
17. [Probar la API (Thunder Client / Postman)](#probar-la-api-thunder-client--postman)
18. [Docker](#docker)
19. [Errores comunes y soluciones](#errores-comunes-y-soluciones)
20. [Relación con el frontend](#relación-con-el-frontend)
21. [Criterios del proyecto MERN](#criterios-del-proyecto-mern)

---

## ¿Qué es TecStore?

TecStore es una aplicación web tipo **e-commerce** orientada a hardware de PC (procesadores, tarjetas madre, RAM, GPUs, etc.). El backend cumple estas funciones principales:

| Función | Descripción |
|---------|-------------|
| **Autenticación** | Registro e inicio de sesión con tokens JWT |
| **Catálogo local** | Productos almacenados en MongoDB (útiles para pruebas y datos semilla) |
| **Búsqueda externa** | Consulta productos reales en tiendas como MercadoLibre, Cyberpuerta, DDTech y Newegg mediante scraping |
| **Carrito** | Cada usuario autenticado tiene su carrito persistente en la base de datos |
| **Pedidos** | Creación y consulta de órdenes de compra |
| **Pagos** | Integración con Stripe para procesar pagos |
| **Favoritos** | Guardar productos preferidos por usuario |
| **Reseñas** | Calificaciones y comentarios por producto |
| **Categorías** | Organización del catálogo por tipo de componente |

### Modelo de negocio (contexto académico)

Como tienda virtual, el modelo principal es **B2C / venta directa**: el usuario busca componentes, los agrega al carrito y realiza el pago. Técnicamente esto implica el módulo de **pasarela de pago (Stripe)** y el seguimiento de pedidos.

---

## Stack tecnológico

| Tecnología | Versión (aprox.) | Para qué sirve |
|------------|------------------|----------------|
| **Node.js** | ≥ 18 | Entorno de ejecución del servidor |
| **Express** | 4.x | Framework HTTP y enrutamiento |
| **MongoDB** | Local o Atlas | Base de datos NoSQL |
| **Mongoose** | 7.x | Modelado de datos y consultas a MongoDB |
| **JWT** (`jsonwebtoken`) | 9.x | Tokens de autenticación |
| **Joi** | 17.x | Validación de datos de entrada |
| **Puppeteer** | 24.x | Navegador headless para scraping |
| **Stripe** | 12.x | Procesamiento de pagos |
| **Helmet** | 7.x | Cabeceras HTTP de seguridad |
| **CORS** | 2.x | Permitir peticiones desde el frontend |
| **Multer** | 1.x | Subida de archivos (avatar de usuario) |
| **Morgan** | 1.x | Registro de peticiones HTTP en consola |
| **node-cron** | 3.x | Tareas programadas (seguimiento de precios) |
| **dotenv** | 16.x | Variables de entorno desde `.env` |
| **nodemon** | 3.x | Recarga automática en desarrollo |

---

## Arquitectura general

El backend sigue una **arquitectura modular** inspirada en el patrón **MVC** (Modelo – Vista – Controlador), adaptada a una API REST donde la "vista" son respuestas JSON.

```
Cliente (React / Thunder Client)
        │
        ▼ HTTP (JSON)
┌───────────────────────────────────────┐
│  Express (app.js)                     │
│  ├── Middlewares globales             │
│  │   (CORS, Helmet, rate limit, XSS)  │
│  ├── /api/v1  →  Rutas versionadas    │
│  └── Manejadores de error             │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  Módulos de dominio (src/modules/)    │
│  ├── routes    → Define endpoints     │
│  ├── controller → Orquesta la lógica  │
│  ├── service   → Reglas de negocio    │
│  └── model     → Esquema Mongoose     │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  MongoDB                              │
└───────────────────────────────────────┘
```

### Flujo de una petición típica

1. El cliente envía una petición HTTP (por ejemplo `GET /api/v1/products`).
2. Express aplica middlewares globales (seguridad, parseo JSON, CORS).
3. El enrutador de `/api/v1` redirige al módulo correspondiente.
4. Si la ruta es protegida, se ejecuta `authMiddleware` y se verifica el JWT.
5. El **controlador** ejecuta la lógica llamando al **servicio** y al **modelo**.
6. Se devuelve una respuesta JSON con formato estándar `{ success, message?, data }`.

---

## Requisitos previos

Antes de empezar, necesitas tener instalado:

| Herramienta | Cómo verificar | Notas |
|-------------|----------------|-------|
| **Node.js** (v18+) | `node -v` | [nodejs.org](https://nodejs.org) |
| **npm** | `npm -v` | Viene con Node.js |
| **MongoDB** | Servicio activo | Local (`mongod`) o [MongoDB Atlas](https://www.mongodb.com/atlas) |
| **Git** (opcional) | `git -v` | Para clonar el repositorio |
| **VS Code + Thunder Client** (opcional) | — | Para probar endpoints sin frontend |

> **Opcional:** cuenta de [Stripe](https://stripe.com) en modo test para probar pagos.

---

## Instalación paso a paso

### 1. Clonar o abrir el proyecto

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

Este comando descarga todas las librerías listadas en `package.json` dentro de `node_modules/`.

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
# En Windows (PowerShell)
copy .env.example .env

# En Linux / macOS
cp .env.example .env
```

Abre `.env` y ajusta los valores (ver sección [Variables de entorno](#variables-de-entorno)).

### 4. Iniciar MongoDB

**MongoDB local (Windows):**
```powershell
mongod --dbpath "C:\data\db"
```

**MongoDB Atlas:** usa la cadena de conexión que te proporciona Atlas en `MONGO_URI`.

### 5. (Opcional) Poblar datos de ejemplo

```bash
npm run seed
```

Esto crea categorías, productos de muestra y usuarios de prueba en la base de datos.

### 6. Arrancar el servidor

```bash
npm run dev
```

Si todo está correcto verás en consola:

```
Server running on http://localhost:3000
```

La API estará disponible en: **`http://localhost:3000/api/v1`**

---

## Variables de entorno

Archivo: `backend/.env` (nunca subir a GitHub).

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `PORT` | `3000` | Puerto donde escucha el servidor |
| `NODE_ENV` | `development` | Entorno: `development` o `production` |
| `JWT_SECRET` | `secret` | Clave secreta para firmar tokens JWT. **Cámbiala en producción** |
| `JWT_EXPIRES_IN` | `8h` | Duración del token (ej: `1d`, `7d`, `8h`) |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/virtual-store` | Cadena de conexión a MongoDB |
| `STRIPE_SECRET` | *(vacío)* | Clave secreta de Stripe (`sk_test_...`) para pagos |

**Ejemplo completo de `.env`:**

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=mi_clave_super_secreta_cambiar_en_produccion
JWT_EXPIRES_IN=8h
MONGO_URI=mongodb://127.0.0.1:27017/virtual-store
STRIPE_SECRET=sk_test_tu_clave_de_stripe
```

---

## Comandos disponibles

| Comando | Qué hace |
|---------|----------|
| `npm install` | Instala todas las dependencias |
| `npm run dev` | Inicia el servidor con **nodemon** (recarga automática al guardar cambios) |
| `npm start` | Inicia el servidor en modo producción |
| `npm run seed` | Ejecuta `seed.js` para llenar la BD con datos de ejemplo |
| `npm run lint` | Placeholder (sin linter configurado aún) |

---

## Estructura del proyecto

```
backend/
├── src/
│   ├── server.js              # Punto de entrada: crea el servidor HTTP
│   ├── app.js                 # Configura Express y middlewares globales
│   ├── api/v1/                # Enrutador principal versionado
│   │   ├── index.js
│   │   └── routes.js          # Monta todos los módulos bajo /api/v1
│   ├── modules/               # Lógica de negocio por dominio
│   │   ├── auth/              # Registro, login, modelo User
│   │   ├── users/             # Perfil, avatar, listado
│   │   ├── products/          # CRUD de productos locales
│   │   ├── search/            # Búsqueda con scraping externo
│   │   ├── categories/        # Categorías del catálogo
│   │   ├── cart/              # Carrito de compras
│   │   ├── orders/            # Pedidos
│   │   ├── payments/          # Checkout y confirmación Stripe
│   │   ├── favorites/         # Productos favoritos
│   │   ├── reviews/           # Reseñas y calificaciones
│   │   ├── price-history/     # Historial de precios (modelo y jobs)
│   │   └── filters/           # Filtros de búsqueda
│   ├── providers/             # Scrapers por tienda externa
│   │   ├── amazon.provider.js
│   │   ├── mercadoLibre.provider.js
│   │   ├── cyberpuerta.provider.js
│   │   ├── ddtech.provider.js
│   │   ├── newegg.provider.js
│   │   └── index.js           # Orquestador de búsqueda multi-proveedor
│   ├── config/                # Puerto, MongoDB, CORS, rate limiter
│   ├── security/              # Helmet, sanitización, XSS
│   ├── shared/                # Middlewares y utilidades compartidas
│   │   ├── middlewares/       # auth, validación, errores
│   │   └── utils/             # asyncHandler, AppError, helpers
│   ├── cache/                 # Caché en memoria para búsquedas
│   ├── jobs/                  # Tareas cron (precios, etc.)
│   ├── monitoring/            # Métricas y tracing
│   └── uploads/               # Archivos subidos (avatares)
├── .env.example               # Plantilla de variables de entorno
├── docker-compose.yml         # Contenedor Docker opcional
├── seed.js                    # Script de datos iniciales
├── package.json
└── README.md                  # Este archivo
```

### ¿Qué hace cada carpeta importante?

| Carpeta | Responsabilidad |
|---------|-----------------|
| `src/api/v1/` | Agrupa todas las rutas bajo el prefijo `/api/v1` |
| `src/modules/*/` | Cada módulo tiene su propio `routes`, `controller`, `service` y `model` |
| `src/providers/` | Conecta con tiendas externas vía scraping (Puppeteer/Cheerio) |
| `src/shared/` | Código reutilizable: autenticación, manejo de errores, validación |
| `src/config/` | Lectura de `.env`, conexión MongoDB, límites de peticiones |
| `src/security/` | Protección contra ataques comunes (XSS, cabeceras inseguras) |
| `src/cache/` | Almacena resultados de búsqueda temporalmente para mejorar rendimiento |

---

## Base de datos MongoDB

Nombre de la base de datos por defecto: **`virtual-store`**

### Colecciones principales

#### `users` — Usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | String | Nombre del usuario |
| `email` | String | Correo único (se guarda en minúsculas) |
| `password` | String | Contraseña hasheada (nunca en texto plano) |
| `role` | String | `customer` o `admin` |
| `avatarUrl` | String | URL del avatar (opcional) |
| `createdAt` | Date | Fecha de registro |

#### `products` — Productos locales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | String | Nombre del producto |
| `description` | String | Descripción |
| `provider` | String | Origen: `amazon`, `mercadolibre`, etc. |
| `image` | String | URL de imagen |
| `price` | Number | Precio |
| `rating` | Number | Calificación 0–5 |
| `available` | Boolean | Disponibilidad |
| `url` | String | Enlace al producto original |
| `category` | String | Categoría (slug o nombre) |
| `specs` | Object | Especificaciones técnicas (JSON flexible) |
| `externalId` | String | ID en la tienda externa |

#### `categories` — Categorías

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | String | Nombre visible (ej: "Procesadores") |
| `slug` | String | Identificador URL (ej: `procesadores`) |

#### `carts` — Carritos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | ObjectId | Referencia al usuario (único por usuario) |
| `items[]` | Array | Lista de productos con cantidad y precio |
| `updatedAt` | Date | Última modificación |

#### `orders` — Pedidos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | ObjectId | Usuario que realizó el pedido |
| `items[]` | Array | Productos del pedido |
| `subtotal`, `tax`, `shipping`, `total` | Number | Desglose de costos |
| `status` | String | `pending`, `paid`, `shipped`, `cancelled` |
| `paymentStatus` | String | `unpaid`, `processing`, `paid`, `failed` |

#### `reviews` — Reseñas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `productId` | ObjectId | Producto reseñado |
| `userId` | ObjectId | Autor de la reseña |
| `rating` | Number | 0–5 |
| `comment` | String | Texto de la reseña |

### Diagrama de relaciones (simplificado)

```
User (1) ──────< (N) Order
User (1) ────── (1) Cart
User (1) ──────< (N) Review
User (1) ──────< (N) Favorite
Product (1) ───< (N) Review
Product (1) ───< (N) Cart.items
Category (1) ──< (N) Product (por campo category)
```

---

## API REST — Endpoints

**URL base:** `http://localhost:3000/api/v1`

> 🔒 = Requiere header `Authorization: Bearer <token_jwt>`

### Autenticación — `/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Registrar nuevo usuario |
| `POST` | `/auth/login` | No | Iniciar sesión y obtener JWT |

**Registro — ejemplo de petición:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "María García",
  "email": "maria@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "65f7e8d6...",
      "name": "María García",
      "email": "maria@ejemplo.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Login — ejemplo:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "maria@ejemplo.com",
  "password": "miPassword123"
}
```

**Validaciones de registro (Joi):**
- `name`: mínimo 2 caracteres, máximo 80
- `email`: formato de correo válido
- `password`: mínimo 6 caracteres

---

### Usuarios — `/users`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/users` | 🔒 | Listar usuarios |
| `GET` | `/users/me` | 🔒 | Obtener perfil del usuario autenticado |
| `PUT` | `/users/me` | 🔒 | Actualizar nombre, email, etc. |
| `PUT` | `/users/me/avatar` | 🔒 | Subir avatar (`multipart/form-data`, campo `avatar`) |

---

### Productos — `/products`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/products` | No | Listar productos locales (con filtros opcionales) |
| `GET` | `/products/:id` | No | Obtener un producto por ID |
| `POST` | `/products` | No | Crear producto |
| `PUT` | `/products/:id` | No | Actualizar producto |
| `DELETE` | `/products/:id` | No | Eliminar producto |

---

### Búsqueda — `/search`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/search` | No | Buscar productos en proveedores externos |

**Parámetros de consulta (query string):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `q` | string | Texto de búsqueda (ej: `rtx 4060`) |
| `category` | string | Filtrar por categoría |
| `minPrice` | number | Precio mínimo |
| `maxPrice` | number | Precio máximo |
| `provider` | string | Proveedor específico: `mercadolibre`, `cyberpuerta`, `ddtech`, `newegg`, `amazon` |
| `page` | number | Página (paginación) |
| `perPage` | number | Resultados por página (default: 25) |

**Ejemplo:**
```http
GET /api/v1/search?q=memoria+ram+DDR4&minPrice=50&maxPrice=200&page=1
```

> ⏱️ **Nota:** Las búsquedas con `q` pueden tardar varios segundos porque consultan tiendas externas en tiempo real. Los resultados se cachean 30 segundos.

**Proveedores integrados:**

| Proveedor | Archivo |
|-----------|---------|
| Amazon | `amazon.provider.js` |
| MercadoLibre | `mercadoLibre.provider.js` |
| Cyberpuerta | `cyberpuerta.provider.js` |
| DDTech | `ddtech.provider.js` |
| Newegg | `newegg.provider.js` |

---

### Categorías — `/categories`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/categories` | No | Listar todas las categorías |

---

### Carrito — `/cart`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/cart` | 🔒 | Ver carrito del usuario |
| `POST` | `/cart` | 🔒 | Agregar producto al carrito |
| `PUT` | `/cart/:productId` | 🔒 | Actualizar cantidad de un ítem |
| `DELETE` | `/cart/:productId` | 🔒 | Eliminar un ítem |
| `DELETE` | `/cart` | 🔒 | Vaciar carrito completo |

---

### Pedidos — `/orders`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/orders` | 🔒 | Crear pedido desde el carrito |
| `GET` | `/orders` | 🔒 | Listar pedidos del usuario |
| `GET` | `/orders/:id` | 🔒 | Detalle de un pedido |

---

### Pagos — `/payments`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/payments/checkout` | 🔒 | Crear intención de pago Stripe |
| `POST` | `/payments/confirm` | 🔒 | Confirmar pago y marcar pedido como pagado |

**Checkout — cuerpo de ejemplo:**
```json
{
  "orderId": "65f7e8d6...",
  "currency": "usd"
}
```

---

### Favoritos — `/favorites`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/favorites` | 🔒 | Listar favoritos del usuario |
| `POST` | `/favorites` | 🔒 | Agregar producto a favoritos |

**Agregar favorito:**
```json
{
  "productId": "65f7e8d6..."
}
```

---

### Reseñas — `/reviews`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/reviews/product/:productId` | No | Ver reseñas de un producto |
| `POST` | `/reviews` | 🔒 | Crear reseña |

**Crear reseña:**
```json
{
  "productId": "65f7e8d6...",
  "rating": 4.5,
  "comment": "Excelente relación calidad-precio"
}
```

---

### Métricas — `/metrics`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/metrics` | No | Métricas básicas del servidor |

---

## Formato de respuestas

Todas las respuestas siguen un formato consistente:

**Éxito:**
```json
{
  "success": true,
  "message": "Descripción opcional",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

**Búsqueda con paginación:**
```json
{
  "success": true,
  "data": {
    "items": [ /* productos */ ],
    "meta": {
      "page": 1,
      "perPage": 25,
      "hasMore": true
    }
  }
}
```

---

## Autenticación JWT

### ¿Cómo funciona?

1. El usuario se registra o inicia sesión en `/auth/register` o `/auth/login`.
2. El servidor devuelve un **token JWT** en `data.token`.
3. En peticiones protegidas, el cliente envía el header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. `authMiddleware` verifica la firma y la expiración del token.
5. Si es válido, adjunta `req.user` con `{ id, email, role }`.

### Flujo de registro (paso a paso)

```
Cliente                    Servidor                   MongoDB
   │                          │                          │
   │── POST /auth/register ──>│                          │
   │                          │── Validar con Joi ──────>│
   │                          │── Buscar email ────────>│
   │                          │<─ No existe ─────────────│
   │                          │── Hash password ───────>│
   │                          │── Guardar usuario ─────>│
   │                          │── Firmar JWT ────────────│
   │<── 201 + user + token ───│                          │
```

### Flujo de login (paso a paso)

```
Cliente                    Servidor                   MongoDB
   │                          │                          │
   │── POST /auth/login ─────>│                          │
   │                          │── Buscar por email ────>│
   │                          │<─ Usuario + hash ────────│
   │                          │── Comparar password ────│
   │                          │── Firmar JWT ────────────│
   │<── 200 + user + token ───│                          │
```

---

## Búsqueda y scraping de productos

Cuando el usuario busca con el parámetro `q`, el backend:

1. Revisa si hay resultados en **caché** (30 segundos).
2. Consulta en paralelo los **proveedores externos** configurados.
3. **Normaliza** los resultados a un formato común.
4. Aplica **filtros** (categoría, precio mínimo/máximo).
5. Elimina **duplicados** y ordena por precio.
6. Devuelve los resultados paginados.

Si `q` está vacío, devuelve productos **locales** de MongoDB (útil tras ejecutar `npm run seed`).

> ⚠️ Los sitios externos pueden cambiar su HTML. Si un proveedor deja de funcionar, revisa los selectores en `src/providers/*.provider.js`.

---

## Pagos con Stripe

1. El usuario crea un **pedido** (`POST /orders`).
2. El frontend llama a `POST /payments/checkout` con el `orderId`.
3. El backend crea un **PaymentIntent** en Stripe con el monto del pedido.
4. Tras el pago en el cliente Stripe, se confirma con `POST /payments/confirm`.
5. Si el pago fue exitoso, el pedido pasa a estado `paid`.

Necesitas configurar `STRIPE_SECRET` con tu clave de prueba (`sk_test_...`).

---

## Seguridad implementada

| Medida | Implementación |
|--------|----------------|
| Hash de contraseñas | Se hashean antes de guardar (nunca texto plano) |
| JWT | Tokens firmados con `JWT_SECRET`, expiración configurable |
| Helmet | Cabeceras HTTP de seguridad automáticas |
| Rate limiting | Límite de peticiones por IP para evitar abuso |
| Sanitización / XSS | Middlewares que limpian entradas peligrosas |
| Validación Joi | Todos los inputs de auth se validan antes del controlador |
| CORS | Permite peticiones desde el frontend |
| Password oculto | El método `toJSON()` del modelo User elimina `password` |

---

## Patrones de diseño

| Patrón | Dónde se aplica |
|--------|-----------------|
| **MVC** | `model` + `controller` + respuesta JSON por módulo |
| **Middleware Chain** | Cadena de funciones en `app.js` y rutas |
| **asyncHandler** | Wrapper que captura errores async y los pasa a `next()` |
| **AppError** | Clase de error personalizada con código HTTP |
| **Repository (lite)** | Servicios usan Mongoose como capa de acceso a datos |
| **Strategy** | Proveedores de scraping intercambiables en `providers/` |
| **Singleton** | Conexión única a MongoDB reutilizada |

---

## Probar la API (Thunder Client / Postman)

### Preparación

1. Arranca el backend: `npm run dev`
2. Abre **Thunder Client** en VS Code (o Postman).
3. Base URL: `http://localhost:3000/api/v1`

### Secuencia recomendada de pruebas

| Paso | Método | Endpoint | Qué validar |
|------|--------|----------|-------------|
| 1 | `POST` | `/auth/register` | Código 201 y token en respuesta |
| 2 | `POST` | `/auth/login` | Código 200 y token |
| 3 | `GET` | `/categories` | Lista de categorías |
| 4 | `GET` | `/search?q=procesador` | Productos externos (puede tardar) |
| 5 | `GET` | `/products` | Productos locales (tras `npm run seed`) |
| 6 | `POST` | `/cart` | Agregar al carrito (con token) |
| 7 | `GET` | `/cart` | Ver carrito (con token) |
| 8 | `POST` | `/orders` | Crear pedido (con token) |
| 9 | `GET` | `/orders` | Listar pedidos (con token) |

### Pruebas de seguridad esperadas

| Escenario | Respuesta esperada |
|-----------|-------------------|
| `GET /cart` sin token | `401 Unauthorized` |
| Registro con email duplicado | `409 Conflict` |
| Login con contraseña incorrecta | `401 Unauthorized` |
| Token expirado o manipulado | `401 Unauthorized` |

---

## Docker

Existe un `docker-compose.yml` básico:

```bash
docker-compose up
```

Expone el puerto **3000**. Asegúrate de que MongoDB sea accesible desde el contenedor (puede requerir ajustar `MONGO_URI`).

---

## Errores comunes y soluciones

### `EADDRINUSE: address already in use :::3000`

El puerto 3000 ya está ocupado por otro proceso.

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

### `MongoNetworkError` — No se puede conectar a MongoDB

- Verifica que MongoDB esté ejecutándose.
- Revisa que `MONGO_URI` en `.env` sea correcta.
- Si usas Atlas, comprueba que tu IP esté en la lista blanca.

### El scraper no devuelve productos

- Los sitios externos cambian su estructura HTML con frecuencia.
- Prueba con otro proveedor usando `?provider=mercadolibre`.
- Revisa los logs del servidor para ver errores de Puppeteer.

### `401 Unauthorized` en rutas protegidas

- Verifica que envías el header: `Authorization: Bearer <token>`.
- El token puede haber expirado; vuelve a hacer login.

### Variables de entorno no cargan

- El archivo debe llamarse exactamente `.env` y estar en la carpeta `backend/`.
- Reinicia el servidor después de cambiar `.env`.

---

## Relación con el frontend

El frontend React (carpeta `frontend/`) consume esta API mediante **Axios**.

| Configuración | Valor |
|---------------|-------|
| URL del backend | `http://127.0.0.1:3000/api/v1` |
| Puerto del frontend (Vite) | `5174` |
| Autenticación | JWT en `localStorage`, enviado automáticamente por interceptor |

**Orden de arranque recomendado:**

1. MongoDB
2. `cd backend && npm run dev`
3. `cd frontend && npm run dev`
4. Abrir `http://localhost:5174`

---

## Criterios del proyecto MERN

Este backend cumple los requisitos del proyecto académico MERN:

| Criterio | Cómo se cumple |
|----------|----------------|
| **Node.js + Express** | Servidor en `src/server.js` y `src/app.js` |
| **Arquitectura MVC** | Modelos Mongoose + controladores + rutas |
| **API REST con JSON** | Prefijo `/api/v1`, respuestas `{ success, data }` |
| **MongoDB + Mongoose** | Colecciones documentadas arriba |
| **JWT** | Autenticación en módulo `auth/` |
| **CRUD** | Productos, usuarios, carrito, pedidos, reseñas |
| **Validación** | Joi en auth y otros módulos |

---

## Licencia

Proyecto académico — consulta el repositorio para detalles de licencia.

---

**¿Dudas?** Revisa los archivos en `src/modules/` o abre un issue en el repositorio de GitHub.
