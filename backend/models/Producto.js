const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: [150, 'El nombre no puede superar 150 caracteres'],
    },
    descripcion: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'La descripción no puede superar 500 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    estado: {
      type: String,
      enum: ['activo', 'inactivo', 'agotado'],
      default: 'activo',
    },
    imagenUrl: {
      type: String,
      default: '',
      trim: true,
    },
    creadoPor: {
      type: Number, // ID del usuario en PostgreSQL
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

// Índice de texto para búsqueda
productoSchema.index({ nombre: 'text', categoria: 'text', descripcion: 'text' });

module.exports = mongoose.model('Producto', productoSchema);
