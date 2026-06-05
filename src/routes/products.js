const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

// GET /api/products — catálogo público con filtros
router.get('/', async (req, res) => {
  const { frameType, gender, brandId, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const priceFilter = (minPrice || maxPrice) ? {
    some: {
      status: 'active',
      optica: { validationStatus: 'approved' },
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    }
  } : undefined;

  const where = {
    status: 'active',
    brand: { validationStatus: 'approved' },
    ...(frameType && { frameType }),
    ...(gender && { gender }),
    ...(brandId && { brandId }),
    ...(search && { name: { contains: search } }),
    ...(priceFilter && { inventory: priceFilter }),
  };

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: { select: { id: true, brandName: true, logoUrl: true } },
          images: { where: { isPrimary: true }, take: 1 },
          inventory: {
            where: { status: 'active', optica: { validationStatus: 'approved' } },
            select: { price: true, stockType: true },
            orderBy: { price: 'asc' },
            take: 1,
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/:id — detalle de producto
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        brand: { select: { id: true, brandName: true, logoUrl: true, description: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        inventory: {
          where: { status: 'active', optica: { validationStatus: 'approved' } },
          include: {
            optica: { select: { id: true, businessName: true, city: true, province: true, avgRating: true, totalSales: true } },
            variant: true,
          },
          orderBy: { price: 'asc' },
        }
      }
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/products — crear producto (solo marcas aprobadas)
router.post('/', authenticate, requireRole('brand'), [
  body('name').notEmpty().withMessage('Nombre requerido'),
  body('frameType').isIn(['opticos', 'sol', 'contacto', 'accesorios']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const brand = await prisma.brandProfile.findUnique({ where: { userId: req.user.id } });
    if (!brand || brand.validationStatus !== 'approved') {
      return res.status(403).json({ error: 'Marca no aprobada' });
    }

    const {
      name, sku, description, frameType, gender, material, suggestedPrice,
      lensWidth, lensHeight, bridge, templeLength, totalWidth,
      lensType, uvProtection, lensMaterial, frameShape, frameColor, lensColor,
      isPrescription, status, variants, imageUrl
    } = req.body;

    const product = await prisma.product.create({
      data: {
        brandId: brand.id,
        name, sku, description, frameType, gender, material,
        suggestedPrice: suggestedPrice ? parseFloat(suggestedPrice) : undefined,
        lensWidth: lensWidth ? parseFloat(lensWidth) : undefined,
        lensHeight: lensHeight ? parseFloat(lensHeight) : undefined,
        bridge: bridge ? parseFloat(bridge) : undefined,
        templeLength: templeLength ? parseFloat(templeLength) : undefined,
        totalWidth: totalWidth ? parseFloat(totalWidth) : undefined,
        lensType, uvProtection, lensMaterial, frameShape, frameColor, lensColor,
        isPrescription: isPrescription === true || isPrescription === 'true',
        status: status || 'active',
        variants: variants?.length ? { create: variants } : undefined,
        images: imageUrl ? { create: { url: imageUrl, isPrimary: true, sortOrder: 0 } } : undefined,
      },
      include: { variants: true, images: true }
    });
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PATCH /api/products/:id — editar producto
router.patch('/:id', authenticate, requireRole('brand'), async (req, res) => {
  try {
    const brand = await prisma.brandProfile.findUnique({ where: { userId: req.user.id } });
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (!product || product.brandId !== brand.id) {
      return res.status(403).json({ error: 'No podés editar este producto' });
    }

    const { name, description, frameType, gender, material, suggestedPrice, status } = req.body;
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, frameType, gender, material, suggestedPrice, status }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

module.exports = router;
