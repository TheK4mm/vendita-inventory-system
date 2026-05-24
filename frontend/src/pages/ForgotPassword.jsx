import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      toast.success(data.message || 'Solicitud enviada');
      setEnviado(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al solicitar la recuperación';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <div className="auth-panel auth-panel-mini">
        <div className="auth-deco" style={{ width: 280, height: 280, top: -80, right: -60, opacity: .08 }} />
        <div className="auth-deco" style={{ width: 160, height: 160, bottom: 40, left: -50, opacity: .06 }} />
        <div className="auth-deco" style={{ width: 100, height: 100, bottom: -20, right: 80, opacity: .09 }} />

        <div className="auth-panel-content">
          <div className="auth-logo-box">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.92)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <rect x="9" y="11" width="6" height="5" rx="1"/>
              <path d="M10 11V9a2 2 0 014 0v2"/>
            </svg>
          </div>
          <h1 className="auth-brand-name">VenditaApp</h1>
          <p className="auth-brand-tagline">
            Recupera el acceso a tu cuenta de forma segura y rápida.
          </p>
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,.08)', borderRadius: 12, border: '1px solid rgba(255,255,255,.14)' }}>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.9rem', lineHeight: 1.65, margin: 0 }}>
              Ingresa tu correo registrado y te enviaremos un enlace para restablecer tu contraseña en minutos.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2 className="auth-form-title">Recuperar contraseña</h2>
          <p className="auth-form-sub">Te enviaremos un enlace a tu correo registrado</p>

          {enviado ? (
            <div className="auth-success-box" style={{ marginTop: '2rem' }}>
              <span className="auth-success-icon">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <p className="auth-success-text">
                Si el correo está registrado recibirás un enlace para restablecer tu contraseña.
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
              <Link to="/login" className="auth-submit-btn" style={{ textDecoration: 'none', display: 'flex' }}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
                  placeholder="usuario@correo.com"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  autoFocus
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: 2 }} /> Enviando...</>
                  : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          <p className="auth-footer">
            <Link to="/login" className="auth-link">← Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
