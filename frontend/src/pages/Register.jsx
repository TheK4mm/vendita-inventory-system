import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';

const BENEFITS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    text: 'Registro gratuito, sin tarjeta de crédito',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    ),
    text: 'Acceso inmediato a todas las funciones',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    text: 'Tus datos siempre seguros y privados',
  },
];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (form.nombre.trim().length < 2) e.nombre = 'Mínimo 2 caracteres';

    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';

    if (!form.password) e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';

    if (!form.confirmar) e.confirmar = 'Confirma tu contraseña';
    else if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.register({
        nombre:   form.nombre,
        email:    form.email,
        password: form.password,
      });
      login(data);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/productos');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrarse';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <div className="auth-panel">
        <div className="auth-deco" style={{ width: 300, height: 300, top: -80, right: -70, opacity: .08 }} />
        <div className="auth-deco" style={{ width: 180, height: 180, bottom: 50, left: -60, opacity: .06 }} />
        <div className="auth-deco" style={{ width: 110, height: 110, bottom: -20, right: 90, opacity: .09 }} />

        <div className="auth-panel-content">
          <div className="auth-logo-box">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.92)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h1 className="auth-brand-name">Únete a<br />VenditaApp</h1>
          <p className="auth-brand-tagline">
            Empieza gratis y toma el control de tu negocio desde el primer día.
          </p>

          <div className="auth-feature-list">
            {BENEFITS.map((b, i) => (
              <div key={i} className="auth-feature-item">
                <div className="auth-feature-icon">{b.icon}</div>
                <span className="auth-feature-text">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-side">
        <div className="auth-form-box" style={{ maxWidth: 440 }}>
          <h2 className="auth-form-title">Crear cuenta</h2>
          <p className="auth-form-sub">Completa los datos para comenzar</p>

          <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className={`form-control ${errors.nombre ? 'error' : ''}`}
                autoFocus
              />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                className={`form-control ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Contraseña</label>
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
                ? <><span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: 2 }} /> Creando cuenta...</>
                : 'Crear cuenta →'}
            </button>
          </form>

          <p className="auth-footer">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="auth-link">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
