import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ProductForm from '../components/ProductForm';
import ConfirmModal from '../components/ConfirmModal';
import { productosAPI, exportAPI, descargarArchivo } from '../services/api';

const ESTADO_BADGE = { activo: 'badge-activo', inactivo: 'badge-inactivo', agotado: 'badge-agotado' };

const Productos = () => {
  const [productos, setProductos]     = useState([]);
  const [total, setTotal]             = useState(0);
  const [pagina, setPagina]           = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading]         = useState(false);
  const [exportLoading, setExportLoading] = useState('');

  // Filtros
  const [buscar, setBuscar]     = useState('');
  const [estado, setEstado]     = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);

  // Modales
  const [formVisible, setFormVisible] = useState(false);
  const [editProducto, setEditProducto] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteProducto, setDeleteProducto] = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  const LIMITE = 8;

  // ── Cargar productos ───────────────────────────────────────────────────
  const cargarProductos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productosAPI.listar({
        buscar, estado, categoria,
        pagina, limite: LIMITE,
      });
      setProductos(data.productos);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
    } catch {
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [buscar, estado, categoria, pagina]);

  // ── Cargar categorías ──────────────────────────────────────────────────
  useEffect(() => {
    productosAPI.categorias()
      .then(({ data }) => setCategorias(data.categorias))
      .catch(() => {});
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  // Reset página al cambiar filtros
  useEffect(() => { setPagina(1); }, [buscar, estado, categoria]);

  // ── CRUD handlers ──────────────────────────────────────────────────────
  const handleCreate = () => { setEditProducto(null); setFormVisible(true); };
  const handleEdit   = (p)  => { setEditProducto(p);   setFormVisible(true); };

  const handleSave = async (formData) => {
    try {
      if (editProducto) {
        await productosAPI.actualizar(editProducto._id, formData);
        toast.success('Producto actualizado ✓');
      } else {
        await productosAPI.crear(formData);
        toast.success('Producto creado ✓');
      }
      setFormVisible(false);
      cargarProductos();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      const msg  = msgs ? msgs.map(e => e.msg).join(', ') : (err.response?.data?.error || 'Error al guardar');
      toast.error(msg);
      throw err; // para que el form no cierre
    }
  };

  const handleDeleteClick  = (p)   => { setDeleteProducto(p); setDeleteVisible(true); };
  const handleDeleteCancel = ()    => { setDeleteVisible(false); setDeleteProducto(null); };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await productosAPI.eliminar(deleteProducto._id);
      toast.success('Producto eliminado');
      setDeleteVisible(false);
      setDeleteProducto(null);
      cargarProductos();
    } catch {
      toast.error('Error al eliminar el producto');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Exportar ───────────────────────────────────────────────────────────
  const handleExport = async (tipo) => {
    setExportLoading(tipo);
    try {
      const { data } = tipo === 'xlsx' ? await exportAPI.xlsx() : await exportAPI.pdf();
      const ext  = tipo === 'xlsx' ? 'xlsx' : 'pdf';
      const mime = tipo === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      const blob = new Blob([data], { type: mime });
      descargarArchivo(blob, `productos_${Date.now()}.${ext}`);
      toast.success(`Archivo ${ext.toUpperCase()} descargado`);
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExportLoading('');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main style={styles.main}>
        {/* Encabezado */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Gestión de Productos</h1>
            <p style={styles.subtitle}>{total} productos en total</p>
          </div>
          <div style={styles.headerActions}>
            <button className="btn btn-outline btn-sm"
              onClick={() => handleExport('pdf')} disabled={!!exportLoading}>
              {exportLoading === 'pdf' ? '...' : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                PDF
              </>}
            </button>
            <button className="btn btn-outline btn-sm"
              onClick={() => handleExport('xlsx')} disabled={!!exportLoading}>
              {exportLoading === 'xlsx' ? '...' : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                Excel
              </>}
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              ＋ Nuevo Producto
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
            <input
              className="form-control"
              style={{ flex: '1 1 220px', maxWidth: 320 }}
              placeholder="Buscar por nombre, categoría..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
            <select className="form-control" style={{ flex: '0 1 180px' }}
              value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-control" style={{ flex: '0 1 150px' }}
              value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="agotado">Agotado</option>
            </select>
            {(buscar || estado || categoria) && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setBuscar(''); setEstado(''); setCategoria(''); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="card">
          {loading ? (
            <div className="spinner-center"><div className="spinner spinner-lg" /></div>
          ) : productos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sin productos</p>
              <p style={{ fontSize: '.875rem' }}>
                {buscar || estado || categoria ? 'No hay resultados para los filtros aplicados.' : 'Crea tu primer producto para comenzar.'}
              </p>
              {!buscar && !estado && !categoria && (
                <button className="btn btn-primary" onClick={handleCreate}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Crear Producto
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th className="hide-mobile">Categoría</th>
                      <th>Precio</th>
                      <th className="hide-mobile">Stock</th>
                      <th>Estado</th>
                      <th className="hide-mobile">Fecha</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p._id} className="fade-in">
                        <td>
                          {p.imagenUrl
                            ? <img src={p.imagenUrl} alt={p.nombre}
                                style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }} />
                            : <div style={styles.imgPlaceholder}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                              </div>
                          }
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                          {p.descripcion && (
                            <div style={{ fontSize: '.8rem', color: '#64748B', maxWidth: 200,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="hide-mobile">
                          <span style={styles.catChip}>{p.categoria}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          ${p.precio.toFixed(2)}
                        </td>
                        <td className="hide-mobile">
                          <span style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--danger)' : 'inherit' }}>
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${ESTADO_BADGE[p.estado] || ''}`}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="hide-mobile" style={{ fontSize: '.8rem', color: '#64748B' }}>
                          {new Date(p.fechaRegistro).toLocaleDateString('es-CO')}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '.375rem', justifyContent: 'center' }}>
                            <button className="btn btn-ghost btn-sm" title="Editar"
                              onClick={() => handleEdit(p)}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="btn btn-ghost btn-sm" title="Eliminar"
                              onClick={() => handleDeleteClick(p)}
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

              {/* Paginación */}
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

      {/* Modales */}
      <ProductForm
        visible={formVisible}
        producto={editProducto}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
      />
      <ConfirmModal
        visible={deleteVisible}
        producto={deleteProducto}
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
  imgPlaceholder: { width: 44, height: 44, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' },
  catChip: { background: '#EEF2FF', color: '#4F46E5', padding: '.2rem .65rem', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 },
};

export default Productos;
