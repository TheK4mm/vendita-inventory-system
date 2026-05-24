import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { clientesAPI, productosAPI, ventasAPI } from '../services/api';
import ClienteForm from './ClienteForm';

const VentaForm = ({ visible, onClose, onSaved }) => {
  const [cedula, setCedula]       = useState('');
  const [cliente, setCliente]     = useState(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [registroVisible, setRegistroVisible] = useState(false);

  const [productos, setProductos] = useState([]);
  const [buscarProd, setBuscarProd] = useState('');
  const [cargandoProd, setCargandoProd] = useState(false);

  const [items, setItems] = useState([]); // [{ producto, cantidad }]
  const [loading, setLoading] = useState(false);

  // Reset cuando se abre
  useEffect(() => {
    if (visible) {
      setCedula('');
      setCliente(null);
      setItems([]);
      setBuscarProd('');
    }
  }, [visible]);

  // Cargar productos
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(async () => {
      setCargandoProd(true);
      try {
        const { data } = await productosAPI.listar({
          buscar: buscarProd,
          limite: 20,
          estado: '',
        });
        setProductos(data.productos);
      } catch {
        // silencioso
      } finally {
        setCargandoProd(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [visible, buscarProd]);

  if (!visible) return null;

  const buscarPorCedula = async () => {
    if (!cedula.trim()) {
      toast.error('Ingresa una cédula');
      return;
    }
    setBuscandoCliente(true);
    try {
      const { data } = await clientesAPI.porCedula(cedula.trim());
      setCliente(data.cliente);
      toast.success(`Cliente encontrado: ${data.cliente.nombres} ${data.cliente.apellidos}`);
    } catch (err) {
      if (err.response?.status === 404) {
        toast('Cliente no encontrado. Puedes registrarlo a continuación.');
        setRegistroVisible(true);
      } else {
        toast.error('Error al buscar el cliente');
      }
      setCliente(null);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const guardarClienteNuevo = async (formData) => {
    try {
      const { data } = await clientesAPI.crear(formData);
      setCliente(data.cliente);
      setRegistroVisible(false);
      setCedula(data.cliente.cedula);
      toast.success('Cliente registrado ✓');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      const msg  = msgs
        ? msgs.map(e => e.msg || e).join(', ')
        : (err.response?.data?.error || 'Error al registrar el cliente');
      toast.error(msg);
      throw err;
    }
  };

  const agregarProducto = (prod) => {
    if (prod.stock <= 0) {
      toast.error('Este producto no tiene stock disponible');
      return;
    }
    const existente = items.find(it => it.producto._id === prod._id);
    if (existente) {
      if (existente.cantidad + 1 > prod.stock) {
        toast.error(`Solo hay ${prod.stock} unidades de "${prod.nombre}"`);
        return;
      }
      setItems(items.map(it =>
        it.producto._id === prod._id ? { ...it, cantidad: it.cantidad + 1 } : it
      ));
    } else {
      setItems([...items, { producto: prod, cantidad: 1 }]);
    }
  };

  const cambiarCantidad = (id, cantidad) => {
    const cant = parseInt(cantidad);
    if (Number.isNaN(cant) || cant < 1) return;
    setItems(items.map(it => {
      if (it.producto._id !== id) return it;
      if (cant > it.producto.stock) {
        toast.error(`Solo hay ${it.producto.stock} unidades de "${it.producto.nombre}"`);
        return { ...it, cantidad: it.producto.stock };
      }
      return { ...it, cantidad: cant };
    }));
  };

  const quitarItem = (id) => setItems(items.filter(it => it.producto._id !== id));

  const subtotal = items.reduce((acc, it) => acc + it.producto.precio * it.cantidad, 0);

  const registrar = async () => {
    if (!cliente)        return toast.error('Selecciona o registra el cliente');
    if (items.length === 0) return toast.error('Agrega al menos un producto');

    setLoading(true);
    try {
      const payload = {
        clienteId: cliente._id,
        items: items.map(it => ({
          productoId: it.producto._id,
          cantidad:   it.cantidad,
        })),
      };
      const { data } = await ventasAPI.crear(payload);
      onSaved(data.venta);
    } catch (err) {
      const msgs = err.response?.data?.errors;
      const msg  = msgs
        ? msgs.map(e => e.msg || e).join(', ')
        : (err.response?.data?.error || 'Error al registrar la venta');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
        <div className="modal-box" style={{ maxWidth: 880 }}>
          <div className="modal-header">
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Nueva venta
            </h3>
            <button className="btn-close" onClick={onClose} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Cliente */}
            <section>
              <h4 style={styles.sectionTitle}>1. Cliente</h4>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                <input
                  className="form-control"
                  placeholder="Cédula del cliente"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  style={{ flex: '1 1 200px' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarPorCedula(); } }}
                />
                <button type="button" className="btn btn-outline"
                  onClick={buscarPorCedula} disabled={buscandoCliente}>
                  {buscandoCliente ? '...' : <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Buscar
                  </>}
                </button>
                <button type="button" className="btn btn-ghost"
                  onClick={() => setRegistroVisible(true)}>
                  ＋ Registrar
                </button>
              </div>

              {cliente && (
                <div style={styles.clienteCard}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{cliente.nombres} {cliente.apellidos}</div>
                    <div style={{ fontSize: '.85rem', color: '#64748B' }}>
                      Cédula: {cliente.cedula} · {cliente.telefono} · {cliente.email}
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm"
                    onClick={() => { setCliente(null); setCedula(''); }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Cambiar
                  </button>
                </div>
              )}
            </section>

            {/* Productos */}
            <section>
              <h4 style={styles.sectionTitle}>2. Productos</h4>
              <input
                className="form-control"
                placeholder="Buscar producto por nombre o categoría..."
                value={buscarProd}
                onChange={(e) => setBuscarProd(e.target.value)}
              />
              <div style={styles.productList}>
                {cargandoProd ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B' }}>Cargando...</div>
                ) : productos.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B' }}>Sin resultados</div>
                ) : (
                  productos.map(p => (
                    <button key={p._id} type="button"
                      style={{ ...styles.productCard, opacity: p.stock <= 0 ? .5 : 1 }}
                      disabled={p.stock <= 0}
                      onClick={() => agregarProducto(p)}>
                      <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                      <div style={{ fontSize: '.75rem', color: '#64748B' }}>{p.categoria}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.25rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>${p.precio.toFixed(2)}</span>
                        <span style={{ fontSize: '.75rem', color: p.stock === 0 ? 'var(--danger)' : '#16A34A' }}>
                          Stock: {p.stock}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Carrito */}
            <section>
              <h4 style={styles.sectionTitle}>3. Carrito</h4>
              {items.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8', border: '1px dashed #E2E8F0', borderRadius: 8 }}>
                  No has agregado productos
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(it => (
                        <tr key={it.producto._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{it.producto.nombre}</div>
                            <div style={{ fontSize: '.75rem', color: '#64748B' }}>Stock: {it.producto.stock}</div>
                          </td>
                          <td>${it.producto.precio.toFixed(2)}</td>
                          <td>
                            <input type="number" min="1" max={it.producto.stock}
                              className="form-control"
                              style={{ width: 80, padding: '.3rem .5rem' }}
                              value={it.cantidad}
                              onChange={(e) => cambiarCantidad(it.producto._id, e.target.value)} />
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            ${(it.producto.precio * it.cantidad).toFixed(2)}
                          </td>
                          <td>
                            <button className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => quitarItem(it.producto._id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={styles.totalRow}>
                <span style={{ color: '#64748B' }}>Subtotal</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                  ${subtotal.toFixed(2)}
                </strong>
              </div>
            </section>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary"
              onClick={registrar} disabled={loading || !cliente || items.length === 0}>
              {loading
                ? <><span className="spinner" style={{ width: '.9rem', height: '.9rem', borderWidth: 2 }} /> Procesando...</>
                : <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Finalizar venta
                  </>}
            </button>
          </div>
        </div>
      </div>

      <ClienteForm
        visible={registroVisible}
        cliente={null}
        onClose={() => setRegistroVisible(false)}
        onSave={guardarClienteNuevo}
      />
    </>
  );
};

const styles = {
  sectionTitle: {
    fontSize: '.85rem', fontWeight: 700, color: '#1E293B',
    marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.04em',
  },
  clienteCard: {
    marginTop: '.75rem',
    background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8,
    padding: '.75rem 1rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
  },
  productList: {
    marginTop: '.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '.5rem',
    maxHeight: 220,
    overflowY: 'auto',
    padding: '.25rem',
  },
  productCard: {
    border: '1px solid #E2E8F0', borderRadius: 8,
    padding: '.6rem .75rem', cursor: 'pointer',
    background: '#fff', textAlign: 'left',
    display: 'flex', flexDirection: 'column', gap: '.15rem',
    transition: 'all .15s',
  },
  totalRow: {
    marginTop: '.75rem',
    padding: '.5rem .75rem',
    background: '#F8FAFC', borderRadius: 8,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
};

export default VentaForm;
