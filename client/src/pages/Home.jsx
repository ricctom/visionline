import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [opticas, setOpticas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8'),
      api.get('/brands'),
      api.get('/opticas?limit=3'),
    ]).then(([p, b, o]) => {
      setProducts(p.data.products || []);
      setBrands(b.data || []);
      setOpticas(o.data.opticas || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero banner */}
      <div style={{ background: '#3483fa', color: '#fff', padding: '32px 0', marginBottom: 24 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
              Anteojos de calidad, de tu óptica de confianza
            </h1>
            <p style={{ fontSize: 17, opacity: 0.9, marginBottom: 20 }}>
              Comprá online con la seguridad de una óptica profesional certificada
            </p>
            <Link to="/productos" style={{
              background: '#fff159', color: '#333', padding: '12px 28px',
              borderRadius: 4, fontWeight: 700, fontSize: 16
            }}>
              Ver catálogo completo
            </Link>
          </div>
          <span style={{ fontSize: 100, opacity: 0.3 }}>👓</span>
        </div>
      </div>

      <div className="container">
        {/* Categorías rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Anteojos ópticos', icon: '🔭', type: 'opticos' },
            { label: 'Anteojos de sol', icon: '🕶️', type: 'sol' },
            { label: 'Lentes de contacto', icon: '👁️', type: 'contacto' },
            { label: 'Accesorios', icon: '🧳', type: 'accesorios' },
          ].map(cat => (
            <Link key={cat.type} to={`/productos?frameType=${cat.type}`}
              style={{
                background: '#fff', borderRadius: 4, padding: '20px 16px',
                textAlign: 'center', transition: 'box-shadow .2s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{cat.label}</div>
            </Link>
          ))}
        </div>

        {/* Marcas */}
        {brands.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Marcas disponibles</h2>
              <Link to="/marcas" style={{ color: '#3483fa', fontSize: 14 }}>Ver todas</Link>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {brands.map(brand => (
                <Link key={brand.id} to={`/marca/${brand.id}`}
                  style={{
                    background: '#fff', borderRadius: 4, padding: '16px 24px',
                    minWidth: 120, textAlign: 'center', flexShrink: 0
                  }}
                >
                  {brand.logoUrl
                    ? <img src={brand.logoUrl} alt={brand.brandName} style={{ height: 40, objectFit: 'contain' }} />
                    : <div style={{ fontSize: 13, fontWeight: 600, color: '#3483fa' }}>{brand.brandName}</div>
                  }
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Productos destacados */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Productos destacados</h2>
            <Link to="/productos" style={{ color: '#3483fa', fontSize: 14 }}>Ver todos</Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Cargando...</div>
          ) : products.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 4, padding: 40, textAlign: 'center', color: '#999' }}>
              <p style={{ fontSize: 18 }}>Próximamente los primeros productos</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>¿Tenés una óptica? <Link to="/registro" style={{ color: '#3483fa' }}>Registrate</Link></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { icon: '🏪', label: 'Ópticas certificadas', value: opticas.length > 0 ? `+${opticas.length}` : '—' },
            { icon: '👓', label: 'Productos disponibles', value: products.length > 0 ? `+${products.length}` : '—' },
            { icon: '✓', label: 'Compra 100% segura', value: 'Garantizado' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 4, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#3483fa' }}>{s.value}</p>
                <p style={{ fontSize: 13, color: '#666' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cómo funciona */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>¿Cómo funciona?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '🔍', step: '1', title: 'Elegí tu anteojo', desc: 'Buscá por marca, categoría o modelo. Filtrá por precio y características técnicas.' },
              { icon: '🏪', step: '2', title: 'Elegí tu óptica', desc: 'Comprá a través de una óptica certificada cerca tuyo, con reputación verificada.' },
              { icon: '📦', step: '3', title: 'Recibí en tu casa', desc: 'La óptica prepara y envía tu pedido. Seguí el estado en tiempo real.' },
            ].map(s => (
              <div key={s.step} style={{ background: '#fff', borderRadius: 4, padding: 24, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#3483fa', color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{s.step}</div>
                <p style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</p>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ópticas destacadas */}
        {opticas.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Ópticas destacadas</h2>
              <Link to="/opticas" style={{ color: '#3483fa', fontSize: 14 }}>Ver todas</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {opticas.map(o => (
                <Link key={o.id} to={`/optica/${o.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: '#fff', borderRadius: 4, padding: 20, display: 'flex', gap: 14, alignItems: 'center', border: '1px solid #eee', transition: 'box-shadow .2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏪</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{o.businessName}</p>
                      <p style={{ fontSize: 12, color: '#888' }}>{o.city}</p>
                      {o.avgRating && <p style={{ fontSize: 12, color: '#f90' }}>★ {o.avgRating.toFixed(1)}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Banner ópticas */}
        <div style={{
          background: '#fff', borderRadius: 4, padding: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 32
        }}>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>¿Tenés una óptica?</h3>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
              Digitalizate en minutos y empezá a vender online con tu marca de confianza
            </p>
            <Link to="/registro?rol=optica" style={{
              background: '#3483fa', color: '#fff', padding: '10px 20px',
              borderRadius: 4, fontSize: 14, fontWeight: 600
            }}>
              Registrá tu óptica
            </Link>
          </div>
          <span style={{ fontSize: 64 }}>🏪</span>
        </div>
      </div>
    </div>
  );
}
