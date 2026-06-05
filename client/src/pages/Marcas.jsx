import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Marcas() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/brands').then(r => setBrands(r.data || [])).finally(() => setLoading(false));
  }, []);

  const featured = brands.filter(b => b.isFeatured);
  const rest = brands.filter(b => !b.isFeatured);

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Marcas disponibles</h1>
      <p style={{ color: '#666', fontSize: 15, marginBottom: 28 }}>
        Solo marcas oficiales verificadas por Visionline pueden publicar en la plataforma
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Cargando...</div>
      ) : (
        <>
          {featured.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Destacadas</h2>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                Las marcas líderes del rubro óptico argentino
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {featured.map(b => <BrandCard key={b.id} brand={b} featured />)}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Todas las marcas</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {rest.map(b => <BrandCard key={b.id} brand={b} />)}
              </div>
            </section>
          )}

          {brands.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
              Próximamente las primeras marcas del rubro
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BrandCard({ brand, featured }) {
  return (
    <Link to={`/marca/${brand.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: 24,
        border: featured ? '2px solid #f0c040' : '1px solid #e8e8e8',
        display: 'flex', flexDirection: 'column', gap: 12, height: '100%',
        transition: 'box-shadow .2s, transform .2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 8,
            background: '#f8f8f8', border: '1px solid #eee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#3483fa', flexShrink: 0
          }}>
            {brand.logoUrl
              ? <img src={brand.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
              : brand.brandName.substring(0, 2).toUpperCase()
            }
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 17 }}>{brand.brandName}</p>
            <p style={{ fontSize: 13, color: '#888' }}>{brand._count?.products || 0} productos</p>
          </div>
        </div>

        {/* Descripción */}
        {brand.description && (
          <p style={{
            fontSize: 13, color: '#555', lineHeight: 1.5, flexGrow: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {brand.description}
          </p>
        )}

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {featured && (
            <span style={{
              background: '#fff8dc', color: '#b8860b', border: '1px solid #f0c040',
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              ⭐ PLATINUM
            </span>
          )}
          <span style={{
            background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5',
            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20
          }}>
            ✓ OFICIAL
          </span>
        </div>
      </div>
    </Link>
  );
}
