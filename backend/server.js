require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const connectMongo    = require('./config/db.mongo');
const connectPostgres = require('./config/db.postgres');

const authRoutes     = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const exportRoutes   = require('./routes/exportRoutes');
<<<<<<< HEAD
const clienteRoutes  = require('./routes/clienteRoutes');
const ventaRoutes    = require('./routes/ventaRoutes');
const cajaRoutes     = require('./routes/cajaRoutes');
=======
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978

const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
<<<<<<< HEAD
app.use('/api/auth',      authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/export',    exportRoutes);
app.use('/api/clientes',  clienteRoutes);
app.use('/api/ventas',    ventaRoutes);
app.use('/api/caja',      cajaRoutes);
=======
app.use('/api/auth',     authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/export',   exportRoutes);
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Manejo de rutas no encontradas ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Manejo global de errores ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Inicialización ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectPostgres();
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 Entorno: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
})();
