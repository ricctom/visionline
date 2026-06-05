import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function OpticaDetalle() {
  const { id } = useParams();
  const [optica, setOptica] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/opticas/${id}`).then(r => setOptica(r.data)).catch(() => setOptica(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Cargando...</div>;
  if (!optica) return <NotFound />;

  const products = optica.inventory?.map(inv => ({
    ...inv.product,
    inventory: [{ price: inv.price, stockType: inv.stockType, quantity: inv.quantity }]
  })) || [];

  return (
    <div>
      {/* Header de la óptica */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '24px 0' }}>
        <div className="container">
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            <Link to="/" style={{ color: '#3483fa' }}>Inicio</Link> {' > '}
            <Link to="/opticas" style={{ color: '#3483fa' }}>Ópticas</Link> {' > '}
            {optica.businessName}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f0f4ff', border: '1px solid #e0e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              {optica.logoUrl ? <img src={optica.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} /> : '🏪'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>{optica.businessName}</h1>
                {optica.isFeatured && <span style={{ background: '#fff8dc', color: '#b8860b', border: '1px solid #f0c040', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>⭐ DESTACADA</span>}
                <span style={{ background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>✓ CERTIFICADA</span>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#666', marginBottom: 8 }}>
                {optica.city && <span>📍 {optica.city}{optica.province ? `, ${optica.province}` : ''}</span>}
                {optica.phone && <span>📞 {optica.phone}</span>}
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
                {optica.avgRating && <span style={{ color: '#f90', fontWeight: 600 }}>★ {optica.avgRating.toFixed(1)} <span style={{ color: '#666', fontWeight: 400 }}>reputación</span></span>}
                {optica.totalSales > 0 && <span style={{ color: '#666' }}>{optica.totalSales} ventas realizadas</span>}
                <span style={{ color: '#666' }}>{products.length} productos</span>
              </div>
            </div>
          </div>
          {optica.description && (
            <p style={{ fontSize: 14, color: '#555', marginTop: 16, lineHeight: 1.6, maxWidth: 700 }}>{optica.description}</p>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        {/* Reseñas */}
        {optica.reviews?.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Opiniones de compradores</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {optica.reviews.slice(0, 3).map(r => (
                <div key={r.id} style={{ background: '#fff', borderRadius: 4, padding: 16, border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#f90' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>{new Date(r.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{r.comment || 'Sin comentario'}</p>
                  <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>{r.consumer?.firstName} {r.consumer?.lastName?.charAt(0)}.</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Productos */}
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Productos disponibles ({products.length})</h2>
        {products.length === 0
          ? <div style={{ background: '#fff', borderRadius: 4, padding: 40, textAlign: 'center', color: '#999' }}>Esta óptica aún no cargó productos</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        }
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ fontSize: 60 }}>🏪</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Óptica no encontrada</h2>
      <Link to="/opticas" style={{ color: '#3483fa' }}>Ver todas las ópticas</Link>
    </div>
  );
}
