import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timer.current);
    if (val.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await api.get(`/products?search=${encodeURIComponent(val)}&limit=6`);
        setSuggestions(r.data.products || []);
        setOpen(true);
      } catch { }
      setLoading(false);
    }, 300);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/productos?search=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  function pick(product) {
    navigate(`/producto/${product.id}`);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative', maxWidth: 600 }}>
      <form onSubmit={handleSearch} style={{ display: 'flex' }}>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Buscar anteojos, marcas, ópticas..."
          style={{
            width: '100%', padding: '10px 16px', border: '1px solid #ccc',
            borderRadius: '4px 0 0 4px', fontSize: 15, outline: 'none',
            borderRight: 'none', borderColor: open ? '#3483fa' : '#ccc',
          }}
        />
        <button type="submit" style={{
          background: '#3483fa', color: '#fff', padding: '0 20px',
          borderRadius: '0 4px 4px 0', fontSize: 16, fontWeight: 600, flexShrink: 0
        }}>
          🔍
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 40,
          background: '#fff', border: '1px solid #ddd', borderRadius: '0 0 4px 4px',
          boxShadow: '0 4px 12px rgba(0,0,0,.1)', zIndex: 200, overflow: 'hidden'
        }}>
          {suggestions.map(p => (
            <div key={p.id} onClick={() => pick(p)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <div style={{ width: 36, height: 36, background: '#f0f0f0', borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {p.images?.[0]?.url
                  ? <img src={p.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: 18 }}>👓</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                <p style={{ fontSize: 12, color: '#888' }}>{p.brand?.brandName} · {p.frameType}</p>
              </div>
              {p.inventory?.[0]?.price && (
                <p style={{ fontSize: 14, fontWeight: 700, flexShrink: 0 }}>${p.inventory[0].price.toLocaleString('es-AR')}</p>
              )}
            </div>
          ))}
          <div onClick={handleSearch} style={{ padding: '10px 14px', fontSize: 13, color: '#3483fa', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Ver todos los resultados para "{query}" →
          </div>
        </div>
      )}
    </div>
  );
}
