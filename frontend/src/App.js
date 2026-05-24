import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './services/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login    from './pages/Login';
import Register from './pages/Register';
import Productos from './pages/Productos';
import Dashboard from './pages/Dashboard';
<<<<<<< HEAD
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Caja from './pages/Caja';
=======
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '10px',
              background: '#1E293B',
              color: '#F8FAFC',
              fontSize: '0.9rem',
              boxShadow: '0 8px 24px rgba(0,0,0,.25)',
            },
            success: { iconTheme: { primary: '#16A34A', secondary: '#DCFCE7' } },
            error:   { iconTheme: { primary: '#DC2626', secondary: '#FEE2E2' } },
          }}
        />
        <Routes>
          {/* Rutas públicas */}
<<<<<<< HEAD
          <Route path="/login"            element={<Login />} />
          <Route path="/register"         element={<Register />} />
          <Route path="/forgot-password"  element={<ForgotPassword />} />
          <Route path="/reset-password"   element={<ResetPassword />} />
=======
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978

          {/* Rutas privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/productos" element={<Productos />} />
            <Route path="/dashboard" element={<Dashboard />} />
<<<<<<< HEAD
            <Route path="/clientes"  element={<Clientes />} />
            <Route path="/ventas"    element={<Ventas />} />
            <Route path="/caja"      element={<Caja />} />
=======
>>>>>>> d0118356b9a8b90fe4478bf2f476c700b3902978
          </Route>

          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="*" element={<Navigate to="/productos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
