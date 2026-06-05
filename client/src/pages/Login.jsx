import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post('/auth/login', { email, password });
      login(r.data.token, r.data.user);
      const role = r.data.user.role;
      if (role === 'admin' || role === 'optica' || role === 'brand') navigate('/dashboard');
      else navigate('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Error al ingresar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 4, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Ingresá a Visionline</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
          ¿No tenés cuenta? <Link to="/registro" style={{ color: '#3483fa' }}>Creala gratis</Link>
        </p>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', borderRadius: 4, padding: '10px 14px', color: '#c00', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 15 }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••" required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 15 }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#3483fa', color: '#fff',
            borderRadius: 4, fontSize: 16, fontWeight: 600, opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
