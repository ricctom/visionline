const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register/consumer
router.post('/register/consumer', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('lastName').notEmpty().withMessage('Apellido requerido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, firstName, lastName, phone } = req.body;
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email ya registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, role: 'consumer', status: 'active',
        consumerProfile: { create: { firstName, lastName, phone } }
      },
      include: { consumerProfile: true }
    });

    res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email, role: user.role, profile: user.consumerProfile } });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/register/optica
router.post('/register/optica', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('businessName').notEmpty().withMessage('Nombre de la óptica requerido'),
  body('cuit').notEmpty().withMessage('CUIT requerido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, businessName, cuit, matricula, address, city, province, phone } = req.body;
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email ya registrado' });

    const cuitExists = await prisma.opticaProfile.findUnique({ where: { cuit } });
    if (cuitExists) return res.status(400).json({ error: 'CUIT ya registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, role: 'optica', status: 'pending',
        opticaProfile: { create: { businessName, cuit, matricula, address, city, province, phone } }
      },
      include: { opticaProfile: true }
    });

    res.status(201).json({
      token: signToken(user),
      user: { id: user.id, email: user.email, role: user.role, profile: user.opticaProfile },
      message: 'Registro exitoso. Tu cuenta está pendiente de validación.'
    });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar óptica' });
  }
});

// POST /api/auth/register/brand
router.post('/register/brand', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('brandName').notEmpty().withMessage('Nombre de la marca requerido'),
  body('cuit').notEmpty().withMessage('CUIT requerido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, brandName, cuit, description, website } = req.body;
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email ya registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, role: 'brand', status: 'pending',
        brandProfile: { create: { brandName, cuit, description, website } }
      },
      include: { brandProfile: true }
    });

    res.status(201).json({
      token: signToken(user),
      user: { id: user.id, email: user.email, role: user.role, profile: user.brandProfile },
      message: 'Registro exitoso. Tu cuenta está pendiente de validación.'
    });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar marca' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { consumerProfile: true, opticaProfile: true, brandProfile: true, distributorProfile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Cuenta suspendida' });
    }

    const profile = user.consumerProfile || user.opticaProfile || user.brandProfile || user.distributorProfile;
    res.json({ token: signToken(user), user: { id: user.id, email: user.email, role: user.role, status: user.status, profile } });
  } catch (e) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { consumerProfile: true, opticaProfile: true, brandProfile: true, distributorProfile: true }
    });
    const profile = user.consumerProfile || user.opticaProfile || user.brandProfile || user.distributorProfile;
    res.json({ id: user.id, email: user.email, role: user.role, status: user.status, profile });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

module.exports = router;
