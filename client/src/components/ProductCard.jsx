import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useToast } from './Toast';

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;
  const inv = product.inventory?.[0];
  const minPrice = inv?.price;
  const { addItem } = useCart();
  const toast = useToast();

  function handleAddCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!inv) return;
    addItem(product, inv, 1);
    toast.show(`${product.name} agregado al carrito`);
  }

  return (
    <Link to={`/producto/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="product-card" style={{
        background: '#fff', borderRadius: 4, overflow: 'hidden',
        border: '1px solid #eee', transition: 'box-shadow .2s, transform .15s',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
      >
        {/* Badge */}
        {product.lensType && (
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1, background: '#3483fa', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {product.lensType}
          </div>
        )}

        {/* Imagen */}
        <div style={{ height: 200, background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          {image
            ? <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
            : <span style={{ fontSize: 52, opacity: 0.3 }}>👓</span>
          }
        </div>

        {/* Info */}
        <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 11, color: '#3483fa', fontWeight: 600, marginBottom: 3, letterSpacing: 0.3 }}>{product.brand?.brandName?.toUpperCase()}</p>
          <p style={{ fontSize: 14, lineHeight: 1.35, marginBottom: 8, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>

          {minPrice ? (
            <>
              <p style={{ fontSize: 20, fontWeight: 400, color: '#333', marginBottom: 2 }}>
                ${minPrice.toLocaleString('es-AR')}
              </p>
              <p style={{ fontSize: 11, color: '#00a650', marginBottom: 8 }}>
                6 cuotas de ${Math.round(minPrice / 6).toLocaleString('es-AR')} sin interés
              </p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>Precio a consultar</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, color: inv ? '#00a650' : '#999' }}>
              {inv
                ? `✓ En ${product.inventory?.length} óptica${product.inventory?.length > 1 ? 's' : ''}`
                : 'Sin stock'
              }
            </p>
            {inv && (
              <button onClick={handleAddCart} style={{
                background: 'none', border: '1px solid #3483fa', color: '#3483fa',
                borderRadius: 3, padding: '3px 8px', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3483fa'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#3483fa'; }}
              >
                + Carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
