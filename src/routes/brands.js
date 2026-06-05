const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = require('../lib/prisma');

// GET /api/brands — marcas aprobadas (público)
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brandProfile.findMany({
      where: { validationStatus: 'approved' },
      select: {
        id: true, brandName: true, logoUrl: true, description: true, isFeatured: true,
        _count: { select: { products: true } }
      },
      orderBy: [{ isFeatured: 'desc' }, { brandName: 'asc' }]
    });
    res.json(brands);
  } catch {
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
});

// GET /api/brands/:id — perfil público de una marca
router.get('/:id', async (req, res) => {
  try {
    const brand = await prisma.brandProfile.findUnique({
      where: { id: req.params.id },
      include: {
        products: {
          where: { status: 'active' },
          include: { images: { where: { isPrimary: true }, take: 1 } }
        }
      }
    });
    if (!brand || brand.validationStatus !== 'approved') {
      return res.status(404).json({ error: 'Marca no encontrada' });
    }
    const { userId, cuit, ...publicData } = brand;
    res.json(publicData);
  } catch {
    res.status(500).json({ error: 'Error al obtener marca' });
  }
});

// PATCH /api/brands/me — marca edita su perfil
router.patch('/me', authenticate, requireRole('brand'), async (req, res) => {
  try {
    const { description, website } = req.body;
    const brand = await prisma.brandProfile.update({
      where: { userId: req.user.id },
      data: { description, website }
    });
    res.json(brand);
  } catch {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

module.exports = router;
