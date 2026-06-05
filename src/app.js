require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/opticas', require('./routes/opticas'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Visionline API', version: '1.0.0' }));

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // 404 solo para rutas de API en desarrollo
  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Visionline API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Rutas disponibles:`);
  console.log(`   POST /api/auth/register/consumer`);
  console.log(`   POST /api/auth/register/optica`);
  console.log(`   POST /api/auth/register/brand`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/products`);
  console.log(`   GET  /api/opticas`);
  console.log(`   GET  /api/brands`);
  console.log(`   POST /api/orders`);
  console.log(`   GET  /api/admin/pending`);
});

module.exports = app;
