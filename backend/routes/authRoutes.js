const express = require('express');
const router  = express.Router();

<<<<<<< HEAD
const { register, login, perfil, forgotPassword, resetPassword } = require('../controllers/authController');
const { authMiddleware }               = require('../middlewares/authMiddleware');
const { validarRegistro, validarLogin, validarForgot, validarReset } = require('../middlewares/validateMiddleware');
=======
const { register, login, perfil }      = require('../controllers/authController');
const { authMiddleware }               = require('../middlewares/authMiddleware');
const { validarRegistro, validarLogin } = require('../middlewares/validateMiddleware');
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978

// POST /api/auth/register
router.post('/register', validarRegistro, register);

// POST /api/auth/login
router.post('/login', validarLogin, login);

<<<<<<< HEAD
// POST /api/auth/forgot-password
router.post('/forgot-password', validarForgot, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validarReset, resetPassword);

=======
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
// GET  /api/auth/perfil  (protegida)
router.get('/perfil', authMiddleware, perfil);

module.exports = router;
