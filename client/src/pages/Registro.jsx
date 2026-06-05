import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Registro() {
  const [searchParams] = useSearchParams();
  const [rol, setRol] = useState(searchParams.get('rol') || 'consumer');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post(`/auth/register/${rol}`, form);
      login(r.data.token, r.data.user);
      if (rol === 'optica' || rol === 'brand') navigate('/dashboard');
      else navigate('/');
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 15 };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 4, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Creá tu cuenta</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
          ¿Ya tenés cuenta? <Link to="/login" style={{ color: '#3483fa' }}>Ingresá</Link>
        </p>

        {/* Selector de rol */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { value: 'consumer', label: 'Comprador' },
            { value: 'optica', label: 'Óptica' },
            { value: 'brand', label: 'Marca' },
          ].map(r => (
            <button key={r.value} onClick={() => setRol(r.value)} style={{
              flex: 1, padding: '10px', borderRadius: 4, fontSize: 14, fontWeight: 600,
              background: rol === r.value ? '#3483fa' : '#f5f5f5',
              color: rol === r.value ? '#fff' : '#666',
              border: rol === r.value ? '2px solid #3483fa' : '2px solid #f5f5f5'
            }}>
              {r.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', borderRadius: 4, padding: '10px 14px', color: '#c00', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {rol === 'consumer' && <>
              <div><label style={labelStyle}>Nombre</label><input style={inputStyle} required onChange={e => set('firstName', e.target.value)} /></div>
              <div><label style={labelStyle}>Apellido</label><input style={inputStyle} required onChange={e => set('lastName', e.target.value)} /></div>
            </>}
            {rol === 'optica' && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Nombre de la óptica</label>
                <input style={inputStyle} required placeholder="Ej: Óptica San Martín" onChange={e => set('businessName', e.target.value)} />
              </div>
            )}
            {rol === 'brand' && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Nombre de la marca</label>
                <input style={inputStyle} required placeholder="Ej: OptiRus" onChange={e => set('brandName', e.target.value)} />
              </div>
            )}
          </div>

          {(rol === 'optica' || rol === 'brand') && (
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>CUIT</label>
              <input style={inputStyle} required placeholder="30-12345678-9" onChange={e => set('cuit', e.target.value)} />
            </div>
          )}

          {rol === 'optica' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={labelStyle}>Ciudad</label><input style={inputStyle} onChange={e => set('city', e.target.value)} /></div>
              <div><label style={labelStyle}>Provincia</label><input style={inputStyle} onChange={e => set('province', e.target.value)} /></div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" style={inputStyle} required onChange={e => set('email', e.target.value)} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Contraseña</label>
            <input type="password" style={inputStyle} required minLength={6} onChange={e => set('password', e.target.value)} />
          </div>

          {(rol === 'optica' || rol === 'brand') && (
            <div style={{ background: '#f0f7ff', border: '1px solid #d0e8ff', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#555', marginBottom: 16 }}>
              ⓘ Tu cuenta quedará pendiente de validación. Te avisamos cuando esté aprobada.
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 12, background: '#3483fa', color: '#fff',
            borderRadius: 4, fontSize: 16, fontWeight: 600, opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
