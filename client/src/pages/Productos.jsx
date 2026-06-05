import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/Skeleton';

const FRAME_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'opticos', label: 'Ópticos' },
  { value: 'sol', label: 'Sol' },
  { value: 'contacto', label: 'Lentes de contacto' },
  { value: 'accesorios', label: 'Accesorios' },
];

const GENDERS = [
  { value: '', label: 'Todos' },
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'ninos', label: 'Niños' },
];

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const search = searchParams.get('search') || '';
  const frameType = searchParams.get('frameType') || '';
  const gender = searchParams.get('gender') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (frameType) params.set('frameType', frameType);
    if (gender) params.set('gender', gender);
    params.set('page', page);
    params.set('limit', 20);

    api.get(`/products?${params}`).then(r => {
      setProducts(r.data.products || []);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);
    }).finally(() => setLoading(false));
  }, [search, frameType, gender, page, sortBy]);

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
    setPage(1);
  }

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
      {search && (
        <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          {total} resultado{total !== 1 ? 's' : ''} para "<strong>{search}</strong>"
        </p>
      )}

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Filtros izquierda — igual que ML */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: 4, padding: 16, marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>Categoría</h3>
            {FRAME_TYPES.map(f => (
              <div key={f.value} onClick={() => setFilter('frameType', f.value)}
                style={{
                  padding: '6px 0', fontSize: 14, cursor: 'pointer',
                  color: frameType === f.value ? '#3483fa' : '#666',
                  fontWeight: frameType === f.value ? 600 : 400,
                  borderLeft: frameType === f.value ? '3px solid #3483fa' : '3px solid transparent',
                  paddingLeft: 8
                }}
              >
                {f.label}
              </div>
            ))}
          </div>

          {/* Filtro de precio */}
          <div style={{ background: '#fff', borderRadius: 4, padding: 16, marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>Precio</h3>
            {[
              { label: 'Hasta $50.000', min: '', max: '50000' },
              { label: '$50.000 – $80.000', min: '50000', max: '80000' },
              { label: '$80.000 – $100.000', min: '80000', max: '100000' },
              { label: 'Más de $100.000', min: '100000', max: '' },
            ].map(r => {
              const active = searchParams.get('minPrice') === r.min && searchParams.get('maxPrice') === r.max;
              return (
                <div key={r.label} onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  if (active) { next.delete('minPrice'); next.delete('maxPrice'); }
                  else { if (r.min) next.set('minPrice', r.min); else next.delete('minPrice'); if (r.max) next.set('maxPrice', r.max); else next.delete('maxPrice'); }
                  setSearchParams(next); setPage(1);
                }} style={{ padding: '6px 0', fontSize: 14, cursor: 'pointer', color: active ? '#3483fa' : '#666', fontWeight: active ? 600 : 400, borderLeft: active ? '3px solid #3483fa' : '3px solid transparent', paddingLeft: 8 }}>
                  {r.label}
                </div>
              );
            })}
          </div>

          <div style={{ background: '#fff', borderRadius: 4, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#333' }}>Género</h3>
            {GENDERS.map(g => (
              <div key={g.value} onClick={() => setFilter('gender', g.value)}
                style={{
                  padding: '6px 0', fontSize: 14, cursor: 'pointer',
                  color: gender === g.value ? '#3483fa' : '#666',
                  fontWeight: gender === g.value ? 600 : 400,
                  borderLeft: gender === g.value ? '3px solid #3483fa' : '3px solid transparent',
                  paddingLeft: 8
                }}
              >
                {g.label}
              </div>
            ))}
          </div>
        </aside>

        {/* Grilla de productos */}
        <div style={{ flex: 1 }}>
          {/* Barra ordenamiento */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: '#666' }}>{total} resultado{total !== 1 ? 's' : ''}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: '#666' }}>Ordenar por:</span>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, background: '#fff' }}>
                <option value="newest">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonGrid count={8} />
          ) : products.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 4, padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 18, color: '#666' }}>No encontramos productos</p>
              <p style={{ fontSize: 14, color: '#999', marginTop: 8 }}>Intentá con otra búsqueda o categoría</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[...products].sort((a, b) => {
                  const pa = a.inventory?.[0]?.price || a.suggestedPrice || 0;
                  const pb = b.inventory?.[0]?.price || b.suggestedPrice || 0;
                  if (sortBy === 'price_asc') return pa - pb;
                  if (sortBy === 'price_desc') return pb - pa;
                  return 0;
                }).map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Paginación */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)} style={{
                      padding: '8px 14px', borderRadius: 4,
                      background: n === page ? '#3483fa' : '#fff',
                      color: n === page ? '#fff' : '#333',
                      border: '1px solid #ddd', fontSize: 14
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
