const express = require('express');
const router  = express.Router();

const {
  crear, listar, obtener, porCedula, actualizar, eliminar, descargarRut,
} = require('../controllers/clienteController');

const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadPdf }      = require('../middlewares/uploadMiddleware');
const { validarCliente } = require('../middlewares/validateMiddleware');

router.use(authMiddleware);

// Manejo de error de multer (tipos/limites)
const handleMulter = (handler) => (req, res, next) => {
  handler(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'El PDF supera el tamaño máximo permitido'
        : (err.message || 'Error al cargar el archivo');
      return res.status(400).json({ error: msg });
    }
    next();
  });
};

// GET  /api/clientes
router.get('/', listar);

// GET  /api/clientes/cedula/:cedula
router.get('/cedula/:cedula', porCedula);

// GET  /api/clientes/:id
router.get('/:id', obtener);

// GET  /api/clientes/:id/rut
router.get('/:id/rut', descargarRut);

// POST /api/clientes (multipart con campo "rut")
router.post('/',
  handleMulter(uploadPdf.single('rut')),
  validarCliente,
  crear,
);

// PUT  /api/clientes/:id
router.put('/:id',
  handleMulter(uploadPdf.single('rut')),
  validarCliente,
  actualizar,
);

// DELETE /api/clientes/:id
router.delete('/:id', eliminar);

module.exports = router;
