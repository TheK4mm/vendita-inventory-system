const { validationResult } = require('express-validator');
const Cliente = require('../models/Cliente');

// ── Crear cliente ──────────────────────────────────────────────────────────
const crear = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { cedula, nombres, apellidos, email, telefono, direccion } = req.body;

    const existente = await Cliente.findOne({ cedula: String(cedula).trim() });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un cliente con esa cédula' });
    }

    const cliente = new Cliente({
      cedula:    String(cedula).trim(),
      nombres,
      apellidos,
      email,
      telefono,
      direccion,
      creadoPor: req.usuario.id,
    });

    if (req.file) {
      cliente.rut = {
        filename:    req.file.originalname,
        contentType: req.file.mimetype,
        size:        req.file.size,
        data:        req.file.buffer,
        uploadedAt:  new Date(),
      };
    }

    await cliente.save();

    const obj = cliente.toObject();
    if (obj.rut) delete obj.rut.data;

    return res.status(201).json({ message: 'Cliente registrado', cliente: obj });
  } catch (err) {
    console.error('Error al crear cliente:', err);
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: msgs });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'La cédula ya está registrada' });
    }
    return res.status(500).json({ error: 'Error al registrar cliente' });
  }
};

// ── Listar clientes ────────────────────────────────────────────────────────
const listar = async (req, res) => {
  try {
    const { buscar = '', pagina = 1, limite = 10 } = req.query;

    const filtro = {};
    if (buscar) {
      const rx = { $regex: buscar, $options: 'i' };
      filtro.$or = [
        { cedula:    rx },
        { nombres:   rx },
        { apellidos: rx },
        { email:     rx },
        { telefono:  rx },
      ];
    }

    const skip  = (parseInt(pagina) - 1) * parseInt(limite);

    const [clientes, total] = await Promise.all([
      Cliente.find(filtro)
        .sort({ fechaRegistro: -1 })
        .skip(skip)
        .limit(parseInt(limite)),
      Cliente.countDocuments(filtro),
    ]);

    return res.json({
      clientes,
      total,
      pagina:       parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (err) {
    console.error('Error listar clientes:', err);
    return res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// ── Obtener cliente por id ─────────────────────────────────────────────────
const obtener = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json({ cliente });
  } catch (err) {
    console.error('Error obtener cliente:', err);
    return res.status(500).json({ error: 'Error al obtener el cliente' });
  }
};

// ── Buscar por cédula ──────────────────────────────────────────────────────
const porCedula = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ cedula: String(req.params.cedula).trim() });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    return res.json({ cliente });
  } catch (err) {
    console.error('Error buscar cliente por cédula:', err);
    return res.status(500).json({ error: 'Error al buscar el cliente' });
  }
};

// ── Actualizar cliente ─────────────────────────────────────────────────────
const actualizar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { cedula, nombres, apellidos, email, telefono, direccion } = req.body;

    if (cedula && cedula !== cliente.cedula) {
      const otro = await Cliente.findOne({ cedula: String(cedula).trim() });
      if (otro) return res.status(409).json({ error: 'Otra persona ya tiene esa cédula' });
      cliente.cedula = String(cedula).trim();
    }

    if (nombres   !== undefined) cliente.nombres   = nombres;
    if (apellidos !== undefined) cliente.apellidos = apellidos;
    if (email     !== undefined) cliente.email     = email;
    if (telefono  !== undefined) cliente.telefono  = telefono;
    if (direccion !== undefined) cliente.direccion = direccion;

    if (req.file) {
      cliente.rut = {
        filename:    req.file.originalname,
        contentType: req.file.mimetype,
        size:        req.file.size,
        data:        req.file.buffer,
        uploadedAt:  new Date(),
      };
    }

    await cliente.save();

    const obj = cliente.toObject();
    if (obj.rut) delete obj.rut.data;
    return res.json({ message: 'Cliente actualizado', cliente: obj });
  } catch (err) {
    console.error('Error actualizar cliente:', err);
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ errors: msgs });
    }
    return res.status(500).json({ error: 'Error al actualizar el cliente' });
  }
};

// ── Eliminar cliente ───────────────────────────────────────────────────────
const eliminar = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminar cliente:', err);
    return res.status(500).json({ error: 'Error al eliminar el cliente' });
  }
};

// ── Descargar RUT ──────────────────────────────────────────────────────────
const descargarRut = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).select('+rut.data');
    if (!cliente || !cliente.rut || !cliente.rut.data) {
      return res.status(404).json({ error: 'Este cliente no tiene RUT cargado' });
    }
    res.setHeader('Content-Type', cliente.rut.contentType || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${cliente.rut.filename || `RUT_${cliente.cedula}.pdf`}"`
    );
    return res.send(cliente.rut.data);
  } catch (err) {
    console.error('Error descargar RUT:', err);
    return res.status(500).json({ error: 'Error al descargar el RUT' });
  }
};

module.exports = {
  crear, listar, obtener, porCedula, actualizar, eliminar, descargarRut,
};
