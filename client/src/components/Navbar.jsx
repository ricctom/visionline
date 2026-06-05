import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ background: '#fff159', boxShadow: '0 1px 4px rgba(0,0,0,.15)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>

        {/* Logo */}
        <Link to="/" style={{ fontWeight: 800, fontSize: 22, color: '#3483fa', whiteSpace: 'nowrap', letterSpacing: -0.5, flexShrink: 0 }}>
          Vision<span style={{ color: '#333' }}>line</span>
        </Link>

        {/* Buscador con autocompletado */}
        <SearchBar />

        {/* Carrito */}
        <Link to="/carrito" style={{ position: 'relative', color: '#333', fontSize: 22, flexShrink: 0 }}>
          🛒
          {count > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -8, background: '#f73', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Link>

        {/* Nav desktop */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 14, whiteSpace: 'nowrap' }}>
          {user ? (
            <>
              {(user.role === 'optica' || user.role === 'brand' || user.role === 'admin') && (
                <Link to="/dashboard" style={{ color: '#3483fa', fontWeight: 600 }}>Mi panel</Link>
              )}
              {user.role === 'consumer' && (
                <Link to="/mis-compras" style={{ color: '#333' }}>Mis compras</Link>
              )}
              <Link to="/perfil" style={{ color: '#333' }}>Mi cuenta</Link>
              <button onClick={logout} style={{ background: 'none', color: '#333', fontSize: 14 }}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#333' }}>Ingresá</Link>
              <Link to="/registro" style={{ background: '#3483fa', color: '#fff', padding: '6px 14px', borderRadius: 4, fontWeight: 600, fontSize: 13 }}>Registrate</Link>
            </>
          )}
        </nav>

        {/* Hamburger mobile */}
        <button onClick={() => setMenuOpen(m => !m)} className="nav-mobile-btn" style={{ background: 'none', fontSize: 22, flexShrink: 0, display: 'none' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menú mobile desplegable */}
      {menuOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #eee', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user ? (
            <>
              {(user.role === 'optica' || user.role === 'brand' || user.role === 'admin') && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ color: '#3483fa', fontWeight: 600 }}>Mi panel</Link>
              )}
              {user.role === 'consumer' && (
                <Link to="/mis-compras" onClick={() => setMenuOpen(false)} style={{ color: '#333' }}>Mis compras</Link>
              )}
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{ background: 'none', color: '#c00', textAlign: 'left', fontSize: 14 }}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: '#333', fontWeight: 600 }}>Ingresá</Link>
              <Link to="/registro" onClick={() => setMenuOpen(false)} style={{ color: '#3483fa', fontWeight: 600 }}>Creá tu cuenta</Link>
            </>
          )}
        </div>
      )}

      {/* Categorías */}
      <div style={{ background: '#3483fa', padding: '6px 0', overflowX: 'auto' }}>
        <div className="container" style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          {[
            { label: 'Ópticos', q: 'opticos' },
            { label: 'Sol', q: 'sol' },
            { label: 'Lentes de contacto', q: 'contacto' },
            { label: 'Accesorios', q: 'accesorios' },
          ].map(cat => (
            <Link key={cat.q} to={`/productos?frameType=${cat.q}`}
              style={{ color: '#fff', opacity: 0.9, fontWeight: 500, whiteSpace: 'nowrap' }}
            >
              {cat.label}
            </Link>
          ))}
          <Link to="/opticas" style={{ color: '#fff', opacity: 0.9, fontWeight: 500, whiteSpace: 'nowrap' }}>Ópticas</Link>
          <Link to="/marcas" style={{ color: '#fff', opacity: 0.9, fontWeight: 500, whiteSpace: 'nowrap' }}>Marcas</Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
