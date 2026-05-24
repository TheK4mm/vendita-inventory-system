import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import VentaForm from '../components/VentaForm';
import { ventasAPI } from '../services/api';

const Ventas = () => {
  const [ventas, setVentas]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [pagina, setPagina]       = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading]     = useState(false);
  const [buscar, setBuscar]       = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const LIMITE = 10;

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ventasAPI.listar({ buscar, pagina, limite: LIMITE });
      setVentas(data.ventas);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
    } catch {
      toast.error('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  }, [buscar, pagina]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPagina(1); }, [buscar]);

  const abrirFactura = async (venta) => {
    try {
      const { data } = await ventasAPI.factura(venta._id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error('Error al abrir la factura');
    }
  };

  const handleVentaCreada = (venta) => {
    setFormVisible(false);
    toast.success(`Venta ${venta.numero} registrada ✓`);
    cargar();
    // Abrir factura inmediatamente
    abrirFactura(venta);
  };

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Ventas</h1>
            <p style={styles.subtitle}>{total} ventas registradas</p>
          </div>
          <div style={styles.headerActions}>
            <button className="btn btn-primary" onClick={() => setFormVisible(true)}>
              ＋ Nueva venta
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
            <input
              className="form-control"
              style={{ flex: '1 1 220px', maxWidth: 340 }}
              placeholder="Buscar por número, cédula o cliente..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
            {buscar && (
              <button className="btn btn-ghost btn-sm" onClick={() => setBuscar('')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="spinner-center"><div className="spinner spinner-lg" /></div>
          ) : ventas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sin ventas</p>
              <p style={{ fontSize: '.875rem' }}>
                {buscar ? 'No hay resultados para la búsqueda.' : 'Registra tu primera venta para comenzar.'}
              </p>
              {!buscar && (
                <button className="btn btn-primary" onClick={() => setFormVisible(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nueva venta
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>N° Factura</th>
                      <th className="hide-mobile">Fecha</th>
                      <th>Cliente</th>
                      <th className="hide-mobile">Items</th>
                      <th>Total</th>
                      <th style={{ textAlign: 'center' }}>Factura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map(v => (
                      <tr key={v._id} className="fade-in">
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{v.numero}</td>
                        <td className="hide-mobile" style={{ fontSize: '.85rem' }}>
                          {new Date(v.fecha).toLocaleString('es-CO')}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.cliente.nombres} {v.cliente.apellidos}</div>
                          <div style={{ fontSize: '.8rem', color: '#64748B' }}>Cédula: {v.cliente.cedula}</div>
                        </td>
                        <td className="hide-mobile">
                          {v.items.reduce((acc, it) => acc + it.cantidad, 0)} unid.
                        </td>
                        <td style={{ fontWeight: 700 }}>${v.total.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => abrirFactura(v)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            Reimprimir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <span style={{ fontSize: '.875rem', color: '#64748B' }}>
                    Página {pagina} de {totalPaginas}
                  </span>
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-outline btn-sm"
                      disabled={pagina === 1}
                      onClick={() => setPagina(p => p - 1)}>← Anterior</button>
                    <button className="btn btn-outline btn-sm"
                      disabled={pagina === totalPaginas}
                      onClick={() => setPagina(p => p + 1)}>Siguiente →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <VentaForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSaved={handleVentaCreada}
      />
    </>
  );
};

const styles = {
  main: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' },
  title: { fontSize: '1.5rem', fontWeight: 800, margin: 0 },
  subtitle: { color: '#64748B', fontSize: '.875rem', marginTop: '.25rem' },
  headerActions: { display: 'flex', gap: '.625rem', alignItems: 'center', flexWrap: 'wrap' },
};

export default Ventas;
