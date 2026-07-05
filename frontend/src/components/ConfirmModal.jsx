import React from 'react';

const ConfirmModal = ({ visible, producto, onConfirm, onCancel, loading }) => {
  if (!visible) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <h3 style={{ marginBottom: '.5rem', fontSize: '1.125rem', fontWeight: 700 }}>
            ¿Eliminar producto?
          </h3>
          <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
            Estás a punto de eliminar <strong>"{producto?.nombre}"</strong>.<br />
            Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: '.9rem', height: '.9rem', borderWidth: 2 }} /> Eliminando...</>
                : <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                    Eliminar
                  </>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
