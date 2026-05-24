import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    text: 'Inventario y productos en tiempo real',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    text: 'Gestión completa de clientes',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    text: 'Ventas y control de caja diaria',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    text: 'Reportes y estadísticas detalladas',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data);
      toast.success(`¡Bienvenido, ${data.usuario.nombre}!`);
      navigate('/productos');
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
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
        <div className="auth-deco" style={{ width: 360, height: 360, top: -110, right: -90, opacity: .08 }} />
        <div className="auth-deco" style={{ width: 220, height: 220, bottom: 30, left: -80, opacity: .06 }} />
        <div className="auth-deco" style={{ width: 130, height: 130, bottom: -35, right: 110, opacity: .09 }} />

        <div className="auth-panel-content">
          <div className="auth-logo-box">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.92)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h1 className="auth-brand-name">VenditaApp</h1>
          <p className="auth-brand-tagline">
            La plataforma completa para gestionar tu negocio con claridad y eficiencia.
          </p>

          <div className="auth-feature-list">
            {FEATURES.map((f, i) => (
              <div key={i} className="auth-feature-item">
                <div className="auth-feature-icon">{f.icon}</div>
                <span className="auth-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Iniciar sesión</h2>
          <p className="auth-form-sub">Ingresa tus credenciales para acceder</p>

          <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="usuario@correo.com"
                className={`form-control ${errors.email ? 'error' : ''}`}
                autoFocus
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                className={`form-control ${errors.password ? 'error' : ''}`}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: 2 }} /> Ingresando...</>
                : 'Ingresar →'}
            </button>
          </form>

          <div className="auth-forgot-link">
            <Link to="/forgot-password" className="auth-link-soft">¿Olvidaste tu contraseña?</Link>
          </div>

          <p className="auth-footer">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="auth-link">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
