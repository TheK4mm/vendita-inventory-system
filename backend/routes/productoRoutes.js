const express = require('express');
const router  = express.Router();

const {
  crear, listar, obtener, actualizar, eliminar, categorias,
} = require('../controllers/productoController');

const { authMiddleware }  = require('../middlewares/authMiddleware');
const { validarProducto } = require('../middlewares/validateMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET  /api/productos           → Listar con filtros y paginación
router.get('/', listar);

// GET  /api/productos/categorias → Categorías únicas
router.get('/categorias', categorias);

// GET  /api/productos/:id        → Obtener uno
router.get('/:id', obtener);

// POST /api/productos            → Crear
router.post('/', validarProducto, crear);

// PUT  /api/productos/:id        → Actualizar
router.put('/:id', validarProducto, actualizar);

// DELETE /api/productos/:id      → Eliminar
router.delete('/:id', eliminar);

module.exports = router;
