const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const PLATFORM_FEE = parseFloat(process.env.PLATFORM_FEE_PERCENT || '0.05');

// POST /api/orders — crear pedido (consumidor)
router.post('/', authenticate, requireRole('consumer'), [
  body('items').isArray({ min: 1 }).withMessage('El pedido debe tener al menos un producto'),
  body('shippingAddress').notEmpty(),
  body('shippingCity').notEmpty(),
  body('shippingProvince').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { items, shippingAddress, shippingCity, shippingProvince } = req.body;

  try {
    const consumer = await prisma.consumerProfile.findUnique({ where: { userId: req.user.id } });

    // Verificar todos los items y que sean de la misma óptica
    const inventoryItems = await Promise.all(
      items.map(item => prisma.opticaInventory.findUnique({
        where: { id: item.inventoryId },
        include: { optica: true }
      }))
    );

    const invalid = inventoryItems.find(i => !i || i.status !== 'active');
    if (invalid) return res.status(400).json({ error: 'Uno o más productos no están disponibles' });

    const opticaIds = [...new Set(inventoryItems.map(i => i.opticaId))];
    if (opticaIds.length > 1) {
      return res.status(400).json({ error: 'Solo podés comprar a una óptica por pedido' });
    }

    // Verificar stock (solo para own)
    for (let i = 0; i < items.length; i++) {
      const inv = inventoryItems[i];
      if (inv.stockType === 'own' && inv.quantity < items[i].quantity) {
        return res.status(400).json({ error: `Stock insuficiente para uno de los productos` });
      }
    }

    const opticaId = opticaIds[0];
    const subtotal = inventoryItems.reduce((sum, inv, idx) => sum + inv.price * items[idx].quantity, 0);
    const platformFee = parseFloat((subtotal * PLATFORM_FEE).toFixed(2));
    const total = parseFloat((subtotal + platformFee).toFixed(2));

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          consumerId: consumer.id,
          opticaId,
          subtotal,
          platformFee,
          total,
          shippingAddress,
          shippingCity,
          shippingProvince,
          items: {
            create: items.map((item, idx) => ({
              inventoryId: item.inventoryId,
              quantity: item.quantity,
              unitPrice: inventoryItems[idx].price,
              stockType: inventoryItems[idx].stockType,
              distributorId: inventoryItems[idx].distributorId,
            }))
          }
        },
        include: { items: true }
      });

      // Descontar stock de items propios
      for (let i = 0; i < items.length; i++) {
        if (inventoryItems[i].stockType === 'own') {
          await tx.opticaInventory.update({
            where: { id: items[i].inventoryId },
            data: { quantity: { decrement: items[i].quantity } }
          });
        }
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// GET /api/orders — pedidos del usuario logueado
router.get('/', authenticate, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'consumer') {
      const consumer = await prisma.consumerProfile.findUnique({ where: { userId: req.user.id } });
      orders = await prisma.order.findMany({
        where: { consumerId: consumer.id },
        include: { items: { include: { inventory: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } }, optica: { select: { businessName: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else if (req.user.role === 'optica') {
      const optica = await prisma.opticaProfile.findUnique({ where: { userId: req.user.id } });
      orders = await prisma.order.findMany({
        where: { opticaId: optica.id },
        include: { items: { include: { inventory: { include: { product: true } } } }, consumer: { select: { firstName: true, lastName: true, phone: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return res.status(403).json({ error: 'Rol no válido' });
    }
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { inventory: { include: { product: { include: { images: true } }, variant: true } } } },
        consumer: { select: { firstName: true, lastName: true, phone: true } },
        optica: { select: { businessName: true, phone: true, address: true } },
        review: true
      }
    });
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
});

// PATCH /api/orders/:id/status — óptica actualiza estado
router.patch('/:id/status', authenticate, requireRole('optica'), async (req, res) => {
  const { status, trackingNumber } = req.body;
  const validTransitions = {
    paid: ['processing'],
    processing: ['shipped'],
    shipped: ['delivered'],
  };

  try {
    const optica = await prisma.opticaProfile.findUnique({ where: { userId: req.user.id } });
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order || order.opticaId !== optica.id) {
      return res.status(403).json({ error: 'No podés actualizar este pedido' });
    }

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({ error: `No podés pasar de ${order.status} a ${status}` });
    }

    const data = { status };
    if (status === 'shipped') { data.shippedAt = new Date(); if (trackingNumber) data.trackingNumber = trackingNumber; }
    if (status === 'delivered') { data.deliveredAt = new Date(); }

    const updated = await prisma.order.update({ where: { id: req.params.id }, data });

    if (status === 'delivered') {
      await prisma.opticaProfile.update({
        where: { id: optica.id },
        data: { totalSales: { increment: 1 } }
      });
    }

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

// POST /api/orders/:id/review — consumidor deja reseña
router.post('/:id/review', authenticate, requireRole('consumer'), [
  body('rating').isInt({ min: 1, max: 5 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const consumer = await prisma.consumerProfile.findUnique({ where: { userId: req.user.id } });
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { review: true } });

    if (!order || order.consumerId !== consumer.id) {
      return res.status(403).json({ error: 'No podés reseñar este pedido' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Solo podés reseñar pedidos entregados' });
    }
    if (order.review) {
      return res.status(400).json({ error: 'Ya dejaste una reseña para este pedido' });
    }

    const { rating, comment } = req.body;
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: { orderId: order.id, consumerId: consumer.id, opticaId: order.opticaId, rating, comment }
      });

      // Recalcular promedio de la óptica
      const agg = await tx.review.aggregate({ where: { opticaId: order.opticaId }, _avg: { rating: true } });
      await tx.opticaProfile.update({
        where: { id: order.opticaId },
        data: { avgRating: agg._avg.rating }
      });

      return newReview;
    });

    res.status(201).json(review);
  } catch {
    res.status(500).json({ error: 'Error al crear reseña' });
  }
});

module.exports = router;
