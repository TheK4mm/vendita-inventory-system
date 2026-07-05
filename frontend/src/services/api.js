import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor: adjuntar JWT ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor: manejar errores globales ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  perfil:         ()     => api.get('/auth/perfil'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
};

// ── Clientes ──────────────────────────────────────────────────────────────
export const clientesAPI = {
  listar:        (params) => api.get('/clientes', { params }),
  obtener:       (id)     => api.get(`/clientes/${id}`),
  porCedula:     (cedula) => api.get(`/clientes/cedula/${cedula}`),
  crear:         (formData) => api.post('/clientes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  actualizar:    (id, formData) => api.put(`/clientes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  eliminar:      (id)     => api.delete(`/clientes/${id}`),
  descargarRut:  (id)     => api.get(`/clientes/${id}/rut`, { responseType: 'blob' }),
};

// ── Ventas ────────────────────────────────────────────────────────────────
export const ventasAPI = {
  listar:    (params) => api.get('/ventas', { params }),
  obtener:   (id)     => api.get(`/ventas/${id}`),
  crear:     (data)   => api.post('/ventas', data),
  factura:   (id)     => api.get(`/ventas/${id}/factura`, { responseType: 'blob' }),
};

// ── Caja ──────────────────────────────────────────────────────────────────
export const cajaAPI = {
  resumen:   ()  => api.get('/caja'),
  reporte:   ()  => api.get('/caja/reporte', { responseType: 'blob' }),
};

// ── Productos ─────────────────────────────────────────────────────────────
export const productosAPI = {
  listar:     (params) => api.get('/productos', { params }),
  obtener:    (id)     => api.get(`/productos/${id}`),
  crear:      (data)   => api.post('/productos', data),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  eliminar:   (id)     => api.delete(`/productos/${id}`),
  categorias: ()       => api.get('/productos/categorias'),
};

// ── Exportación ───────────────────────────────────────────────────────────
export const exportAPI = {
  xlsx: () => api.get('/export/xlsx', { responseType: 'blob' }),
  pdf:  () => api.get('/export/pdf',  { responseType: 'blob' }),
};

// Helper: descargar blob
export const descargarArchivo = (blob, nombreArchivo) => {
  const url = window.URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default api;
