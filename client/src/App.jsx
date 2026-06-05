import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Producto from './pages/Producto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Opticas from './pages/Opticas';
import OpticaDetalle from './pages/OpticaDetalle';
import Marcas from './pages/Marcas';
import MarcaDetalle from './pages/MarcaDetalle';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import MisCompras from './pages/MisCompras';
import Perfil from './pages/Perfil';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <ToastProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/producto/:id" element={<Producto />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/opticas" element={<Opticas />} />
                <Route path="/optica/:id" element={<OpticaDetalle />} />
                <Route path="/marcas" element={<Marcas />} />
                <Route path="/marca/:id" element={<MarcaDetalle />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/mis-compras" element={<MisCompras />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
