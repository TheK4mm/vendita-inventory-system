const express = require('express');
const router  = express.Router();

const { resumen, reportePDF } = require('../controllers/cajaController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/',         resumen);
router.get('/reporte',  reportePDF);

module.exports = router;
