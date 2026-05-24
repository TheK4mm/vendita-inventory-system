const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema(
  {
    cedula: {
      type: String,
      required: [true, 'La cédula es obligatoria'],
      trim: true,
      unique: true,
      index: true,
    },
    nombres: {
      type: String,
      required: [true, 'Los nombres son obligatorios'],
      trim: true,
      maxlength: 100,
    },
    apellidos: {
      type: String,
      required: [true, 'Los apellidos son obligatorios'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
      maxlength: 20,
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
      maxlength: 200,
    },
    // RUT en PDF (almacenado en la misma base de datos)
    rut: {
      filename:    { type: String, default: '' },
      contentType: { type: String, default: '' },
      size:        { type: Number, default: 0 },
      data:        { type: Buffer, default: null, select: false },
      uploadedAt:  { type: Date,   default: null },
    },
    creadoPor: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'fechaRegistro',
      updatedAt: 'fechaActualizacion',
    },
    versionKey: false,
  }
);

clienteSchema.index({ nombres: 'text', apellidos: 'text', email: 'text', cedula: 'text' });

module.exports = mongoose.model('Cliente', clienteSchema);
