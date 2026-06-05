import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../CartContext';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/Toast';
import ProductCard from '../components/ProductCard';

export default function Producto() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptica, setSelectedOptica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data);
      if (r.data.inventory?.length > 0) setSelectedOptica(r.data.inventory[0]);
      // Cargar relacionados de la misma categoría
      api.get(`/products?frameType=${r.data.frameType}&limit=4`).then(rel => {
        setRelated((rel.data.products || []).filter(p => p.id !== id));
      });
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Cargando...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 60 }}>Producto no encontrado</div>;

  const minPrice = product.inventory?.[0]?.price;
  const hasStock = product.inventory?.some(i => i.stockType === 'dropshipping' || i.quantity > 0);

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        <Link to="/" style={{ color: '#3483fa' }}>Inicio</Link>
        {' > '}
        <Link to="/productos" style={{ color: '#3483fa' }}>Productos</Link>
        {' > '}
        <Link to={`/productos?frameType=${product.frameType}`} style={{ color: '#3483fa' }}>
          {product.frameType.charAt(0).toUpperCase() + product.frameType.slice(1)}
        </Link>
        {' > '}
        {product.name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Columna izquierda — Imágenes */}
        <div>
          <div style={{ background: '#fff', borderRadius: 4, padding: 24, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            {product.images?.[selectedImage]?.url
              ? <img src={product.images[selectedImage].url} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 80 }}>{product.frameType === 'contacto' ? '👁️' : '👓'}</span>
            }
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setSelectedImage(i)} style={{
                  width: 64, height: 64, background: '#fff', borderRadius: 4, border: i === selectedImage ? '2px solid #3483fa' : '2px solid #eee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden'
                }}>
                  <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha — Info */}
        <div>
          <p style={{ fontSize: 13, color: '#3483fa', marginBottom: 4 }}>
            <Link to={`/marca/${product.brand?.id}`} style={{ color: '#3483fa' }}>{product.brand?.brandName}</Link>
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 400, marginBottom: 12, lineHeight: 1.3 }}>{product.name}</h1>

          {/* Rating placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ color: '#f90', fontSize: 14 }}>★★★★★</span>
            <span style={{ fontSize: 13, color: '#3483fa' }}>Ver reseñas</span>
          </div>

          {/* Precio */}
          {minPrice ? (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 32, fontWeight: 300, color: '#333' }}>
                ${minPrice.toLocaleString('es-AR')}
              </p>
              <p style={{ fontSize: 13, color: '#00a650' }}>
                en 6 cuotas de ${Math.round(minPrice / 6).toLocaleString('es-AR')} sin interés
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 18, color: '#999', marginBottom: 16 }}>Precio a consultar</p>
          )}

          {/* Stock */}
          <p style={{ fontSize: 14, color: hasStock ? '#00a650' : '#c00', marginBottom: 20, fontWeight: 600 }}>
            {hasStock ? '✓ Disponible' : '✗ Sin stock'}
          </p>

          {/* Variantes */}
          {product.variants?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Color / Variante:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.variants.map(v => (
                  <div key={v.id} style={{
                    padding: '6px 12px', border: '1px solid #ddd', borderRadius: 4,
                    fontSize: 13, cursor: 'pointer', background: '#fff'
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3483fa'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#ddd'}
                  >
                    {v.color}{v.size && v.size !== 'Único' ? ` — ${v.size}` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ópticas que lo venden */}
          {product.inventory?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Disponible en {product.inventory.length} óptica{product.inventory.length > 1 ? 's' : ''}:
              </p>
              {product.inventory.map(inv => (
                <div key={inv.id}
                  onClick={() => setSelectedOptica(inv)}
                  style={{
                    padding: '10px 14px', border: `2px solid ${selectedOptica?.id === inv.id ? '#3483fa' : '#eee'}`,
                    borderRadius: 4, marginBottom: 8, cursor: 'pointer', background: '#fff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{inv.optica?.businessName}</p>
                    <p style={{ fontSize: 12, color: '#666' }}>
                      {inv.optica?.city}, {inv.optica?.province}
                      {inv.optica?.avgRating && ` · ⭐ ${inv.optica.avgRating.toFixed(1)}`}
                    </p>
                    <p style={{ fontSize: 12, color: '#00a650' }}>
                      {inv.stockType === 'dropshipping' ? '📦 Envío desde depósito' : `Stock: ${inv.quantity} unid.`}
                    </p>
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>${inv.price.toLocaleString('es-AR')}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              if (!selectedOptica) return;
              addItem(product, { ...selectedOptica, opticaId: selectedOptica.optica?.id }, 1);
              navigate('/carrito');
            }}
            disabled={!selectedOptica}
            style={{ width: '100%', padding: '14px', background: '#3483fa', color: '#fff', borderRadius: 4, fontSize: 16, fontWeight: 600, marginBottom: 10, opacity: !selectedOptica ? 0.5 : 1 }}
          >
            Comprar ahora
          </button>
          <button
            onClick={() => {
              if (!selectedOptica) return;
              addItem(product, { ...selectedOptica, opticaId: selectedOptica.optica?.id }, 1);
              setAdded(true);
              toast.show(`${product.name} agregado al carrito`);
              setTimeout(() => setAdded(false), 2000);
            }}
            disabled={!selectedOptica}
            style={{ width: '100%', padding: '14px', background: added ? '#00a650' : '#fff', color: added ? '#fff' : '#3483fa', borderRadius: 4, fontSize: 16, fontWeight: 600, border: '1px solid #3483fa', transition: 'all .2s', opacity: !selectedOptica ? 0.5 : 1 }}
          >
            {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
          </button>

          {product.isPrescription && (
            <div style={{ background: '#f0f7ff', borderRadius: 4, padding: '10px 14px', marginTop: 12, fontSize: 13, color: '#555' }}>
              💊 Este producto requiere <strong>receta médica</strong>. La óptica te solicitará tu graduación al confirmar el pedido.
            </div>
          )}
        </div>
      </div>

      {/* Descripción y especificaciones técnicas */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 28 }}>
        <div>
          <div style={{ background: '#fff', borderRadius: 4, padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Descripción</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555' }}>{product.description}</p>
          </div>

          {/* Especificaciones técnicas */}
          <div style={{ background: '#fff', borderRadius: 4, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Especificaciones técnicas</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <tbody>
                {[
                  { label: 'Categoría', value: product.frameType },
                  { label: 'Género', value: product.gender },
                  { label: 'Forma del armazón', value: product.frameShape },
                  { label: 'Material del armazón', value: product.material },
                  { label: 'Color del armazón', value: product.frameColor },
                  { label: 'Tipo de cristal', value: product.lensType },
                  { label: 'Material del cristal', value: product.lensMaterial },
                  { label: 'Color del cristal', value: product.lensColor },
                  { label: 'Protección UV', value: product.uvProtection },
                  product.lensWidth && { label: 'Ancho del cristal', value: `${product.lensWidth} mm` },
                  product.lensHeight && { label: 'Alto del cristal', value: `${product.lensHeight} mm` },
                  product.bridge && { label: 'Puente nasal', value: `${product.bridge} mm` },
                  product.templeLength && { label: 'Largo de patillas', value: `${product.templeLength} mm` },
                  product.totalWidth && { label: 'Ancho total del marco', value: `${product.totalWidth} mm` },
                  { label: 'Apto para receta', value: product.isPrescription ? 'Sí' : 'No' },
                ].filter(Boolean).filter(r => r.value).map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '10px 14px', color: '#666', width: '45%', fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: '10px 14px', color: '#333', textTransform: 'capitalize' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guía de medidas */}
        {(product.lensWidth || product.totalWidth) && (
          <div>
            <div style={{ background: '#fff', borderRadius: 4, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Guía de medidas</h3>
              <div style={{ background: '#f5f5f5', borderRadius: 4, padding: 16, textAlign: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 40 }}>👓</span>
                <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>Diagrama orientativo</p>
              </div>
              {[
                { key: 'lensWidth', label: 'A — Ancho cristal', unit: 'mm' },
                { key: 'lensHeight', label: 'B — Alto cristal', unit: 'mm' },
                { key: 'bridge', label: 'C — Puente nasal', unit: 'mm' },
                { key: 'templeLength', label: 'D — Patillas', unit: 'mm' },
                { key: 'totalWidth', label: 'Total — Ancho marco', unit: 'mm' },
              ].filter(m => product[m.key]).map(m => (
                <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                  <span style={{ color: '#666' }}>{m.label}</span>
                  <strong>{product[m.key]} {m.unit}</strong>
                </div>
              ))}
              <p style={{ fontSize: 11, color: '#999', marginTop: 12, lineHeight: 1.5 }}>
                ¿No sabés tu medida? Llevá tus anteojos actuales a cualquier óptica de la plataforma y te ayudan a encontrar el talle ideal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Productos relacionados */}
      {related.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Productos similares</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {related.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
