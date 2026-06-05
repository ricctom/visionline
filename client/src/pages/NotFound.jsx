import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <p style={{ fontSize: 72, marginBottom: 8 }}>👓</p>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#333' }}>404</h1>
      <p style={{ fontSize: 18, color: '#666', marginBottom: 24 }}>Esta página no existe</p>
      <Link to="/" style={{ background: '#3483fa', color: '#fff', padding: '12px 28px', borderRadius: 4, fontSize: 15, fontWeight: 600 }}>
        Volver al inicio
      </Link>
    </div>
  );
}
