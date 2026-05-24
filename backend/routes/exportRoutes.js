const express = require('express');
const router  = express.Router();

const { exportXLSX, exportPDF } = require('../controllers/exportController');
const { authMiddleware }        = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// GET /api/export/xlsx
router.get('/xlsx', exportXLSX);

// GET /api/export/pdf
router.get('/pdf', exportPDF);

module.exports = router;
