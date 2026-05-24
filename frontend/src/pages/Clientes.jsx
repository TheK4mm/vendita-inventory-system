import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ClienteForm from '../components/ClienteForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { clientesAPI } from '../services/api';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pagina, setPagina]     = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading]   = useState(false);

  const [buscar, setBuscar]     = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [editCliente, setEditCliente] = useState(null);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteCliente, setDeleteCliente] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const LIMITE = 8;

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clientesAPI.listar({ buscar, pagina, limite: LIMITE });
      setClientes(data.clientes);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
    } catch {
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, [buscar, pagina]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPagina(1); }, [buscar]);

  const handleCreate = () => { setEditCliente(null); setFormVisible(true); };
  const handleEdit   = (c)  => { setEditCliente(c);   setFormVisible(true); };

  const handleSave = async (formData, editId) => {
    try {
      if (editId) {
        await clientesAPI.actualizar(editId, formData);
        toast.success('Cliente actualizado ✓');
      } else {
        await clientesAPI.crear(formData);
        toast.success('Cliente registrado ✓');
      }
      setFormVisible(false);
      cargar();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      const msg  = msgs
        ? msgs.map(e => e.msg || e).join(', ')
        : (err.response?.data?.error || 'Error al guardar');
      toast.error(msg);
      throw err;
    }
  };

  const handleDeleteClick = (c) => { setDeleteCliente(c); setDeleteVisible(true); };
  const handleDeleteCancel = ()  => { setDeleteVisible(false); setDeleteCliente(null); };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await clientesAPI.eliminar(deleteCliente._id);
      toast.success('Cliente eliminado');
      setDeleteVisible(false); setDeleteCliente(null);
      cargar();
    } catch {
      toast.error('Error al eliminar el cliente');
    } finally {
      setDeleteLoading(false);
    }
  };

  const verRut = async (c) => {
    try {
      const { data } = await clientesAPI.descargarRut(c._id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      toast.error(err.response?.status === 404
        ? 'Este cliente no tiene RUT cargado'
        : 'Error al abrir el RUT');
    }
  };

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Clientes</h1>
            <p style={styles.subtitle}>{total} clientes registrados</p>
          </div>
          <div style={styles.headerActions}>
            <button className="btn btn-primary" onClick={handleCreate}>
              ＋ Nuevo Cliente
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
            <input
              className="form-control"
              style={{ flex: '1 1 220px', maxWidth: 320 }}
              placeholder="Buscar por cédula, nombre, email..."
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
          ) : clientes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sin clientes</p>
              <p style={{ fontSize: '.875rem' }}>
                {buscar ? 'No hay resultados para la búsqueda.' : 'Registra tu primer cliente para comenzar.'}
              </p>
              {!buscar && (
                <button className="btn btn-primary" onClick={handleCreate}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Registrar cliente
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Cédula</th>
                      <th>Nombre completo</th>
                      <th className="hide-mobile">Email</th>
                      <th className="hide-mobile">Teléfono</th>
                      <th>RUT</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map(c => (
                      <tr key={c._id} className="fade-in">
                        <td style={{ fontWeight: 600 }}>{c.cedula}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.nombres} {c.apellidos}</div>
                          <div style={{ fontSize: '.8rem', color: '#64748B' }}>{c.direccion}</div>
                        </td>
                        <td className="hide-mobile">{c.email}</td>
                        <td className="hide-mobile">{c.telefono}</td>
                        <td>
                          {c.rut && c.rut.filename ? (
                            <button className="btn btn-ghost btn-sm" onClick={() => verRut(c)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                              Ver
                            </button>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '.85rem' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '.375rem', justifyContent: 'center' }}>
                            <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => handleEdit(c)}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="btn btn-ghost btn-sm" title="Eliminar"
                              onClick={() => handleDeleteClick(c)}
                              style={{ color: 'var(--danger)' }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            </button>
                          </div>
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

      <ClienteForm
        visible={formVisible}
        cliente={editCliente}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
      />

      <ConfirmDialog
        visible={deleteVisible}
        title="¿Eliminar cliente?"
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        }
        confirmText="Eliminar"
        message={deleteCliente
          ? `Estás a punto de eliminar a "${deleteCliente.nombres} ${deleteCliente.apellidos}". Esta acción no se puede deshacer.`
          : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
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

export default Clientes;
