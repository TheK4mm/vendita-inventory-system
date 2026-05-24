import React, { useEffect, useState } from 'react';

const EMPTY = {
  cedula: '', nombres: '', apellidos: '',
  email: '', telefono: '', direccion: '',
};

const ClienteForm = ({ visible, cliente, onClose, onSave }) => {
  const [form, setForm]     = useState(EMPTY);
  const [rutFile, setRutFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setRutFile(null);
      setErrors({});
      if (cliente) {
        setForm({
          cedula:    cliente.cedula    || '',
          nombres:   cliente.nombres   || '',
          apellidos: cliente.apellidos || '',
          email:     cliente.email     || '',
          telefono:  cliente.telefono  || '',
          direccion: cliente.direccion || '',
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [visible, cliente]);

  if (!visible) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setRutFile(null); return; }
    if (f.type !== 'application/pdf') {
      setErrors({ ...errors, rut: 'El archivo debe ser PDF' });
      e.target.value = '';
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, rut: 'El PDF no puede superar 5 MB' });
      e.target.value = '';
      return;
    }
    setErrors({ ...errors, rut: '' });
    setRutFile(f);
  };

  const validate = () => {
    const e = {};
    if (!form.cedula.trim())    e.cedula    = 'La cédula es obligatoria';
    if (!form.nombres.trim())   e.nombres   = 'Los nombres son obligatorios';
    if (!form.apellidos.trim()) e.apellidos = 'Los apellidos son obligatorios';
    if (!form.email.trim())     e.email     = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.telefono.trim())  e.telefono  = 'El teléfono es obligatorio';
    if (!form.direccion.trim()) e.direccion = 'La dirección es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (rutFile) fd.append('rut', rutFile);
      await onSave(fd, cliente?._id);
    } catch {
      // El padre muestra el toast de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {cliente ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar cliente
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Nuevo cliente
              </>
            )}
          </h3>
          <button className="btn-close" onClick={onClose} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Cédula *</label>
                <input className={`form-control ${errors.cedula ? 'error' : ''}`}
                  name="cedula" value={form.cedula} onChange={handleChange} autoFocus />
                {errors.cedula && <span className="form-error">{errors.cedula}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input className={`form-control ${errors.telefono ? 'error' : ''}`}
                  name="telefono" value={form.telefono} onChange={handleChange} />
                {errors.telefono && <span className="form-error">{errors.telefono}</span>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombres *</label>
                <input className={`form-control ${errors.nombres ? 'error' : ''}`}
                  name="nombres" value={form.nombres} onChange={handleChange} />
                {errors.nombres && <span className="form-error">{errors.nombres}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Apellidos *</label>
                <input className={`form-control ${errors.apellidos ? 'error' : ''}`}
                  name="apellidos" value={form.apellidos} onChange={handleChange} />
                {errors.apellidos && <span className="form-error">{errors.apellidos}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className={`form-control ${errors.email ? 'error' : ''}`}
                name="email" value={form.email} onChange={handleChange} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Dirección *</label>
              <input className={`form-control ${errors.direccion ? 'error' : ''}`}
                name="direccion" value={form.direccion} onChange={handleChange} />
              {errors.direccion && <span className="form-error">{errors.direccion}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">RUT (PDF, máx. 5 MB)</label>
              <input type="file" accept="application/pdf,.pdf"
                onChange={handleFile}
                className={`form-control ${errors.rut ? 'error' : ''}`} />
              {cliente?.rut?.filename && !rutFile && (
                <span style={{ fontSize: '.8rem', color: '#64748B' }}>
                  Archivo actual: {cliente.rut.filename}
                </span>
              )}
              {rutFile && (
                <span style={{ fontSize: '.8rem', color: '#16A34A' }}>
                  Nuevo archivo: {rutFile.name} ({(rutFile.size / 1024).toFixed(0)} KB)
                </span>
              )}
              {errors.rut && <span className="form-error">{errors.rut}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: '.9rem', height: '.9rem', borderWidth: 2 }} /> Guardando...</>
                : cliente ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Guardar cambios
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Registrar cliente
                  </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
