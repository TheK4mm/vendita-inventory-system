const { body } = require('express-validator');

// ── Validaciones de autenticación ──────────────────────────────────────────
const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El formato del email es inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El formato del email es inválido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];

// ── Validaciones de productos ──────────────────────────────────────────────
const validarProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre del producto es obligatorio')
    .isLength({ max: 150 }).withMessage('El nombre no puede superar 150 caracteres'),

  body('categoria')
    .trim()
    .notEmpty().withMessage('La categoría es obligatoria'),

  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo'),

  body('estado')
    .optional()
    .isIn(['activo', 'inactivo', 'agotado']).withMessage('Estado inválido'),

  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no puede superar 500 caracteres'),
];

// ── Validaciones de recuperación de contraseña ─────────────────────────────
const validarForgot = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El formato del email es inválido'),
];

const validarReset = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El formato del email es inválido'),
  body('token')
    .trim()
    .notEmpty().withMessage('El token es obligatorio'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// ── Validaciones de clientes ───────────────────────────────────────────────
const validarCliente = [
  body('cedula')
    .trim()
    .notEmpty().withMessage('La cédula es obligatoria')
    .isLength({ min: 5, max: 20 }).withMessage('La cédula debe tener entre 5 y 20 caracteres'),

  body('nombres')
    .trim()
    .notEmpty().withMessage('Los nombres son obligatorios')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos son obligatorios')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido'),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio')
    .isLength({ max: 20 }).withMessage('Máximo 20 caracteres'),

  body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),
];

// ── Validaciones de ventas ─────────────────────────────────────────────────
const validarVenta = [
  body('clienteId')
    .notEmpty().withMessage('El cliente es obligatorio'),
  body('items')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.productoId')
    .notEmpty().withMessage('Id de producto requerido'),
  body('items.*.cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero positivo'),
];

module.exports = {
  validarRegistro,
  validarLogin,
  validarProducto,
  validarForgot,
  validarReset,
  validarCliente,
  validarVenta,
};
