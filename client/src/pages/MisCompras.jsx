import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';

function ReviewForm({ orderId, opticaName, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.post(`/orders/${orderId}/review`, { rating, comment });
      onDone(r.data);
    } catch(e) {
      alert(e.response?.data?.error || 'Error al enviar reseña');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>¿Cómo fue tu experiencia con {opticaName}?</p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {[1,2,3,4,5].map(n => (
          <span key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            style={{ fontSize: 28, cursor: 'pointer', color: n <= (hover || rating) ? '#f90' : '#ddd', transition: 'color .1s' }}>
            ★
          </span>
        ))}
        <span style={{ fontSize: 13, color: '#666', marginLeft: 8, alignSelf: 'center' }}>
          {['','Muy malo','Malo','Regular','Bueno','Excelente'][hover || rating]}
        </span>
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Contanos tu experiencia (opcional)..."
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, height: 72, resize: 'none', marginBottom: 10 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={saving} style={{ background: '#3483fa', color: '#fff', padding: '8px 20px', borderRadius: 4, fontSize: 13, fontWeight: 600 }}>
          {saving ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </div>
    </form>
  );
}

const STATUS = {
  pending_payment: { label: 'Pago pendiente', color: '#f73', bg: '#fff8f0' },
  paid:            { label: 'Pagado', color: '#3483fa', bg: '#f0f7ff' },
  processing:      { label: 'En preparación', color: '#9b59b6', bg: '#f8f0ff' },
  shipped:         { label: 'En camino', color: '#e67e22', bg: '#fff8f0' },
  delivered:       { label: 'Entregado', color: '#00a650', bg: '#f0fff4' },
  cancelled:       { label: 'Cancelado', color: '#999', bg: '#f5f5f5' },
};

export default function MisCompras() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({}); // orderId -> review enviada
  const [reviewForm, setReviewForm] = useState(null); // orderId activo
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const isNew = searchParams.get('nuevo') === 'true';

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data || [])).finally(() => setLoading(false));
  }, []);

  if (!user) return <div style={{ textAlign: 'center', padding: 60 }}><Link to="/login" style={{ color: '#3483fa' }}>Ingresá para ver tus compras</Link></div>;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      {isNew && (
        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 4, padding: '14px 18px', marginBottom: 20, fontSize: 15, color: '#276749' }}>
          ✅ <strong>¡Pedido confirmado!</strong> Te avisaremos cuando la óptica lo prepare.
        </div>
      )}
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Mis compras</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Cargando...</div>
      ) : orders.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 4, padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📦</p>
          <p style={{ fontSize: 18, color: '#666', marginBottom: 16 }}>Todavía no realizaste compras</p>
          <Link to="/productos" style={{ background: '#3483fa', color: '#fff', padding: '12px 24px', borderRadius: 4, fontWeight: 600 }}>Ver catálogo</Link>
        </div>
      ) : (
        orders.map(order => {
          const s = STATUS[order.status] || STATUS.pending_payment;
          return (
            <div key={order.id} style={{ background: '#fff', borderRadius: 4, border: '1px solid #eee', marginBottom: 12, overflow: 'hidden' }}>
              {/* Header del pedido */}
              <div style={{ background: '#f8f8f8', padding: '12px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#666' }}>
                  <span><strong style={{ color: '#333' }}>Pedido</strong> #{order.id.substring(0, 8).toUpperCase()}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <span><strong style={{ color: '#333' }}>{order.optica?.businessName}</strong></span>
                </div>
                <span style={{ background: s.bg, color: s.color, fontWeight: 700, fontSize: 12, padding: '4px 12px', borderRadius: 20 }}>
                  {s.label}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: '16px 20px' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ width: 56, height: 56, background: '#f5f5f5', borderRadius: 4, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.inventory?.product?.images?.[0]?.url
                        ? <img src={item.inventory.product.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <span style={{ fontSize: 22 }}>👓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{item.inventory?.product?.name}</p>
                      <p style={{ fontSize: 13, color: '#666' }}>x{item.quantity} · ${item.unitPrice.toLocaleString('es-AR')} c/u</p>
                    </div>
                    <p style={{ fontWeight: 700 }}>${(item.unitPrice * item.quantity).toLocaleString('es-AR')}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {order.trackingNumber && <span>📦 Tracking: <strong>{order.trackingNumber}</strong></span>}
                  {order.shippingCity && !order.trackingNumber && <span>📍 {order.shippingAddress}, {order.shippingCity}</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: '#666' }}>Total</p>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>${order.total.toLocaleString('es-AR')}</p>
                </div>
              </div>

              {/* Review — solo pedidos entregados sin review */}
              {order.status === 'delivered' && !order.review && !reviews[order.id] && (
                <div style={{ padding: '12px 20px', background: '#f8fbff', borderTop: '1px solid #eee' }}>
                  {reviewForm === order.id ? (
                    <ReviewForm orderId={order.id} opticaName={order.optica?.businessName} onDone={(rev) => {
                      setReviews(r => ({ ...r, [order.id]: rev }));
                      setReviewForm(null);
                      toast.show('¡Gracias por tu reseña!');
                    }} />
                  ) : (
                    <button onClick={() => setReviewForm(order.id)} style={{ background: '#fff159', color: '#333', border: '1px solid #e0c000', padding: '8px 18px', borderRadius: 4, fontSize: 13, fontWeight: 600 }}>
                      ⭐ Dejar reseña a la óptica
                    </button>
                  )}
                </div>
              )}
              {(order.review || reviews[order.id]) && (
                <div style={{ padding: '10px 20px', background: '#f0fff4', borderTop: '1px solid #c6f6d5', fontSize: 13, color: '#276749' }}>
                  ✓ Ya dejaste una reseña para este pedido · {'★'.repeat((order.review || reviews[order.id])?.rating || 5)}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
