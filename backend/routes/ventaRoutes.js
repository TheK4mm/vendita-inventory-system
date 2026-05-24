const express = require('express');
const router  = express.Router();

const { crear, listar, obtener, factura } = require('../controllers/ventaController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validarVenta }   = require('../middlewares/validateMiddleware');

router.use(authMiddleware);

router.get('/',             listar);
router.get('/:id',          obtener);
router.get('/:id/factura',  factura);
router.post('/', validarVenta, crear);

module.exports = router;
