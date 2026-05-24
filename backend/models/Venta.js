const mongoose = require('mongoose');

const itemVentaSchema = new mongoose.Schema(
  {
    productoId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    nombre:        { type: String,  required: true },
    categoria:     { type: String,  default: '' },
    precioUnitario:{ type: Number,  required: true, min: 0 },
    cantidad:      { type: Number,  required: true, min: 1 },
    subtotal:      { type: Number,  required: true, min: 0 },
  },
  { _id: false }
);

const ventaSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cliente: {
      clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
      cedula:    { type: String, required: true },
      nombres:   { type: String, required: true },
      apellidos: { type: String, required: true },
      email:     { type: String, default: '' },
      telefono:  { type: String, default: '' },
      direccion: { type: String, default: '' },
    },
    items: {
      type: [itemVentaSchema],
      validate: [arr => arr.length > 0, 'La venta debe tener al menos un producto'],
    },
    subtotal:  { type: Number, required: true, min: 0 },
    impuesto:  { type: Number, required: true, min: 0, default: 0 },
    total:     { type: Number, required: true, min: 0 },
    porcentajeImpuesto: { type: Number, default: 0 },
    creadoPor: { type: Number, required: true },
  },
  {
    timestamps: {
      createdAt: 'fecha',
      updatedAt: 'fechaActualizacion',
    },
    versionKey: false,
  }
);

module.exports = mongoose.model('Venta', ventaSchema);
