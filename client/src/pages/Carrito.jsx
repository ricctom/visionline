import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';

export default function Carrito() {
  const { items, removeItem, updateQty, total, count, byOptica } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: 64, marginBottom: 16 }}>🛒</p>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Tu carrito está vacío</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>Agregá productos para empezar tu compra</p>
        <Link to="/productos" style={{ background: '#3483fa', color: '#fff', padding: '12px 28px', borderRadius: 4, fontSize: 15, fontWeight: 600 }}>
          Ver catálogo
        </Link>
      </div>
    );
  }

  const multipleOpticas = Object.keys(byOptica).length > 1;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Tu carrito</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>{count} producto{count !== 1 ? 's' : ''}</p>

      {multipleOpticas && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 4, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
          ⚠️ Tenés productos de distintas ópticas. Se generará un pedido por cada una.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Items */}
        <div>
          {Object.entries(byOptica).map(([opticaId, group]) => (
            <div key={opticaId} style={{ background: '#fff', borderRadius: 4, marginBottom: 12, border: '1px solid #eee', overflow: 'hidden' }}>
              <div style={{ background: '#f8f8f8', padding: '10px 16px', borderBottom: '1px solid #eee', fontSize: 13, fontWeight: 600, color: '#555' }}>
                🏪 {group.opticaName}
              </div>
              {group.items.map(item => (
                <div key={item.inventoryId} style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {item.imageUrl ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>👓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>{item.brandName}</p>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.productName}</p>
                    <p style={{ fontSize: 13, color: '#00a650' }}>{item.stockType === 'dropshipping' ? '📦 Envío desde depósito' : '✓ En stock'}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQty(item.inventoryId, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ width: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.inventoryId, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 100 }}>
                    <p style={{ fontWeight: 700, fontSize: 18 }}>${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                    <p style={{ fontSize: 12, color: '#999' }}>${item.price.toLocaleString('es-AR')} c/u</p>
                  </div>
                  <button onClick={() => removeItem(item.inventoryId)} style={{ background: 'none', color: '#999', fontSize: 18, padding: '0 4px' }} title="Eliminar">✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div>
          <div style={{ background: '#fff', borderRadius: 4, padding: 20, border: '1px solid #eee', position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Resumen de compra</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#666' }}>Productos ({count})</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#666' }}>Envío</span>
              <span style={{ color: '#00a650' }}>A calcular</span>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
              <span>Total</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
            <p style={{ fontSize: 12, color: '#00a650', textAlign: 'center', margin: '8px 0 16px' }}>
              en 6 cuotas de ${Math.round(total / 6).toLocaleString('es-AR')} sin interés
            </p>
            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
              style={{ width: '100%', padding: '14px', background: '#3483fa', color: '#fff', borderRadius: 4, fontSize: 16, fontWeight: 600, marginBottom: 10 }}
            >
              Continuar compra
            </button>
            <Link to="/productos" style={{ display: 'block', textAlign: 'center', color: '#3483fa', fontSize: 14 }}>
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
