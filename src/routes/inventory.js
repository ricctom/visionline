const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const prisma = require('../lib/prisma');

// GET /api/inventory — inventario de la óptica logueada
router.get('/', authenticate, requireRole('optica'), async (req, res) => {
  try {
    const optica = await prisma.opticaProfile.findUnique({ where: { userId: req.user.id } });
    const inventory = await prisma.opticaInventory.findMany({
      where: { opticaId: optica.id },
      include: {
        product: { include: { brand: { select: { brandName: true } }, images: { where: { isPrimary: true }, take: 1 } } },
        variant: true,
      }
    });
    res.json(inventory);
  } catch {
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// POST /api/inventory — agregar producto al inventario
router.post('/', authenticate, requireRole('optica'), async (req, res) => {
  try {
    const optica = await prisma.opticaProfile.findUnique({ where: { userId: req.user.id } });
    if (optica.validationStatus !== 'approved') {
      return res.status(403).json({ error: 'Tu óptica aún no fue aprobada' });
    }

    const { productId, variantId, stockType, quantity, price, distributorId } = req.body;

    // Verificar que el producto pertenece a una marca aprobada
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true }
    });
    if (!product || product.brand.validationStatus !== 'approved' || product.status !== 'active') {
      return res.status(400).json({ error: 'Producto no disponible' });
    }

    if (stockType === 'dropshipping' && !distributorId) {
      return res.status(400).json({ error: 'Dropshipping requiere una distribuidora' });
    }

    const item = await prisma.opticaInventory.create({
      data: { opticaId: optica.id, productId, variantId, stockType: stockType || 'own', quantity: quantity || 0, price, distributorId }
    });
    res.status(201).json(item);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Ya tenés ese producto en tu inventario' });
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// PATCH /api/inventory/:id — actualizar precio o stock
router.patch('/:id', authenticate, requireRole('optica'), async (req, res) => {
  try {
    const optica = await prisma.opticaProfile.findUnique({ where: { userId: req.user.id } });
    const item = await prisma.opticaInventory.findUnique({ where: { id: req.params.id } });

    if (!item || item.opticaId !== optica.id) {
      return res.status(403).json({ error: 'No podés editar este ítem' });
    }

    const { price, quantity, status } = req.body;
    const updated = await prisma.opticaInventory.update({
      where: { id: req.params.id },
      data: { price, quantity, status }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Error al actualizar inventario' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', authenticate, requireRole('optica'), async (req, res) => {
  try {
    const optica = await prisma.opticaProfile.findUnique({ where: { userId: req.user.id } });
    const item = await prisma.opticaInventory.findUnique({ where: { id: req.params.id } });

    if (!item || item.opticaId !== optica.id) {
      return res.status(403).json({ error: 'No podés eliminar este ítem' });
    }

    await prisma.opticaInventory.update({ where: { id: req.params.id }, data: { status: 'deleted' } });
    res.json({ message: 'Producto eliminado del inventario' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
