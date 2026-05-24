const express = require('express');
const router  = express.Router();

const { register, login, perfil, forgotPassword, resetPassword } = require('../controllers/authController');
const { authMiddleware }               = require('../middlewares/authMiddleware');
const { validarRegistro, validarLogin, validarForgot, validarReset } = require('../middlewares/validateMiddleware');

// POST /api/auth/register
router.post('/register', validarRegistro, register);

// POST /api/auth/login
router.post('/login', validarLogin, login);

// POST /api/auth/forgot-password
router.post('/forgot-password', validarForgot, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validarReset, resetPassword);

// GET  /api/auth/perfil  (protegida)
router.get('/perfil', authMiddleware, perfil);

module.exports = router;
