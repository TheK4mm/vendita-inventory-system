import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.navInner}>
        {/* Logo */}
        <Link to="/productos" style={styles.logo}>
          <span style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </span>
          <span style={styles.logoText}>VenditaApp</span>
        </Link>

        {/* Links desktop */}
        <div style={styles.links}>
          <Link to="/productos" style={{ ...styles.link, ...(isActive('/productos') ? styles.linkActive : {}) }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Productos
          </Link>
          <Link to="/clientes" style={{ ...styles.link, ...(isActive('/clientes') ? styles.linkActive : {}) }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Clientes
          </Link>
          <Link to="/ventas" style={{ ...styles.link, ...(isActive('/ventas') ? styles.linkActive : {}) }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Ventas
          </Link>
          <Link to="/caja" style={{ ...styles.link, ...(isActive('/caja') ? styles.linkActive : {}) }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Caja
          </Link>
          <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.linkActive : {}) }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
              <line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Usuario */}
        <div style={styles.userArea}>
          <div style={styles.userChip}>
            <div style={styles.avatar}>{usuario?.nombre?.[0]?.toUpperCase() || 'U'}</div>
            <span style={styles.userName}>{usuario?.nombre}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>
        </div>

        {/* Menú hamburguesa (mobile) */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/productos" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Productos
          </Link>
          <Link to="/clientes" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Clientes
          </Link>
          <Link to="/ventas" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Ventas
          </Link>
          <Link to="/caja" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Caja
          </Link>
          <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
              <line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
            Dashboard
          </Link>
          <button onClick={handleLogout} style={styles.mobileLinkBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: '#0F172A',
    boxShadow: '0 2px 12px rgba(0,0,0,.25)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 1.5rem',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '.5rem',
    textDecoration: 'none', color: '#fff',
    fontSize: '1.125rem', fontWeight: 800,
  },
  logoIcon: { display: 'flex', alignItems: 'center' },
  logoText: { background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  links: { display: 'flex', gap: '.25rem' },
  link: {
    display: 'flex', alignItems: 'center', gap: '.375rem',
    padding: '.5rem .875rem', borderRadius: 8,
    textDecoration: 'none', color: '#94A3B8',
    fontSize: '.875rem', fontWeight: 500,
    transition: 'all .2s',
  },
  linkActive: { background: 'rgba(99,102,241,.2)', color: '#818CF8' },
  userArea: { display: 'flex', alignItems: 'center', gap: '.75rem' },
  userChip: { display: 'flex', alignItems: 'center', gap: '.5rem' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
    color: '#fff', fontWeight: 700, fontSize: '.875rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userName: { color: '#CBD5E1', fontSize: '.875rem', fontWeight: 500 },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '.375rem',
    background: 'rgba(220,38,38,.15)', color: '#FCA5A5',
    border: '1px solid rgba(220,38,38,.3)', borderRadius: 8,
    padding: '.4rem .875rem', cursor: 'pointer',
    fontSize: '.8125rem', fontWeight: 600, transition: 'all .2s',
  },
  hamburger: {
    display: 'none', background: 'none', border: 'none',
    color: '#fff', cursor: 'pointer', padding: '.25rem',
    '@media(max-width:768px)': { display: 'block' },
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    background: '#1E293B', borderTop: '1px solid #334155',
    padding: '.75rem 1.5rem',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: '.5rem',
    color: '#94A3B8', textDecoration: 'none',
    padding: '.75rem 0', borderBottom: '1px solid #334155',
    fontSize: '.9375rem',
  },
  mobileLinkBtn: {
    display: 'flex', alignItems: 'center', gap: '.5rem',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#FCA5A5', textAlign: 'left', padding: '.75rem 0',
    fontSize: '.9375rem',
  },
};

export default Navbar;
