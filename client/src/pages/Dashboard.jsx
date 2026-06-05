import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'optica') return <OpticaDashboard user={user} />;
  if (user.role === 'brand') return <BrandDashboard user={user} />;
  return null;
}

// ============================================================
// ADMIN
// ============================================================
function AdminDashboard() {
  const [pending, setPending] = useState({ opticas: [], brands: [] });
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/pending'), api.get('/admin/stats')])
      .then(([p, s]) => { setPending(p.data); setStats(s.data); });
  }, [msg]);

  async function validate(type, id, status) {
    await api.patch(`/admin/${type}/${id}/validate`, { status });
    setMsg(`${type} ${status}`);
  }

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Panel de administración</h1>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Usuarios', value: stats.totalUsers },
            { label: 'Ópticas activas', value: stats.totalOpticas },
            { label: 'Marcas activas', value: stats.totalBrands },
            { label: 'Pedidos', value: stats.totalOrders },
            { label: 'Pendientes', value: stats.pendingValidations, alert: true },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 4, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.alert && s.value > 0 ? '#f73' : '#3483fa' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Ópticas pendientes ({pending.opticas.length})</h2>
          {pending.opticas.length === 0
            ? <p style={{ color: '#999', fontSize: 14 }}>Sin pendientes</p>
            : pending.opticas.map(o => (
              <div key={o.id} style={{ background: '#fff', borderRadius: 4, padding: 16, marginBottom: 8 }}>
                <p style={{ fontWeight: 600 }}>{o.businessName}</p>
                <p style={{ fontSize: 13, color: '#666' }}>CUIT: {o.cuit} · {o.user?.email}</p>
                <p style={{ fontSize: 13, color: '#666' }}>{o.city}, {o.province}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => validate('optica', o.id, 'approved')} style={{ background: '#00a650', color: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 13 }}>Aprobar</button>
                  <button onClick={() => validate('optica', o.id, 'rejected')} style={{ background: '#fff', color: '#c00', padding: '6px 16px', borderRadius: 4, fontSize: 13, border: '1px solid #c00' }}>Rechazar</button>
                </div>
              </div>
            ))
          }
        </section>

        <section>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Marcas pendientes ({pending.brands.length})</h2>
          {pending.brands.length === 0
            ? <p style={{ color: '#999', fontSize: 14 }}>Sin pendientes</p>
            : pending.brands.map(b => (
              <div key={b.id} style={{ background: '#fff', borderRadius: 4, padding: 16, marginBottom: 8 }}>
                <p style={{ fontWeight: 600 }}>{b.brandName}</p>
                <p style={{ fontSize: 13, color: '#666' }}>CUIT: {b.cuit} · {b.user?.email}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => validate('brand', b.id, 'approved')} style={{ background: '#00a650', color: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 13 }}>Aprobar</button>
                  <button onClick={() => validate('brand', b.id, 'rejected')} style={{ background: '#fff', color: '#c00', padding: '6px 16px', borderRadius: 4, fontSize: 13, border: '1px solid #c00' }}>Rechazar</button>
                </div>
              </div>
            ))
          }
        </section>
      </div>
    </div>
  );
}

// ============================================================
// ÓPTICA
// ============================================================
function OpticaDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('pedidos');

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data));
  }, []);

  const pending = user.status === 'pending' || user.profile?.validationStatus === 'pending';

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Mi óptica</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>{user.profile?.businessName}</p>

      {pending && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 4, padding: '14px 18px', marginBottom: 20, fontSize: 14 }}>
          ⏳ <strong>Tu cuenta está pendiente de validación.</strong> Revisamos tu CUIT y te avisamos cuando esté aprobada para que puedas empezar a vender.
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #eee' }}>
        {['pedidos', 'inventario'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 600, background: 'none',
            borderBottom: tab === t ? '2px solid #3483fa' : '2px solid transparent',
            color: tab === t ? '#3483fa' : '#666', marginBottom: -2
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'pedidos' && (
        <PedidosOptica orders={orders} setOrders={setOrders} />
      )}

      {tab === 'inventario' && <InventarioTab />}
    </div>
  );
}

function InventarioTab() {
  const [inventory, setInventory] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ productId: '', price: '', quantity: 1, stockType: 'own' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get('/inventory').then(r => setInventory(r.data || []));
    api.get('/products?limit=100').then(r => setAllProducts(r.data.products || []));
  }, [refresh]);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/inventory', {
        productId: form.productId,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        stockType: form.stockType,
      });
      setMsg('✓ Producto agregado al inventario');
      setShowAdd(false);
      setForm({ productId: '', price: '', quantity: 1, stockType: 'own' });
      setRefresh(r => r + 1);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || 'Error al agregar'));
    } finally {
      setSaving(false);
    }
  }

  async function removeFromInventory(id) {
    await api.delete(`/inventory/${id}`);
    setRefresh(r => r + 1);
  }

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 };

  // Productos que la óptica aún no tiene
  const inventoryProductIds = new Set(inventory.map(i => i.productId));
  const available = allProducts.filter(p => !inventoryProductIds.has(p.id));

  return (
    <div>
      {msg && (
        <div style={{ background: msg.startsWith('✓') ? '#f0fff4' : '#fff0f0', border: `1px solid ${msg.startsWith('✓') ? '#c6f6d5' : '#f5c6cb'}`, borderRadius: 4, padding: '10px 16px', marginBottom: 14, fontSize: 14, color: msg.startsWith('✓') ? '#276749' : '#c00' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: '#666' }}>{inventory.length} producto{inventory.length !== 1 ? 's' : ''} en tu inventario</p>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: '#3483fa', color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 14, fontWeight: 600 }}>
          {showAdd ? 'Cancelar' : '+ Agregar producto'}
        </button>
      </div>

      {/* Formulario agregar */}
      {showAdd && (
        <form onSubmit={handleAdd} style={{ background: '#f8fbff', border: '1px solid #d0e8ff', borderRadius: 4, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Agregar producto al inventario</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Producto *</label>
              <select style={inp} required value={form.productId} onChange={e => {
                const p = allProducts.find(p => p.id === e.target.value);
                setForm(f => ({ ...f, productId: e.target.value, price: p?.suggestedPrice || '' }));
              }}>
                <option value="">Seleccionar producto</option>
                {available.map(p => (
                  <option key={p.id} value={p.id}>{p.brand?.brandName} — {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Precio (ARS) *</label>
              <input style={inp} type="number" required placeholder="89990" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Stock</label>
              <input style={inp} type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Tipo</label>
              <select style={inp} value={form.stockType} onChange={e => setForm(f => ({ ...f, stockType: e.target.value }))}>
                <option value="own">Stock propio</option>
                <option value="dropshipping">Dropshipping</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ background: '#00a650', color: '#fff', padding: '10px 24px', borderRadius: 4, fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Guardando...' : 'Agregar al inventario'}
          </button>
        </form>
      )}

      {/* Lista de inventario */}
      {inventory.length === 0
        ? <div style={{ background: '#fff', borderRadius: 4, padding: 40, textAlign: 'center', color: '#999' }}>
            No tenés productos en tu inventario aún
          </div>
        : inventory.map(item => (
          <div key={item.id} style={{ background: '#fff', borderRadius: 4, padding: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
              {item.product?.images?.[0]?.url
                ? <img src={item.product.images[0].url} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }} />
                : <div style={{ width: 48, height: 48, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👓</div>
              }
              <div>
                <p style={{ fontWeight: 600 }}>{item.product?.name}</p>
                <p style={{ fontSize: 13, color: '#999' }}>{item.product?.brand?.brandName} · {item.product?.frameType}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginRight: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 16 }}>${item.price.toLocaleString('es-AR')}</p>
              <p style={{ fontSize: 13, color: '#666' }}>
                {item.stockType === 'dropshipping' ? '📦 Dropshipping' : `Stock: ${item.quantity}`}
              </p>
            </div>
            <button onClick={() => removeFromInventory(item.id)} style={{ background: 'none', color: '#c00', fontSize: 13, border: '1px solid #f5c6cb', borderRadius: 4, padding: '4px 10px' }}>
              Quitar
            </button>
          </div>
        ))
      }
    </div>
  );
}

// ============================================================
// MARCA
// ============================================================
function BrandDashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('productos');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (user.profile?.id) {
      api.get(`/brands/${user.profile.id}`).then(r => setProducts(r.data.products || []));
    }
  }, [user, refresh]);

  const pending = user.status === 'pending' || user.profile?.validationStatus === 'pending';

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Mi marca</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>{user.profile?.brandName}</p>

      {pending && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 4, padding: '14px 18px', marginBottom: 20, fontSize: 14 }}>
          ⏳ <strong>Tu marca está pendiente de validación.</strong> Una vez aprobada podés empezar a cargar productos.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #eee' }}>
        {['productos', 'nuevo producto'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 600, background: 'none',
            borderBottom: tab === t ? '2px solid #3483fa' : '2px solid transparent',
            color: tab === t ? '#3483fa' : '#666', marginBottom: -2,
            textTransform: 'capitalize'
          }}>
            {t === 'nuevo producto' ? '+ Nuevo producto' : `Mis productos (${products.length})`}
          </button>
        ))}
      </div>

      {tab === 'productos' && (
        products.length === 0
          ? <div style={{ background: '#fff', borderRadius: 4, padding: 40, textAlign: 'center', color: '#999' }}>
              <p style={{ marginBottom: 12 }}>No cargaste productos todavía</p>
              <button onClick={() => setTab('nuevo producto')} style={{ background: '#3483fa', color: '#fff', padding: '10px 20px', borderRadius: 4, fontSize: 14, fontWeight: 600 }}>
                + Cargar primer producto
              </button>
            </div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 4, padding: 16, border: '1px solid #eee' }}>
                  <div style={{ height: 120, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' }}>
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: 36 }}>👓</span>}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: '#888', textTransform: 'capitalize', marginBottom: 4 }}>{p.frameType}</p>
                  {p.suggestedPrice && <p style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>${p.suggestedPrice.toLocaleString('es-AR')}</p>}
                  <span style={{
                    display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: p.status === 'active' ? '#f0fff4' : '#f5f5f5',
                    color: p.status === 'active' ? '#276749' : '#888',
                    border: `1px solid ${p.status === 'active' ? '#c6f6d5' : '#ddd'}`
                  }}>
                    {p.status === 'active' ? '✓ Activo' : 'Borrador'}
                  </span>
                </div>
              ))}
            </div>
      )}

      {tab === 'nuevo producto' && (
        <NuevoProductoForm onSuccess={() => { setTab('productos'); setRefresh(r => r + 1); }} />
      )}
    </div>
  );
}

function NuevoProductoForm({ onSuccess }) {
  const [form, setForm] = useState({ status: 'active', gender: 'unisex', frameType: 'sol', isPrescription: false });
  const [variants, setVariants] = useState([{ color: '', size: 'Único' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function addVariant() { setVariants(v => [...v, { color: '', size: 'Único' }]); }
  function setVariant(i, k, v) { setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, [k]: v } : vv)); }
  function removeVariant(i) { setVariants(vs => vs.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/products', {
        ...form,
        suggestedPrice: form.suggestedPrice ? parseFloat(form.suggestedPrice) : undefined,
        lensWidth: form.lensWidth ? parseFloat(form.lensWidth) : undefined,
        lensHeight: form.lensHeight ? parseFloat(form.lensHeight) : undefined,
        bridge: form.bridge ? parseFloat(form.bridge) : undefined,
        templeLength: form.templeLength ? parseFloat(form.templeLength) : undefined,
        totalWidth: form.totalWidth ? parseFloat(form.totalWidth) : undefined,
        variants: variants.filter(v => v.color),
      });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  }

  const input = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14 };
  const label = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#444' };
  const section = { background: '#fff', borderRadius: 4, padding: 24, marginBottom: 16, border: '1px solid #eee' };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', borderRadius: 4, padding: '10px 14px', color: '#c00', fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Info básica */}
      <div style={section}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Información básica</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={label}>Nombre del producto *</label>
            <input style={input} required placeholder="Ej: Rusty Zaedit" onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label style={label}>SKU / Código</label>
            <input style={input} placeholder="Ej: RST-ZAEDIT" onChange={e => set('sku', e.target.value)} />
          </div>
          <div>
            <label style={label}>Precio sugerido (ARS) *</label>
            <input style={input} type="number" required placeholder="89990" onChange={e => set('suggestedPrice', e.target.value)} />
          </div>
          <div>
            <label style={label}>Categoría *</label>
            <select style={input} value={form.frameType} onChange={e => set('frameType', e.target.value)}>
              <option value="sol">Anteojos de sol</option>
              <option value="opticos">Ópticos / Receta</option>
              <option value="contacto">Lentes de contacto</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>
          <div>
            <label style={label}>Género</label>
            <select style={input} value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="unisex">Unisex</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              <option value="ninos">Niños</option>
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={label}>Descripción</label>
            <textarea style={{ ...input, height: 90, resize: 'vertical' }} placeholder="Describí el producto..." onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="receta" checked={form.isPrescription} onChange={e => set('isPrescription', e.target.checked)} style={{ width: 16, height: 16 }} />
            <label htmlFor="receta" style={{ fontSize: 14, cursor: 'pointer' }}>Requiere receta médica</label>
          </div>
        </div>
      </div>

      {/* Armazón y cristales */}
      <div style={section}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Armazón y cristales</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label style={label}>Forma del armazón</label>
            <select style={input} onChange={e => set('frameShape', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="rectangular">Rectangular</option>
              <option value="cuadrado">Cuadrado</option>
              <option value="redondo">Redondo</option>
              <option value="aviador">Aviador</option>
              <option value="mariposa">Mariposa / Cat-eye</option>
              <option value="deportivo">Deportivo</option>
            </select>
          </div>
          <div>
            <label style={label}>Material del armazón</label>
            <input style={input} placeholder="Ej: Grilamid, Acetato" onChange={e => set('material', e.target.value)} />
          </div>
          <div>
            <label style={label}>Color del armazón</label>
            <input style={input} placeholder="Ej: Negro mate" onChange={e => set('frameColor', e.target.value)} />
          </div>
          <div>
            <label style={label}>Tipo de cristal</label>
            <select style={input} onChange={e => set('lensType', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="polarizado">Polarizado</option>
              <option value="antirreflejo">Antirreflejo</option>
              <option value="fotocromático">Fotocromático</option>
              <option value="clásico">Clásico</option>
            </select>
          </div>
          <div>
            <label style={label}>Material del cristal</label>
            <input style={input} placeholder="Ej: Policarbonato" onChange={e => set('lensMaterial', e.target.value)} />
          </div>
          <div>
            <label style={label}>Protección UV</label>
            <select style={input} onChange={e => set('uvProtection', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="UV400">UV400</option>
              <option value="UV380">UV380</option>
            </select>
          </div>
          <div>
            <label style={label}>Color del cristal</label>
            <input style={input} placeholder="Ej: Negro polarizado" onChange={e => set('lensColor', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Medidas */}
      <div style={section}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Medidas (en mm)</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Estas medidas ayudan al comprador a elegir el talle correcto</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {[
            { key: 'lensWidth', label: 'A — Ancho cristal' },
            { key: 'lensHeight', label: 'B — Alto cristal' },
            { key: 'bridge', label: 'C — Puente nasal' },
            { key: 'templeLength', label: 'D — Patillas' },
            { key: 'totalWidth', label: 'Ancho total' },
          ].map(m => (
            <div key={m.key}>
              <label style={label}>{m.label}</label>
              <input style={input} type="number" step="0.1" placeholder="mm" onChange={e => set(m.key, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* URL de imagen */}
      <div style={section}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Imagen del producto</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Pegá la URL de una imagen (JPG, PNG, WebP)</p>
        <input style={input} type="url" placeholder="https://..." onChange={e => set('imageUrl', e.target.value)} />
        {form.imageUrl && (
          <div style={{ marginTop: 12, width: 120, height: 120, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={form.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
          </div>
        )}
      </div>

      {/* Variantes */}
      <div style={section}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Colores / Variantes</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Agregá los distintos colores o talles disponibles</p>
        {variants.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
            <input style={{ ...input, flex: 2 }} placeholder="Color (ej: Negro mate / Gris polarizado)" value={v.color} onChange={e => setVariant(i, 'color', e.target.value)} />
            <input style={{ ...input, flex: 1 }} placeholder="Talle (ej: Único, S, M)" value={v.size} onChange={e => setVariant(i, 'size', e.target.value)} />
            {variants.length > 1 && (
              <button type="button" onClick={() => removeVariant(i)} style={{ background: 'none', color: '#c00', fontSize: 18, padding: '0 8px', flexShrink: 0 }}>✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addVariant} style={{ background: 'none', color: '#3483fa', fontSize: 14, fontWeight: 600, padding: '6px 0' }}>
          + Agregar variante
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={loading} style={{
          background: '#3483fa', color: '#fff', padding: '12px 32px',
          borderRadius: 4, fontSize: 15, fontWeight: 600, opacity: loading ? 0.7 : 1
        }}>
          {loading ? 'Publicando...' : 'Publicar producto'}
        </button>
        <button type="button" onClick={() => set('status', 'draft')} style={{
          background: '#fff', color: '#666', padding: '12px 24px',
          borderRadius: 4, fontSize: 15, border: '1px solid #ddd'
        }}>
          Guardar borrador
        </button>
      </div>
    </form>
  );
}

function PedidosOptica({ orders, setOrders }) {
  const [tracking, setTracking] = useState({});
  const [updating, setUpdating] = useState(null);

  const NEXT = { paid: 'processing', processing: 'shipped', shipped: 'delivered' };
  const NEXT_LABEL = { paid: 'Marcar en preparación', processing: 'Marcar como enviado', shipped: 'Marcar como entregado' };

  async function advance(order) {
    const next = NEXT[order.status];
    if (!next) return;
    setUpdating(order.id);
    try {
      const r = await api.patch(`/orders/${order.id}/status`, { status: next, trackingNumber: tracking[order.id] });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: r.data.status, trackingNumber: r.data.trackingNumber } : o));
    } catch (e) {
      alert(e.response?.data?.error || 'Error al actualizar');
    } finally {
      setUpdating(null);
    }
  }

  if (orders.length === 0) {
    return <div style={{ background: '#fff', borderRadius: 4, padding: 40, textAlign: 'center', color: '#999' }}>Todavía no tenés pedidos</div>;
  }

  return (
    <div>
      {orders.map(o => (
        <div key={o.id} style={{ background: '#fff', borderRadius: 4, padding: 20, marginBottom: 12, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Pedido #{o.id.substring(0, 8).toUpperCase()}</p>
              <p style={{ fontSize: 13, color: '#666' }}>
                {o.consumer?.firstName} {o.consumer?.lastName} · {o.shippingCity}, {o.shippingProvince}
              </p>
              <p style={{ fontSize: 13, color: '#888' }}>{new Date(o.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700, fontSize: 18 }}>${o.total.toLocaleString('es-AR')}</p>
              <StatusBadge status={o.status} />
            </div>
          </div>

          {/* Items del pedido */}
          {o.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f5f5f5', fontSize: 13 }}>
              <span style={{ fontSize: 20 }}>👓</span>
              <span style={{ flex: 1 }}>{item.inventory?.product?.name || 'Producto'}</span>
              <span style={{ color: '#666' }}>x{item.quantity}</span>
              <span style={{ fontWeight: 600 }}>${(item.unitPrice * item.quantity).toLocaleString('es-AR')}</span>
            </div>
          ))}

          {/* Tracking number si está enviado */}
          {o.trackingNumber && (
            <p style={{ fontSize: 13, color: '#3483fa', marginTop: 8 }}>📦 Tracking: <strong>{o.trackingNumber}</strong></p>
          )}

          {/* Acción para avanzar estado */}
          {NEXT[o.status] && (
            <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              {o.status === 'processing' && (
                <input
                  placeholder="Número de tracking (opcional)"
                  value={tracking[o.id] || ''}
                  onChange={e => setTracking(t => ({ ...t, [o.id]: e.target.value }))}
                  style={{ padding: '7px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, flex: 1 }}
                />
              )}
              <button
                onClick={() => advance(o)}
                disabled={updating === o.id}
                style={{ background: '#00a650', color: '#fff', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 600, opacity: updating === o.id ? 0.7 : 1 }}
              >
                {updating === o.id ? '...' : NEXT_LABEL[o.status]}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending_payment: { label: 'Pago pendiente', color: '#f73' },
    paid: { label: 'Pagado', color: '#3483fa' },
    processing: { label: 'En preparación', color: '#3483fa' },
    shipped: { label: 'Enviado', color: '#9b59b6' },
    delivered: { label: 'Entregado', color: '#00a650' },
    cancelled: { label: 'Cancelado', color: '#999' },
  };
  const s = map[status] || { label: status, color: '#999' };
  return <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</span>;
}
