import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';

export default function Perfil() {
  const { user, login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    description: user?.profile?.description || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    province: user?.profile?.province || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = user.role === 'optica' ? '/opticas/me' : user.role === 'brand' ? '/brands/me' : null;
      if (endpoint) {
        await api.patch(endpoint, form);
        toast.show('Perfil actualizado');
      }
    } catch {
      toast.show('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#444' };
  const sec = { background: '#fff', borderRadius: 4, padding: 24, marginBottom: 16, border: '1px solid #eee' };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48, maxWidth: 680 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mi perfil</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>{user.email}</p>

      <form onSubmit={saveProfile}>
        <div style={sec}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Datos personales</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {user.role === 'consumer' && <>
              <div>
                <label style={lbl}>Nombre</label>
                <input style={inp} value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Apellido</label>
                <input style={inp} value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </>}
            {user.role === 'optica' && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Nombre del local</label>
                <input style={{ ...inp, background: '#f5f5f5' }} value={user.profile?.businessName || ''} disabled />
                <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Para cambiar el nombre contactá al soporte</p>
              </div>
            )}
            {user.role === 'brand' && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Nombre de la marca</label>
                <input style={{ ...inp, background: '#f5f5f5' }} value={user.profile?.brandName || ''} disabled />
              </div>
            )}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Teléfono</label>
              <input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Ej: 011-4321-5678" />
            </div>
            {(user.role === 'optica') && <>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Descripción</label>
                <textarea style={{ ...inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Contales a tus clientes sobre tu óptica..." />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Dirección</label>
                <input style={inp} value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Ciudad</label>
                <input style={inp} value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Provincia</label>
                <input style={inp} value={form.province} onChange={e => set('province', e.target.value)} />
              </div>
            </>}
            {user.role === 'brand' && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Descripción de la marca</label>
                <textarea style={{ ...inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div style={sec}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Cuenta</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>Email: <strong>{user.email}</strong></p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 4, padding: '6px 12px', fontSize: 13, color: '#276749' }}>
            ✓ Cuenta {user.role === 'admin' ? 'administradora' : user.role === 'optica' ? 'de óptica' : user.role === 'brand' ? 'de marca' : 'de comprador'} · {user.status === 'active' ? 'Activa' : 'Pendiente'}
          </div>
        </div>

        {user.role !== 'consumer' && (
          <button type="submit" disabled={saving} style={{ background: '#3483fa', color: '#fff', padding: '12px 28px', borderRadius: 4, fontSize: 15, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        )}
      </form>
    </div>
  );
}
