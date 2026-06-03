# TecStore - Frontend Futurista

Frontend moderno y futurista para una tienda tecnológica construido con React, Tailwind CSS y Framer Motion.

## ✨ Características

### Módulos Implementados

- **🔐 Autenticación**: Sistema de login/registro con JWT
- **🏪 Productos**: Catálogo completo con búsqueda y filtros avanzados
- **🛒 Carrito**: Carrito de compras interactivo con gestión de cantidad
- **❤️ Favoritos**: Guarda tus productos favoritos
- **📦 Órdenes**: Historial y seguimiento de pedidos
- **👤 Perfil**: Gestión de datos personales del usuario
- **💰 Historial de Precios**: Seguimiento de cambios de precio
- **🔥 Ofertas**: Página especial para productos con descuento
- **⭐ Reseñas**: Sistema de calificaciones y comentarios

## 🎨 Diseño

- **Interfaz Futurista**: Tema oscuro con gradientes y efectos neón
- **Animaciones Suaves**: Powered by Framer Motion
- **Componentes Reutilizables**: GlassCard, Badge, Button, Input personalizados
- **Responsive Design**: Funciona perfectamente en móvil, tablet y desktop
- **Estado Global**: Zustand para gestión de estado

## 🛠️ Tecnologías

- **React 18.2** - Framework principal
- **React Router v6** - Routing
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **Zustand** - Estado global
- **Axios** - Requests HTTP
- **React Hot Toast** - Notificaciones
- **React Icons** - Iconos

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env en la raíz del proyecto
VITE_API_URL=http://localhost:3001/api/v1
```

## 🚀 Ejecutar

### Modo Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Construir para Producción
```bash
npm run build
```

### Preview de Producción
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── pages/              # Páginas principales
│   │   ├── Home.jsx
│   │   ├── Store.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Orders.jsx
│   │   ├── Profile.jsx
│   │   ├── Favorites.jsx
│   │   ├── PriceHistory.jsx
│   │   ├── Deals.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── components/
│   │   ├── common/         # Componentes reutilizables
│   │   ├── layout/         # Header y Sidebar
│   │   └── product/        # Componentes de productos
│   ├── services/
│   │   └── api.js          # Servicios HTTP
│   ├── store/
│   │   └── store.js        # Estado global con Zustand
│   ├── App.jsx             # Componente raíz
│   ├── main.jsx            # Entry point
│   └── styles.css          # Estilos globales
├── tailwind.config.js      # Configuración Tailwind
├── postcss.config.js       # Configuración PostCSS
├── vite.config.js          # Configuración Vite
├── package.json
└── index.html
```

## 🎯 API Endpoints Utilizados

La aplicación se conecta a los siguientes endpoints del backend:

- **Auth**: `/auth/register`, `/auth/login`
- **Users**: `/users/me`, `/users/profile`
- **Products**: `/products`, `/products/:id`
- **Search**: `/search`, `/search/suggestions`
- **Categories**: `/categories`
- **Cart**: `/cart`, `/cart/items`
- **Orders**: `/orders`, `/orders/:id`
- **Favorites**: `/favorites`
- **Reviews**: `/reviews`
- **Price History**: `/price-history/:productId`

## 🎨 Colores del Tema

- **Primario**: `#0f172a` (Azul oscuro)
- **Secundario**: `#1e293b` (Gris oscuro)
- **Accent**: `#3b82f6` (Azul brillante)
- **Éxito**: `#10b981` (Verde)
- **Advertencia**: `#f59e0b` (Naranja)
- **Peligro**: `#ef4444` (Rojo)

## 🔐 Seguridad

- Tokens JWT almacenados en `localStorage`
- Protección de rutas (ProtectedRoute)
- CORS habilitado en solicitudes API

## 📱 Características Responsive

- Diseño Mobile-First
- Sidebar colapsable en dispositivos pequeños
- Menú hamburguesa para navegación móvil
- Adaptación de grid según pantalla

## 🚀 Deploy

```bash
# Build para producción
npm run build

# Sirve los archivos estáticos desde la carpeta dist/
```

## 📝 Variables de Entorno

```
VITE_API_URL=http://localhost:3001/api/v1
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

## 📞 Soporte

Para soporte, abre un issue en el repositorio o contacta al equipo de desarrollo.

---

**Hecho con ❤️ para una experiencia de compra futurista**
