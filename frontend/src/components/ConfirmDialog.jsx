import React from 'react';

const ConfirmDialog = ({
  visible,
  title    = '¿Confirmar acción?',
  message  = 'Esta acción no se puede deshacer.',
  icon     = (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  confirmText = 'Confirmar',
  confirmClass = 'btn-danger',
  onConfirm, onCancel, loading,
}) => {
  if (!visible) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{icon}</div>
          <h3 style={{ marginBottom: '.5rem', fontSize: '1.125rem', fontWeight: 700 }}>
            {title}
          </h3>
          <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>{message}</p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button className={`btn ${confirmClass}`} onClick={onConfirm} disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: '.9rem', height: '.9rem', borderWidth: 2 }} /> Procesando...</>
                : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
