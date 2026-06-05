import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: '#ccc', marginTop: 40 }}>
      <div className="container" style={{ padding: '40px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginBottom: 32 }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 20, color: '#fff159', marginBottom: 8 }}>
              Vision<span style={{ color: '#fff' }}>line</span>
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              El marketplace de anteojos de Argentina. Comprá con la seguridad de una óptica certificada.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: 12 }}>Compradores</p>
            {[['Catálogo', '/productos'], ['Ópticas', '/opticas'], ['Marcas', '/marcas'], ['Cómo comprar', '/']].map(([l, h]) => (
              <Link key={l} to={h} style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>{l}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: 12 }}>Para ópticas y marcas</p>
            {[['Registrá tu óptica', '/registro?rol=optica'], ['Registrá tu marca', '/registro?rol=brand'], ['Panel de gestión', '/dashboard']].map(([l, h]) => (
              <Link key={l} to={h} style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>{l}</Link>
            ))}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#fff', marginBottom: 12 }}>Categorías</p>
            {[['Anteojos de sol', 'sol'], ['Anteojos ópticos', 'opticos'], ['Lentes de contacto', 'contacto'], ['Accesorios', 'accesorios']].map(([l, t]) => (
              <Link key={t} to={`/productos?frameType=${t}`} style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#666' }}>
          <span>© 2025 Visionline · Todos los derechos reservados</span>
          <span>Hecho en Argentina 🇦🇷</span>
        </div>
      </div>
    </footer>
  );
}
