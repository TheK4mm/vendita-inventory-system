## Arquitectura

```
<<<<<<< HEAD
vendita-app/
=======
tienda-app/
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
├── backend/                  # Node.js + Express
│   ├── config/
│   │   ├── db.postgres.js    # Conexión PostgreSQL (autenticación)
│   │   └── db.mongo.js       # Conexión MongoDB (productos)
│   ├── controllers/
│   │   ├── authController.js      # Registro, login, perfil
│   │   ├── productoController.js  # CRUD productos
│   │   └── exportController.js    # Generación PDF y XLSX
│   ├── middlewares/
│   │   ├── authMiddleware.js      # Verificación JWT
│   │   └── validateMiddleware.js  # Validaciones express-validator
│   ├── models/
│   │   └── Producto.js       # Esquema Mongoose
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productoRoutes.js
│   │   └── exportRoutes.js
│   ├── .env.example          # Variables de entorno requeridas
│   ├── package.json
│   └── server.js             # Punto de entrada
│
├── frontend/                 # React 18
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx         # Barra de navegación
│       │   ├── PrivateRoute.jsx   # Protección de rutas
│       │   ├── ProductForm.jsx    # Modal crear/editar producto
│       │   └── ConfirmModal.jsx   # Modal confirmar eliminación
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Productos.jsx      # Listado + CRUD completo
│       │   └── Dashboard.jsx      # Estadísticas + exportación
│       ├── services/
│       │   ├── api.js             # Axios + helpers de exportación
│       │   └── AuthContext.js     # Contexto global de sesión
│       ├── styles/
│       │   └── global.css
│       ├── App.js
│       └── index.js
│
├── database/
│   └── init.sql              # Script PostgreSQL
└── .vscode/
    ├── launch.json
    └── extensions.json
```

# VenditaApp — Gestión de Productos

Aplicación web fullstack para administrar el inventario de una tienda. Permite registrarse, iniciar sesión y gestionar productos mediante un CRUD completo, con exportación de reportes en PDF y Excel.

---

## ¿Qué hace esta aplicación?

1. El usuario se registra o inicia sesión (datos guardados en PostgreSQL).
2. Accede al módulo de productos para crear, ver, editar y eliminar artículos (guardados en MongoDB).
3. Puede filtrar productos por nombre, categoría o estado.
4. Desde el Dashboard visualiza estadísticas del inventario.
5. Puede exportar toda la colección de productos en formato PDF o Excel.

---

## Tecnologías utilizadas

### Backend

**Node.js + Express**: 
Servidor y API REST
**PostgreSQL + pg**: 
Almacena usuarios y credenciales
**MongoDB + Mongoose**:
Almacena los productos de la tienda
**bcryptjs**: 
Cifrado de contraseñas
**jsonwebtoken**: 
Autenticación por token JWT
**express-validator**: 
Validación de datos en cada endpoint
**ExcelJS**: 
Generación de archivos `.xlsx` con estilos
**PDFKit**: 
Generación de reportes `.pdf`

### Frontend

**React 18**: 
Interfaz de usuario
**React Router 6**: 
Navegación y rutas protegidas
**Axios**: 
Comunicación con la API
**react-hot-toast**:
Notificaciones visuales

---

## ¿Cómo ejecutarlo?

### Requisitos previos
- Node.js 18+, PostgreSQL 14+, MongoDB 6+

### Pasos

```bash
# 1. Crear la base de datos
psql -U postgres -c "CREATE DATABASE tienda_db;"
psql -U postgres -d tienda_db -f database/init.sql

# 2. Configurar variables de entorno del backend
# Abre .env y completa tus credenciales de PostgreSQL y MongoDB

# 3. Instalar e iniciar el backend (puerto 5000)
cd backend
npm install
npm run dev

# 4. En otra terminal, instalar e iniciar el frontend (puerto 3000)
cd frontend
npm install
npm start
```

Abre `http://localhost:3000` en el navegador.

---

## Endpoints principales de la API

```
POST   /api/auth/register       → Crear cuenta
POST   /api/auth/login          → Iniciar sesión

GET    /api/productos            → Listar (filtros + paginación)
POST   /api/productos            → Crear producto
PUT    /api/productos/:id        → Editar producto
DELETE /api/productos/:id        → Eliminar producto

GET    /api/export/xlsx          → Descargar reporte Excel
GET    /api/export/pdf           → Descargar reporte PDF
```

Todos los endpoints de productos y exportación requieren el header:
```
Authorization: Bearer <token>
```

---

<<<<<<< HEAD
## 🆕 Módulos agregados (extensión)

Se añadieron sobre la base existente, sin reestructurar ni romper la lógica original.

### 1. Recuperación de contraseña
- Enlace en la pantalla de **Login** → `/forgot-password`
- Vista de restablecimiento → `/reset-password?token=...&email=...`
- Token aleatorio (hex 64) hasheado SHA-256 en BD, válido por 30 minutos por defecto.
- Envío por correo (nodemailer). Si no hay SMTP configurado, se imprime en consola en modo desarrollo.

### 2. Clientes (con RUT en PDF)
- Página **Clientes** (`/clientes`) con listado, búsqueda, alta, edición y eliminación.
- El RUT se sube en formato PDF (máx. 5 MB) y se guarda como `Buffer` en MongoDB (`Cliente.rut`).
- Búsqueda por cédula reutilizable desde el módulo de ventas.

### 3. Ventas
- Página **Ventas** (`/ventas`) y modal `VentaForm` con:
  - Búsqueda de cliente por cédula y registro inline si no existe.
  - Listado de productos con stock visible (no permite agregar productos agotados).
  - Validación de stock al agregar y al finalizar la venta.
  - Descuento atómico de stock por producto.
  - Generación de **factura PDF** al finalizar y opción de **reimpresión**.

### 4. Saldo en caja
- Página **Caja** (`/caja`) con saldo acumulado, número de ventas y tabla histórica.
- Botón **Descargar PDF** para reporte completo de caja.

---

## 🔧 Variables de entorno adicionales

Agrega al `.env` del backend (todas opcionales):

```
# Recuperación de contraseña
RESET_TOKEN_MIN=30            # Minutos de validez del token

# Envío de correo (si no se configura, se imprime en consola)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=clave_de_aplicacion
SMTP_FROM=VenditaApp <no-reply@venditaapp.local>

# Carga de PDFs (clientes)
MAX_PDF_MB=5

# Ventas
VENTA_IVA_PORCENTAJE=0        # 0 por defecto; usar 19 para Colombia, etc.
```

## 📡 Endpoints adicionales

```
POST   /api/auth/forgot-password    → Solicita correo de recuperación
POST   /api/auth/reset-password     → Restablece la contraseña con el token

GET    /api/clientes                → Listar clientes (filtros + paginación)
GET    /api/clientes/cedula/:cedula → Buscar cliente por cédula
GET    /api/clientes/:id            → Obtener cliente
GET    /api/clientes/:id/rut        → Descargar RUT (PDF)
POST   /api/clientes                → Crear cliente (multipart: campo "rut")
PUT    /api/clientes/:id            → Actualizar cliente (multipart opcional)
DELETE /api/clientes/:id            → Eliminar cliente

GET    /api/ventas                  → Listar ventas
GET    /api/ventas/:id              → Detalle de venta
GET    /api/ventas/:id/factura      → Factura PDF (inline)
POST   /api/ventas                  → Registrar venta { clienteId, items[] }

GET    /api/caja                    → Saldo acumulado + histórico
GET    /api/caja/reporte            → Reporte PDF de caja
```

Todos los endpoints nuevos (excepto `forgot-password` y `reset-password`) requieren
el header `Authorization: Bearer <token>`.

**Cómo probar cada funcionalidad**

1. **Recuperar contraseña:** en `/login` haz clic en *¿Olvidaste tu contraseña?*, ingresa
   tu email y revisa el correo (o la consola del backend en modo dev). Abre el enlace
   recibido o copia el token en `/reset-password`.
2. **Clientes:** ve a *Clientes* → ＋ Nuevo Cliente, adjunta el RUT en PDF y guarda.
   Verifica que aparece "📄 Ver" para abrir el PDF.
3. **Venta:** *Ventas* → ＋ Nueva venta, busca por cédula (o crea cliente inline),
   agrega productos del catálogo. La venta no se finaliza si no hay stock. Al
   finalizar se abre la factura PDF automáticamente; usa "📄 Reimprimir" para volver
   a abrirla.
4. **Caja:** *Caja* → verás el saldo acumulado, el histórico y el botón *Descargar PDF*.
=======
## 👤 Camilo
Proyecto académico desarrollado con arquitectura híbrida (SQL + NoSQL), API REST y frontend moderno en React.

---
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
