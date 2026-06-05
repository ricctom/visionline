import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Checkout() {
  const { items, total, byOptica, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: '', city: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  if (!user) { navigate('/login?redirect=/checkout'); return null; }
  if (items.length === 0) { navigate('/carrito'); return null; }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.address || !form.city || !form.province) {
      setError('Completá todos los campos de envío'); return;
    }
    setLoading(true);
    setError('');
    try {
      // Crear un pedido por cada óptica
      const orders = await Promise.all(
        Object.entries(byOptica).map(([opticaId, group]) =>
          api.post('/orders', {
            items: group.items.map(i => ({ inventoryId: i.inventoryId, quantity: i.quantity })),
            shippingAddress: form.address,
            shippingCity: form.city,
            shippingProvince: form.province,
          })
        )
      );
      clearCart();
      navigate('/mis-compras?nuevo=true');
    } catch (e) {
      setError(e.response?.data?.error || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  }

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#444' };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
        <Link to="/carrito" style={{ color: '#3483fa' }}>Carrito</Link> {' > '} <strong>Finalizar compra</strong>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', borderRadius: 4, padding: '10px 14px', color: '#c00', fontSize: 14, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Datos del comprador */}
          <div style={{ background: '#fff', borderRadius: 4, padding: 24, marginBottom: 16, border: '1px solid #eee' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tus datos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Nombre</label>
                <input style={{ ...inp, background: '#f5f5f5' }} value={user.profile?.firstName || ''} disabled />
              </div>
              <div>
                <label style={lbl}>Apellido</label>
                <input style={{ ...inp, background: '#f5f5f5' }} value={user.profile?.lastName || ''} disabled />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Email</label>
                <input style={{ ...inp, background: '#f5f5f5' }} value={user.email || ''} disabled />
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div style={{ background: '#fff', borderRadius: 4, padding: 24, marginBottom: 16, border: '1px solid #eee' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Dirección de entrega</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Dirección *</label>
                <input style={inp} placeholder="Av. Corrientes 1234, Piso 3" required value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Ciudad *</label>
                <input style={inp} placeholder="Buenos Aires" required value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Provincia *</label>
                <select style={inp} required value={form.province} onChange={e => set('province', e.target.value)}>
                  <option value="">Seleccionar</option>
                  {['CABA','Buenos Aires','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Método de pago — placeholder */}
          <div style={{ background: '#fff', borderRadius: 4, padding: 24, marginBottom: 24, border: '1px solid #eee' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Método de pago</h2>
            <div style={{ border: '2px solid #3483fa', borderRadius: 4, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: '#f0f7ff' }}>
              <span style={{ fontSize: 24 }}>💳</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>MercadoPago</p>
                <p style={{ fontSize: 12, color: '#666' }}>Tarjeta de crédito, débito o dinero en cuenta</p>
              </div>
              <span style={{ marginLeft: 'auto', color: '#3483fa', fontWeight: 700 }}>✓</span>
            </div>
            <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              * Integración con MercadoPago — próximamente activa
            </p>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', background: '#3483fa', color: '#fff',
            borderRadius: 4, fontSize: 17, fontWeight: 700, opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Procesando...' : `Confirmar compra · $${total.toLocaleString('es-AR')}`}
          </button>
        </form>

        {/* Resumen */}
        <div>
          <div style={{ background: '#fff', borderRadius: 4, padding: 20, border: '1px solid #eee', position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Resumen ({items.length} producto{items.length !== 1 ? 's' : ''})</h3>
            {items.map(item => (
              <div key={item.inventoryId} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#f5f5f5', borderRadius: 4, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.imageUrl ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>👓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName}</p>
                  <p style={{ fontSize: 12, color: '#888' }}>x{item.quantity}</p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}>${(item.price * item.quantity).toLocaleString('es-AR')}</p>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17 }}>
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <p style={{ fontSize: 12, color: '#00a650', marginTop: 4 }}>
                6 cuotas de ${Math.round(total / 6).toLocaleString('es-AR')} sin interés
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
