import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { cajaAPI, ventasAPI, descargarArchivo } from '../services/api';

const Caja = () => {
  const [saldo, setSaldo]         = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [descargando, setDescargando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await cajaAPI.resumen();
      setSaldo(data.saldo);
      setTotalVentas(data.totalVentas);
      setHistorico(data.historico);
    } catch {
      toast.error('Error al obtener el saldo en caja');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const descargarReporte = async () => {
    setDescargando(true);
    try {
      const { data } = await cajaAPI.reporte();
      const blob = new Blob([data], { type: 'application/pdf' });
      descargarArchivo(blob, `reporte_caja_${Date.now()}.pdf`);
      toast.success('Reporte descargado ✓');
    } catch {
      toast.error('Error al descargar el reporte');
    } finally {
      setDescargando(false);
    }
  };

  const abrirFactura = async (id) => {
    try {
      const { data } = await ventasAPI.factura(id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error('Error al abrir la factura');
    }
  };

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Saldo en caja</h1>
            <p style={styles.subtitle}>Resumen de ventas acumuladas</p>
          </div>
          <div style={styles.headerActions}>
            <button className="btn btn-outline" onClick={cargar} disabled={loading}>
              ↻ Actualizar
            </button>
            <button className="btn btn-primary" onClick={descargarReporte} disabled={descargando}>
              {descargando ? '...' : <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Descargar PDF
              </>}
            </button>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            <div style={styles.statLabel}>Saldo acumulado</div>
            <div style={styles.statValue}>${saldo.toFixed(2)}</div>
            <div style={styles.statSub}>Inicia en cero y suma cada venta</div>
          </div>
          <div style={{ ...styles.statCard, background: '#0F172A' }}>
            <div style={styles.statLabel}>Ventas registradas</div>
            <div style={styles.statValue}>{totalVentas}</div>
            <div style={styles.statSub}>Total histórico</div>
          </div>
        </div>

        {/* Histórico */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Histórico de ventas</h3>
          </div>

          {loading ? (
            <div className="spinner-center"><div className="spinner spinner-lg" /></div>
          ) : historico.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Caja en cero</p>
              <p style={{ fontSize: '.875rem' }}>Aún no hay ventas registradas.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>N° Factura</th>
                    <th className="hide-mobile">Fecha</th>
                    <th>Cliente</th>
                    <th className="hide-mobile">Cédula</th>
                    <th className="hide-mobile">Items</th>
                    <th>Total</th>
                    <th style={{ textAlign: 'center' }}>Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map(h => (
                    <tr key={h._id} className="fade-in">
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{h.numero}</td>
                      <td className="hide-mobile" style={{ fontSize: '.85rem' }}>
                        {new Date(h.fecha).toLocaleString('es-CO')}
                      </td>
                      <td>{h.cliente}</td>
                      <td className="hide-mobile">{h.cedula}</td>
                      <td className="hide-mobile">{h.cantidadItems}</td>
                      <td style={{ fontWeight: 700 }}>${h.total.toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirFactura(h._id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const styles = {
  main: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' },
  title: { fontSize: '1.5rem', fontWeight: 800, margin: 0 },
  subtitle: { color: '#64748B', fontSize: '.875rem', marginTop: '.25rem' },
  headerActions: { display: 'flex', gap: '.625rem', alignItems: 'center', flexWrap: 'wrap' },
  statCard: {
    color: '#fff', padding: '1.5rem 1.75rem',
    borderRadius: 14, boxShadow: '0 6px 20px rgba(0,0,0,.12)',
  },
  statLabel: { fontSize: '.85rem', opacity: .85, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' },
  statValue: { fontSize: '2rem', fontWeight: 800, marginTop: '.25rem' },
  statSub: { fontSize: '.8rem', opacity: .75, marginTop: '.25rem' },
};

export default Caja;
