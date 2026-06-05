const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = require('../lib/prisma');

// GET /api/opticas — listado público de ópticas aprobadas
router.get('/', async (req, res) => {
  const { city, province, search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    validationStatus: 'approved',
    ...(city && { city: { contains: city } }),
    ...(province && { province: { contains: province } }),
    ...(search && { businessName: { contains: search } }),
  };

  try {
    const [opticas, total] = await Promise.all([
      prisma.opticaProfile.findMany({
        where,
        select: {
          id: true, businessName: true, city: true, province: true,
          logoUrl: true, avgRating: true, totalSales: true, isFeatured: true,
          _count: { select: { inventory: true } }
        },
        skip, take: parseInt(limit),
        orderBy: [{ isFeatured: 'desc' }, { avgRating: 'desc' }]
      }),
      prisma.opticaProfile.count({ where })
    ]);
    res.json({ opticas, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ error: 'Error al obtener ópticas' });
  }
});

// GET /api/opticas/:id — perfil público de una óptica
router.get('/:id', async (req, res) => {
  try {
    const optica = await prisma.opticaProfile.findUnique({
      where: { id: req.params.id },
      include: {
        inventory: {
          where: { status: 'active' },
          include: {
            product: { include: { brand: { select: { brandName: true } }, images: { where: { isPrimary: true }, take: 1 } } },
            variant: true
          }
        },
        reviews: {
          include: { consumer: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!optica || optica.validationStatus !== 'approved') {
      return res.status(404).json({ error: 'Óptica no encontrada' });
    }
    // No exponer datos sensibles
    const { userId, cuit, ...publicData } = optica;
    res.json(publicData);
  } catch {
    res.status(500).json({ error: 'Error al obtener óptica' });
  }
});

// PATCH /api/opticas/me — óptica edita su propio perfil
router.patch('/me', authenticate, requireRole('optica'), async (req, res) => {
  try {
    const { address, city, province, phone, description } = req.body;
    const optica = await prisma.opticaProfile.update({
      where: { userId: req.user.id },
      data: { address, city, province, phone, description }
    });
    res.json(optica);
  } catch {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

module.exports = router;
