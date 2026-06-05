import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function MarcaDetalle() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get(`/brands/${id}`).then(r => setBrand(r.data)).catch(() => setBrand(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Cargando...</div>;
  if (!brand) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ fontSize: 60 }}>👓</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Marca no encontrada</h2>
      <Link to="/marcas" style={{ color: '#3483fa' }}>Ver todas las marcas</Link>
    </div>
  );

  const types = ['sol', 'opticos', 'contacto', 'accesorios'];
  const typeLabels = { sol: 'Sol', opticos: 'Ópticos', contacto: 'Contacto', accesorios: 'Accesorios' };
  const filtered = filter ? brand.products?.filter(p => p.frameType === filter) : brand.products;

  // Convertir productos al formato que espera ProductCard
  const products = (filtered || []).map(p => ({
    ...p,
    brand: { id: brand.id, brandName: brand.brandName, logoUrl: brand.logoUrl },
    inventory: []
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '32px 0' }}>
        <div className="container">
          <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            <Link to="/" style={{ color: '#3483fa' }}>Inicio</Link> {' > '}
            <Link to="/marcas" style={{ color: '#3483fa' }}>Marcas</Link> {' > '}
            {brand.brandName}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 90, height: 90, borderRadius: 12, background: '#f8f8f8', border: '2px solid #f0c040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#3483fa', flexShrink: 0 }}>
              {brand.logoUrl
                ? <img src={brand.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }} />
                : brand.brandName.substring(0, 2).toUpperCase()
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800 }}>{brand.brandName}</h1>
                {brand.isFeatured && <span style={{ background: '#fff8dc', color: '#b8860b', border: '1px solid #f0c040', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>⭐ PLATINUM</span>}
                <span style={{ background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>✓ OFICIAL</span>
              </div>
              {brand.description && <p style={{ fontSize: 14, color: '#555', maxWidth: 600, lineHeight: 1.6 }}>{brand.description}</p>}
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#666' }}>
                <span>{brand.products?.length || 0} productos</span>
                {brand.website && <a href={brand.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3483fa' }}>Sitio oficial ↗</a>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        {/* Filtros por categoría */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setFilter('')} style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #ddd', background: !filter ? '#3483fa' : '#fff', color: !filter ? '#fff' : '#666', fontSize: 13, fontWeight: 600 }}>
            Todos ({brand.products?.length || 0})
          </button>
          {types.filter(t => brand.products?.some(p => p.frameType === t)).map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #ddd', background: filter === t ? '#3483fa' : '#fff', color: filter === t ? '#fff' : '#666', fontSize: 13, fontWeight: 600 }}>
              {typeLabels[t]} ({brand.products?.filter(p => p.frameType === t).length})
            </button>
          ))}
        </div>

        {products.length === 0
          ? <div style={{ background: '#fff', borderRadius: 4, padding: 40, textAlign: 'center', color: '#999' }}>Sin productos en esta categoría</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        }
      </div>
    </div>
  );
}
