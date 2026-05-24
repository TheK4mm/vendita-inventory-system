import React, { useState, useEffect } from 'react';

const CATEGORIAS_DEFAULT = [
  'Electrónica', 'Ropa y Moda', 'Hogar', 'Alimentos', 'Deportes',
  'Juguetes', 'Libros', 'Salud y Belleza', 'Automotriz', 'Otro',
];

const initialForm = {
  nombre: '', descripcion: '', categoria: '',
  precio: '', stock: '0', estado: 'activo', imagenUrl: '',
};

const ProductForm = ({ visible, producto, onClose, onSave }) => {
  const [form, setForm]     = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!producto;

  useEffect(() => {
    if (visible) {
      setForm(producto
        ? { ...producto, precio: String(producto.precio), stock: String(producto.stock) }
        : initialForm
      );
      setErrors({});
    }
  }, [visible, producto]);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre obligatorio';
    if (!form.categoria.trim()) e.categoria = 'Categoría obligatoria';
    if (form.precio === '' || isNaN(Number(form.precio))) e.precio = 'Precio inválido';
    else if (Number(form.precio) < 0) e.precio = 'El precio no puede ser negativo';
    if (form.stock !== '' && isNaN(Number(form.stock))) e.stock = 'Stock inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        ...form,
        precio: parseFloat(form.precio),
        stock:  parseInt(form.stock || '0', 10),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
<<<<<<< HEAD
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {isEdit ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar Producto
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nuevo Producto
              </>
            )}
          </h3>
          <button className="btn-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
=======
          <h3 className="modal-title">{isEdit ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">Nombre del Producto *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange}
                className={`form-control ${errors.nombre ? 'error' : ''}`}
                placeholder="Ej: Camiseta Polo Premium" />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                className="form-control" rows={3}
                placeholder="Describe el producto..."
                style={{ resize: 'vertical', minHeight: 80 }} />
            </div>

            {/* Categoría */}
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}
                className={`form-control ${errors.categoria ? 'error' : ''}`}>
                <option value="">— Selecciona —</option>
                {CATEGORIAS_DEFAULT.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.categoria && <span className="form-error">{errors.categoria}</span>}
            </div>

            {/* Precio y Stock */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Precio (USD) *</label>
                <input type="number" name="precio" value={form.precio} onChange={handleChange}
                  className={`form-control ${errors.precio ? 'error' : ''}`}
                  placeholder="0.00" step="0.01" min="0" />
                {errors.precio && <span className="form-error">{errors.precio}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange}
                  className={`form-control ${errors.stock ? 'error' : ''}`}
                  placeholder="0" min="0" step="1" />
                {errors.stock && <span className="form-error">{errors.stock}</span>}
              </div>
            </div>

            {/* Estado */}
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} className="form-control">
<<<<<<< HEAD
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="agotado">Agotado</option>
=======
                <option value="activo">✅ Activo</option>
                <option value="inactivo">⚫ Inactivo</option>
                <option value="agotado">🔴 Agotado</option>
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
              </select>
            </div>

            {/* URL de imagen */}
            <div className="form-group">
              <label className="form-label">URL de Imagen (opcional)</label>
              <input name="imagenUrl" value={form.imagenUrl} onChange={handleChange}
                className="form-control" placeholder="https://ejemplo.com/imagen.jpg" />
            </div>

            {/* Preview imagen */}
            {form.imagenUrl && (
              <div style={{ textAlign: 'center' }}>
                <img src={form.imagenUrl} alt="preview"
                  style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: '.9rem', height: '.9rem', borderWidth: 2 }} /> Guardando...</>
<<<<<<< HEAD
                : isEdit ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Actualizar
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Crear Producto
                  </>
                )}
=======
                : isEdit ? '💾 Actualizar' : '✓ Crear Producto'}
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
