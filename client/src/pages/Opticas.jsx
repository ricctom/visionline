import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Opticas() {
  const [opticas, setOpticas] = useState([]);
  const [search, setSearch] = useState('');
  const [provincia, setProvincia] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/opticas?limit=50').then(r => setOpticas(r.data.opticas || [])).finally(() => setLoading(false));
  }, []);

  const provincias = [...new Set(opticas.map(o => o.province).filter(Boolean))].sort();

  const filtered = opticas
    .filter(o =>
      (o.businessName.toLowerCase().includes(search.toLowerCase()) || o.city?.toLowerCase().includes(search.toLowerCase())) &&
      (!provincia || o.province === provincia)
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.avgRating || 0) - (a.avgRating || 0);
      if (sortBy === 'sales') return (b.totalSales || 0) - (a.totalSales || 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Ópticas certificadas</h1>
      <p style={{ color: '#666', fontSize: 15, marginBottom: 20 }}>
        Todas las ópticas de la plataforma son verificadas con matrícula oficial
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o ciudad..."
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14 }}
        />
        <select value={provincia} onChange={e => setProvincia(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, background: '#fff' }}>
          <option value="">Todas las provincias</option>
          {provincias.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, background: '#fff' }}>
          <option value="featured">Destacadas primero</option>
          <option value="rating">Mejor calificación</option>
          <option value="sales">Más ventas</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>No se encontraron ópticas</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map(o => <OpticaCard key={o.id} optica={o} />)}
        </div>
      )}
    </div>
  );
}

function OpticaCard({ optica }) {
  return (
    <Link to={`/optica/${optica.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: 24,
        border: '1px solid #e8e8e8', height: '100%',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'box-shadow .2s, transform .2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
      >
        {/* Logo / Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 8, background: '#f0f4ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0, border: '1px solid #e0e8ff'
          }}>
            {optica.logoUrl ? <img src={optica.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} /> : '🏪'}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{optica.businessName}</p>
            <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{optica.city}{optica.province ? `, ${optica.province}` : ''}</p>
          </div>
        </div>

        {/* Descripción */}
        {optica.description && (
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5, flexGrow: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {optica.description}
          </p>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {optica.avgRating && (
            <span style={{ fontSize: 13, color: '#f90', fontWeight: 600 }}>
              ★ {optica.avgRating.toFixed(1)}
            </span>
          )}
          {optica.totalSales > 0 && (
            <span style={{ fontSize: 13, color: '#666' }}>{optica.totalSales} ventas</span>
          )}
          {optica._count?.inventory > 0 && (
            <span style={{ fontSize: 13, color: '#666' }}>{optica._count.inventory} productos</span>
          )}
        </div>

        {/* Badge */}
        <div style={{ display: 'flex', gap: 8 }}>
          {optica.isFeatured && (
            <span style={{
              background: '#fff8dc', color: '#b8860b', border: '1px solid #f0c040',
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              ⭐ DESTACADA
            </span>
          )}
          <span style={{
            background: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5',
            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            ✓ CERTIFICADA
          </span>
        </div>
      </div>
    </Link>
  );
}
