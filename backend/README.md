# 🛒 Backend de Tienda Virtual - Componentes de Computadora

Un backend completo para una tienda virtual que extrae productos reales de proveedores externos como Amazon y MercadoLibre, y ofrece módulos de carrito, pedidos, pagos y autenticación.

## 📌 Qué hace este proyecto

- 🔍 Busca productos reales de internet usando scraping en proveedores externos.
- 🛒 Administra carrito de compras y productos favoritos.
- 💳 Integra pagos con Stripe.
- 🔐 Ofrece login/registro con JWT.
- 🗃️ Usa MongoDB para almacenar usuarios, productos, pedidos y datos de configuración.
- 🚀 Tiene una arquitectura modular pensada para escalar.

## 🧱 Tecnologías principales

- Node.js
- Express.js
- MongoDB + Mongoose
- Puppeteer para scraping
- Stripe para pagos
- dotenv para configuración
- nodemon para desarrollo

## 📁 Estructura del proyecto

```
backend/
├── src/
│   ├── api/v1/                 # Rutas versionadas de la API
│   │   ├── index.js
│   │   └── routes.js
│   ├── modules/                # Lógica de negocio por dominio
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── favorites/
│   │   ├── filters/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── price-history/
│   │   ├── products/
│   │   ├── reviews/
│   │   ├── search/
│   │   └── users/
│   ├── providers/             # Scrapers para proveedores externos
│   │   ├── amazon.provider.js
│   │   ├── cyberpuerta.provider.js
│   │   ├── ddtech.provider.js
│   │   └── mercadoLibre.provider.js
│   ├── cache/                 # Cache local para búsquedas
│   ├── config/                # Configuración global
│   │   ├── cors.js
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── index.js
│   │   ├── logger.js
│   │   ├── mongo.js
│   │   └── rateLimiter.js
│   ├── docs/                  # Swagger / docs de API
│   ├── dto/                   # Data Transfer Objects
│   ├── jobs/                  # Tareas programadas
│   ├── mappers/               # Mapeadores de datos
│   ├── monitoring/            # Métricas y tracing
│   ├── security/              # Middlewares de seguridad
│   ├── shared/                # Constantes, middlewares y utilidades
│   └── uploads/               # Archivos subidos
├── .env                       # Variables de entorno local (no subir)
├── docker-compose.yml         # Configuración Docker
├── package.json               # Dependencias y scripts
├── README.md                  # Documentación del proyecto
└── seed.js                    # Script para poblar datos iniciales
```

## 🚀 Requisitos

- Node.js >= 18
- npm
- MongoDB local o Atlas
- (Opcional) Docker
- (Opcional) Thunder Client / Postman

## ⚙️ Instalación

```bash
cd backend
npm install
```

## 🌍 Variables de entorno

Crea el archivo `.env` y define al menos:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=tu_jwt_secret
MONGO_URI=mongodb://127.0.0.1:27017/virtual-store
STRIPE_SECRET=sk_test_tu_clave_de_stripe
```

> El backend usa `PORT=3001` por defecto si no se especifica.

## ▶️ Comandos útiles

- `npm run dev` — Inicia el servidor en modo desarrollo con `nodemon`.
- `npm start` — Inicia en modo producción.
- `npm run seed` — Pobla la base de datos con datos de ejemplo.

## 📌 Cómo arrancar

1. Asegúrate de que MongoDB esté corriendo.
2. Ejecuta:
   ```bash
   npm run dev
   ```
3. Abre el navegador o Thunder Client en:
   ```
   http://localhost:3001
   ```

## 🔎 Endpoints principales

### Búsqueda de productos externos

```http
GET /api/v1/search?q=teclado
```

### Autenticación

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Productos

```http
GET /api/v1/products
GET /api/v1/products/:id
```

### Carrito

```http
POST /api/v1/cart
GET /api/v1/cart
```

### Pedidos

```http
POST /api/v1/orders
GET /api/v1/orders
```

> Revisa `src/modules/*/*.routes.js` para ver todas las rutas disponibles.

## 🛰️ Qué hace cada carpeta

- `src/api/v1/`: enrutador principal y versión de API.
- `src/modules/`: controladores, servicios, modelos y validadores por módulo.
- `src/providers/`: scrapers específicos de cada tienda.
- `src/config/`: configuración de entorno, MongoDB, CORS y rate limiting.
- `src/security/`: middleware de helmet, sanitización y XSS.
- `src/cache/`: cache de resultados para mejorar rendimiento.
- `src/jobs/`: tareas automáticas programadas.
- `src/monitoring/`: métricas del backend.

## 🧪 Probar con Thunder Client

1. Abre Thunder Client en VS Code.
2. Crea una nueva request `GET`.
3. URL:
   ```
   http://localhost:3001/api/v1/search?q=teclado
   ```
4. Haz clic en `Send`.
5. Revisa la respuesta JSON.

## ⚠️ Errores comunes y soluciones

### 1. `Error: listen EADDRINUSE: address already in use :::3001`

Significa que ya hay un proceso usando el puerto `3001`.

#### Solución:

```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
npm run dev
```

#### Recomendación:
- Solo ejecuta `npm run dev` en una terminal por proyecto.
- Si ya tienes el servidor en ejecución, usa otra terminal o Thunder Client para hacer requests.
- Usa `Ctrl+C` en la terminal donde corre el servidor para detenerlo.

### 2. `MongoNetworkError` o conexión a MongoDB fallida

Asegúrate de que MongoDB esté encendido y que `MONGO_URI` sea correcta.

#### MongoDB local:
```powershell
mongod --dbpath "C:\data\db"
```

### 3. Variables de entorno faltantes

Verifica que `.env` incluya:
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `MONGO_URI`
- `STRIPE_SECRET`

### 4. El scraper no devuelve productos

- Los proveedores externos pueden cambiar su HTML.
- Revisa y ajusta selectores en `src/providers/*.provider.js`.
- El endpoint de búsqueda puede tardar varios segundos porque hace scraping en vivo.

## 📦 Scripts disponibles

- `npm install` — instala dependencias.
- `npm run dev` — arranca con `nodemon` en modo desarrollo.
- `npm start` — arranca en modo producción.
- `npm run seed` — ejecuta `seed.js` para llenar la BD con datos de ejemplo.

## 📝 Notas finales

- El backend está pensado para obtener datos reales a partir de scraping.
- El puerto por defecto es `3001`.
- Si tu servidor ya está corriendo, no ejecutes `npm run dev` otra vez en el mismo puerto.
- Usa Thunder Client o Postman para probar los endpoints y ver la respuesta JSON.

---

Si quieres, puedo agregar una sección con ejemplos de request/response exactos para `search`, `auth`, `cart` y `orders`.
