const { validationResult } = require('express-validator');
const Producto = require('../models/Producto');

// ── Crear producto ─────────────────────────────────────────────────────────
const crear = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const producto = new Producto({
      ...req.body,
      creadoPor: req.usuario.id,
    });
    await producto.save();
    return res.status(201).json({ message: 'Producto creado', producto });
  } catch (err) {
    console.error('Error al crear producto:', err);
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: msgs });
    }
    return res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// ── Listar productos (con filtros y paginación) ────────────────────────────
const listar = async (req, res) => {
  try {
    const {
      buscar  = '',
      categoria,
      estado,
      pagina  = 1,
      limite  = 10,
      orden   = 'fechaRegistro',
      dir     = 'desc',
    } = req.query;

    const filtro = {};

    if (buscar) {
      filtro.$or = [
        { nombre:    { $regex: buscar, $options: 'i' } },
        { categoria: { $regex: buscar, $options: 'i' } },
        { descripcion: { $regex: buscar, $options: 'i' } },
      ];
    }
    if (categoria) filtro.categoria = { $regex: categoria, $options: 'i' };
    if (estado)    filtro.estado = estado;

    const skip   = (parseInt(pagina) - 1) * parseInt(limite);
    const sortDir = dir === 'asc' ? 1 : -1;

    const [productos, total] = await Promise.all([
      Producto.find(filtro)
        .sort({ [orden]: sortDir })
        .skip(skip)
        .limit(parseInt(limite)),
      Producto.countDocuments(filtro),
    ]);

    return res.json({
      productos,
      total,
      pagina:     parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (err) {
    console.error('Error al listar productos:', err);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ── Obtener un producto ────────────────────────────────────────────────────
const obtener = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json({ producto });
  } catch (err) {
    console.error('Error al obtener producto:', err);
    return res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// ── Actualizar producto ────────────────────────────────────────────────────
const actualizar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json({ message: 'Producto actualizado', producto });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: msgs });
    }
    return res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// ── Eliminar producto ──────────────────────────────────────────────────────
const eliminar = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    return res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

// ── Categorías disponibles ─────────────────────────────────────────────────
const categorias = async (_req, res) => {
  try {
    const cats = await Producto.distinct('categoria');
    return res.json({ categorias: cats.sort() });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

module.exports = { crear, listar, obtener, actualizar, eliminar, categorias };
