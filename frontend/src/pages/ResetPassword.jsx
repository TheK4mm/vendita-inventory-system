import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const tokenInit = useMemo(() => params.get('token') || '', [params]);
  const emailInit = useMemo(() => params.get('email') || '', [params]);

  const [form, setForm] = useState({
    email:    emailInit,
    token:    tokenInit,
    password: '',
    confirmar: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.token.trim()) e.token = 'El token es obligatorio';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({
        email:    form.email,
        token:    form.token,
        password: form.password,
      });
      toast.success('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error || 'No se pudo restablecer la contraseña';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <div className="auth-panel auth-panel-mini">
        <div className="auth-deco" style={{ width: 280, height: 280, top: -70, right: -60, opacity: .08 }} />
        <div className="auth-deco" style={{ width: 160, height: 160, bottom: 50, left: -50, opacity: .06 }} />
        <div className="auth-deco" style={{ width: 100, height: 100, bottom: -20, right: 80, opacity: .09 }} />

        <div className="auth-panel-content">
          <div className="auth-logo-box">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.92)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7.5" cy="14.5" r="4.5"/>
              <path d="M10.5 11.5L19 3"/>
              <line x1="15" y1="3" x2="19" y2="3"/>
              <line x1="19" y1="3" x2="19" y2="7"/>
              <line x1="15" y1="7" x2="17" y2="5"/>
            </svg>
          </div>
          <h1 className="auth-brand-name">VenditaApp</h1>
          <p className="auth-brand-tagline">
            Crea una nueva contraseña segura para proteger tu cuenta.
          </p>
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,.08)', borderRadius: 12, border: '1px solid rgba(255,255,255,.14)' }}>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.9rem', lineHeight: 1.65, margin: 0 }}>
              Usa el token que recibiste por correo electrónico junto con tu nueva contraseña para recuperar el acceso.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-side">
        <div className="auth-form-box" style={{ maxWidth: 440 }}>
          <h2 className="auth-form-title">Nueva contraseña</h2>
          <p className="auth-form-sub">Crea una nueva contraseña para tu cuenta</p>

          <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`form-control ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Token recibido por correo</label>
              <input
                type="text"
                name="token"
                value={form.token}
                onChange={handleChange}
                placeholder="Pega aquí el token del correo"
                className={`form-control ${errors.token ? 'error' : ''}`}
              />
              {errors.token && <span className="form-error">{errors.token}</span>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mín. 6 caracteres"
                  className={`form-control ${errors.password ? 'error' : ''}`}
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar</label>
                <input
                  type="password"
                  name="confirmar"
                  value={form.confirmar}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                  className={`form-control ${errors.confirmar ? 'error' : ''}`}
                />
                {errors.confirmar && <span className="form-error">{errors.confirmar}</span>}
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: 2 }} /> Guardando...</>
                : 'Restablecer contraseña →'}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/login" className="auth-link">← Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
