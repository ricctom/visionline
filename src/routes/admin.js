const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = require('../lib/prisma');

router.use(authenticate, requireRole('admin'));

// GET /api/admin/pending — ópticas y marcas pendientes de validación
router.get('/pending', async (req, res) => {
  const [opticas, brands] = await Promise.all([
    prisma.opticaProfile.findMany({ where: { validationStatus: 'pending' }, include: { user: { select: { email: true } } } }),
    prisma.brandProfile.findMany({ where: { validationStatus: 'pending' }, include: { user: { select: { email: true } } } }),
  ]);
  res.json({ opticas, brands });
});

// PATCH /api/admin/optica/:id/validate
router.patch('/optica/:id/validate', async (req, res) => {
  const { status } = req.body; // approved | rejected
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  try {
    const optica = await prisma.opticaProfile.update({
      where: { id: req.params.id },
      data: { validationStatus: status, validatedAt: new Date() }
    });
    if (status === 'approved') {
      await prisma.user.update({ where: { id: optica.userId }, data: { status: 'active' } });
    }
    res.json(optica);
  } catch {
    res.status(404).json({ error: 'Óptica no encontrada' });
  }
});

// PATCH /api/admin/brand/:id/validate
router.patch('/brand/:id/validate', async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  try {
    const brand = await prisma.brandProfile.update({
      where: { id: req.params.id },
      data: { validationStatus: status, validatedAt: new Date() }
    });
    if (status === 'approved') {
      await prisma.user.update({ where: { id: brand.userId }, data: { status: 'active' } });
    }
    res.json(brand);
  } catch {
    res.status(404).json({ error: 'Marca no encontrada' });
  }
});

// PATCH /api/admin/user/:id/suspend
router.patch('/user/:id/suspend', async (req, res) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { status: 'suspended' } });
    res.json({ message: 'Usuario suspendido', userId: user.id });
  } catch {
    res.status(404).json({ error: 'Usuario no encontrado' });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [totalUsers, totalOpticas, totalBrands, totalOrders, pendingValidations] = await Promise.all([
    prisma.user.count(),
    prisma.opticaProfile.count({ where: { validationStatus: 'approved' } }),
    prisma.brandProfile.count({ where: { validationStatus: 'approved' } }),
    prisma.order.count(),
    prisma.opticaProfile.count({ where: { validationStatus: 'pending' } }),
  ]);
  res.json({ totalUsers, totalOpticas, totalBrands, totalOrders, pendingValidations });
});

module.exports = router;
