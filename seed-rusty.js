require('dotenv').config();
const prisma = require('./src/lib/prisma');
const bcrypt = require('bcryptjs');

const RUSTY_PRODUCTS = [
  // ── SOL ──────────────────────────────────────────────────────
  {
    name: 'Rusty Zaedit',
    sku: 'RST-ZAEDIT',
    frameType: 'sol',
    gender: 'unisex',
    description: 'Anteojos de sol polarizados con armazón rectangular de Grilamid. Diseño moderno y deportivo con protección UV400. Incluye estuche rígido y paño limpiador oficial Rusty.',
    suggestedPrice: 89990,
    frameShape: 'rectangular',
    material: 'Grilamid (TR90)',
    lensType: 'polarizado',
    uvProtection: 'UV400',
    lensMaterial: 'policarbonato',
    lensWidth: 52, lensHeight: 50, bridge: 17, templeLength: 136, totalWidth: 143,
    frameColor: 'Negro mate',
    lensColor: 'Negro polarizado',
    isPrescription: false,
    variants: [
      { color: 'Negro mate / Negro polarizado', size: 'Único' },
      { color: 'Negro brillo / Verde oscuro degradé polarizado', size: 'Único' },
      { color: 'Azul grisáceo traslúcido / Negro polarizado', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Blozon',
    sku: 'RST-BLOZON',
    frameType: 'sol',
    gender: 'unisex',
    description: 'Clásico rectangular unisex con armazón de Grilamid ultraliviano. Cristales polarizados de policarbonato con máxima protección UV400. Ideal para uso diario y actividades al aire libre.',
    suggestedPrice: 84990,
    frameShape: 'rectangular',
    material: 'Grilamid (TR90)',
    lensType: 'polarizado',
    uvProtection: 'UV400',
    lensMaterial: 'policarbonato',
    lensWidth: 48, lensHeight: 48, bridge: 18, templeLength: 137, totalWidth: 142,
    frameColor: 'Havana',
    lensColor: 'Marrón degradé polarizado',
    isPrescription: false,
    variants: [
      { color: 'Havana / Marrón degradé polarizado', size: 'Único' },
      { color: 'Negro / Gris polarizado', size: 'Único' },
      { color: 'Carey / Verde polarizado', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Patient',
    sku: 'RST-PATIENT',
    frameType: 'sol',
    gender: 'unisex',
    description: 'Diseño cuadrado moderno con armazón transparente y cristales polarizados. Estructura liviana de acetato de alta calidad con bisagras de resorte para mayor comodidad.',
    suggestedPrice: 94990,
    frameShape: 'cuadrado',
    material: 'Acetato',
    lensType: 'polarizado',
    uvProtection: 'UV400',
    lensMaterial: 'policarbonato',
    lensWidth: 49, lensHeight: 46, bridge: 21, templeLength: 145, totalWidth: 141,
    frameColor: 'Transparente',
    lensColor: 'Gris polarizado',
    isPrescription: false,
    variants: [
      { color: 'Transparente / Gris polarizado', size: 'Único' },
      { color: 'Transparente ahumado / Marrón polarizado', size: 'Único' },
      { color: 'Negro / Negro polarizado', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Terdey',
    sku: 'RST-TERDEY',
    frameType: 'sol',
    gender: 'unisex',
    description: 'Armazón cuadrado fabricado con G-Flex, material revolucionario reconocido por su durabilidad, flexibilidad y ligereza extrema. Con lentes polarizados de alto rendimiento óptico.',
    suggestedPrice: 99990,
    frameShape: 'cuadrado',
    material: 'G-Flex',
    lensType: 'polarizado',
    uvProtection: 'UV400',
    lensMaterial: 'policarbonato',
    lensWidth: 54, lensHeight: 50, bridge: 16, templeLength: 140, totalWidth: 148,
    frameColor: 'Negro mate / Negro',
    lensColor: 'Smoke polarizado',
    isPrescription: false,
    variants: [
      { color: 'Negro mate / Smoke polarizado', size: 'Único' },
      { color: 'Carey / Marrón polarizado', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Xold',
    sku: 'RST-XOLD',
    frameType: 'sol',
    gender: 'unisex',
    description: 'Diseño redondo atemporal con antirreflejo y protección UV400. Marco metálico ultradelgado con bisagras de resorte. Perfectos para un look retro-moderno.',
    suggestedPrice: 87990,
    frameShape: 'redondo',
    material: 'Metal (aleación de zinc)',
    lensType: 'antirreflejo',
    uvProtection: 'UV400',
    lensMaterial: 'policarbonato',
    lensWidth: 50, lensHeight: 50, bridge: 20, templeLength: 140, totalWidth: 138,
    frameColor: 'Dorado',
    lensColor: 'Marrón degradé',
    isPrescription: false,
    variants: [
      { color: 'Dorado / Marrón degradé', size: 'Único' },
      { color: 'Plateado / Azul espejado', size: 'Único' },
      { color: 'Negro / Verde espejado', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Pro Sun Polarized',
    sku: 'RST-PROSUN',
    frameType: 'sol',
    gender: 'unisex',
    description: 'Línea deportiva-premium de Rusty con máxima cobertura lateral. Armazón envolvente de Grilamid con goma antideslizante en patillas y nariz. Ideal para deporte y actividades extremas.',
    suggestedPrice: 112990,
    frameShape: 'deportivo',
    material: 'Grilamid con goma antideslizante',
    lensType: 'polarizado',
    uvProtection: 'UV400',
    lensMaterial: 'policarbonato',
    lensWidth: 62, lensHeight: 38, bridge: 14, templeLength: 130, totalWidth: 155,
    frameColor: 'Negro mate',
    lensColor: 'Gris espejado polarizado',
    isPrescription: false,
    variants: [
      { color: 'Negro / Gris espejado polarizado', size: 'Único' },
      { color: 'Negro / Rojo espejado polarizado', size: 'Único' },
      { color: 'Blanco / Azul espejado polarizado', size: 'Único' },
    ]
  },

  // ── ÓPTICOS / RECETA ────────────────────────────────────────
  {
    name: 'Rusty Genus',
    sku: 'RST-GENUS',
    frameType: 'opticos',
    gender: 'unisex',
    description: 'Marco óptico de acetato premium apto para lentes de receta. Diseño oversized cuadrado con amplio espacio para montaje de cristales graduados. Compatible con lentes monofocales, bifocales y progresivos.',
    suggestedPrice: 74990,
    frameShape: 'cuadrado',
    material: 'Acetato italiano',
    lensType: 'clásico',
    uvProtection: 'UV400',
    lensMaterial: 'según prescripción',
    lensWidth: 55, lensHeight: 67, bridge: 20, templeLength: 140, totalWidth: 160,
    frameColor: 'Negro',
    lensColor: 'Sin cristal (armación)',
    isPrescription: true,
    variants: [
      { color: 'Negro', size: 'Único' },
      { color: 'Havana', size: 'Único' },
      { color: 'Azul traslúcido', size: 'Único' },
      { color: 'Carey bordeaux', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Deckard Optical',
    sku: 'RST-DECKARD-OP',
    frameType: 'opticos',
    gender: 'hombre',
    description: 'Marco óptico rectangular de metal con detalle en las bisagras. Líneas minimalistas para un look profesional y urbano. Apto para receta con cristales de hasta -6.00 dioptrías.',
    suggestedPrice: 68990,
    frameShape: 'rectangular',
    material: 'Aleación de titanio y metal',
    lensType: 'clásico',
    uvProtection: 'UV400',
    lensMaterial: 'según prescripción',
    lensWidth: 52, lensHeight: 18, bridge: 18, templeLength: 140, totalWidth: 138,
    frameColor: 'Gunmetal',
    lensColor: 'Sin cristal (armación)',
    isPrescription: true,
    variants: [
      { color: 'Gunmetal', size: 'Único' },
      { color: 'Dorado rose', size: 'Único' },
      { color: 'Plateado', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Halley Optical',
    sku: 'RST-HALLEY-OP',
    frameType: 'opticos',
    gender: 'mujer',
    description: 'Marco cat-eye femenino de acetato con degradé. Diseño elegante y sofisticado con bisagras de resorte para mayor durabilidad. Compatible con receta completa incluyendo progresivos.',
    suggestedPrice: 71990,
    frameShape: 'mariposa',
    material: 'Acetato italiano',
    lensType: 'clásico',
    uvProtection: 'UV400',
    lensMaterial: 'según prescripción',
    lensWidth: 54, lensHeight: 46, bridge: 16, templeLength: 140, totalWidth: 144,
    frameColor: 'Rosa degradé',
    lensColor: 'Sin cristal (armación)',
    isPrescription: true,
    variants: [
      { color: 'Rosa degradé', size: 'Único' },
      { color: 'Carey degradé', size: 'Único' },
      { color: 'Transparente / Dorado', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Junior Kids',
    sku: 'RST-JUNIOR',
    frameType: 'opticos',
    gender: 'ninos',
    description: 'Marco infantil flexible de Grilamid, resistente a golpes y caídas. Diseñado para niños de 6 a 12 años. Patillas con gancho para mayor sujeción. Hipoalergénico.',
    suggestedPrice: 54990,
    frameShape: 'rectangular',
    material: 'Grilamid flexible',
    lensType: 'clásico',
    uvProtection: 'UV400',
    lensMaterial: 'según prescripción',
    lensWidth: 46, lensHeight: 16, bridge: 16, templeLength: 125, totalWidth: 124,
    frameColor: 'Azul',
    lensColor: 'Sin cristal (armación)',
    isPrescription: true,
    variants: [
      { color: 'Azul', size: 'S (6-9 años)' },
      { color: 'Rojo', size: 'S (6-9 años)' },
      { color: 'Negro', size: 'M (10-12 años)' },
      { color: 'Rosa', size: 'S (6-9 años)' },
    ]
  },

  // ── LENTES DE CONTACTO ──────────────────────────────────────
  {
    name: 'Rusty Contact Daily UV',
    sku: 'RST-CONTACT-D',
    frameType: 'contacto',
    gender: 'unisex',
    description: 'Lentes de contacto descartables diarias con protección UV incorporada. Material de silicona hidrogel para máxima oxigenación y comodidad de hasta 16 hs de uso. Caja x30 unidades.',
    suggestedPrice: 18990,
    frameShape: null,
    material: 'Silicona hidrogel',
    lensType: 'clásico',
    uvProtection: 'UV400',
    lensMaterial: 'Silicona hidrogel',
    isPrescription: true,
    variants: [
      { color: 'Transparente', size: '-0.50' },
      { color: 'Transparente', size: '-1.00' },
      { color: 'Transparente', size: '-1.50' },
      { color: 'Transparente', size: '-2.00' },
      { color: 'Transparente', size: '-2.50' },
      { color: 'Transparente', size: '-3.00' },
      { color: 'Transparente', size: '-4.00' },
      { color: 'Transparente', size: '-5.00' },
      { color: 'Transparente', size: '-6.00' },
    ]
  },
  {
    name: 'Rusty Contact Monthly',
    sku: 'RST-CONTACT-M',
    frameType: 'contacto',
    gender: 'unisex',
    description: 'Lentes de contacto mensuales de silicona hidrogel. Reemplazo mensual con estuche y solución multipropósito incluidos. Comodidad todo el día para uso diario extendido. Caja x6 unidades.',
    suggestedPrice: 24990,
    material: 'Silicona hidrogel',
    lensType: 'clásico',
    uvProtection: 'UV380',
    lensMaterial: 'Silicona hidrogel',
    isPrescription: true,
    variants: [
      { color: 'Transparente', size: '-1.00' },
      { color: 'Transparente', size: '-2.00' },
      { color: 'Transparente', size: '-3.00' },
      { color: 'Transparente', size: '-4.00' },
      { color: 'Transparente', size: '-5.00' },
      { color: 'Transparente', size: '-6.00' },
    ]
  },

  // ── ACCESORIOS ──────────────────────────────────────────────
  {
    name: 'Rusty Estuche Rígido Original',
    sku: 'RST-CASE',
    frameType: 'accesorios',
    gender: 'unisex',
    description: 'Estuche rígido oficial Rusty con interior de microfibra para proteger tus anteojos. Incluye paño limpiador de microfibra y tarjeta de garantía.',
    suggestedPrice: 8990,
    material: 'ABS rígido con interior de microfibra',
    isPrescription: false,
    variants: [
      { color: 'Negro', size: 'Único' },
      { color: 'Azul navy', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Cordón Ajustable',
    sku: 'RST-CORDON',
    frameType: 'accesorios',
    gender: 'unisex',
    description: 'Cordón ajustable de neopreno para sujetar los anteojos durante actividades deportivas o al aire libre. Compatible con todos los modelos Rusty.',
    suggestedPrice: 4990,
    material: 'Neopreno',
    isPrescription: false,
    variants: [
      { color: 'Negro', size: 'Único' },
      { color: 'Gris', size: 'Único' },
      { color: 'Azul', size: 'Único' },
    ]
  },
  {
    name: 'Rusty Kit Limpieza Óptica',
    sku: 'RST-CLEAN',
    frameType: 'accesorios',
    gender: 'unisex',
    description: 'Kit de limpieza profesional para anteojos. Incluye spray limpiador 50ml, paño de microfibra 30x30cm y destornillador de precisión para ajuste de patillas.',
    suggestedPrice: 6990,
    material: 'Varios',
    isPrescription: false,
    variants: [
      { color: 'Único', size: 'Único' },
    ]
  },
];

async function main() {
  console.log('🚀 Cargando datos de Rusty en OptiMundo...\n');

  // 1. Crear usuario y perfil de marca Rusty
  const existing = await prisma.user.findUnique({ where: { email: 'rusty@rustyoptical.com' } });
  let brandProfile;

  if (existing) {
    console.log('✓ Marca Rusty ya existe, usando la existente');
    brandProfile = await prisma.brandProfile.findUnique({ where: { userId: existing.id } });
  } else {
    const hash = await bcrypt.hash('rusty2024', 10);
    const user = await prisma.user.create({
      data: {
        email: 'rusty@rustyoptical.com',
        passwordHash: hash,
        role: 'brand',
        status: 'active',
        brandProfile: {
          create: {
            brandName: 'Rusty',
            cuit: '30-71234567-8',
            description: 'Rusty es una marca argentina líder en el rubro óptico, reconocida por su diseño, calidad y tecnología en anteojos de sol, marcos ópticos y lentes de contacto. Con más de 20 años en el mercado, Rusty combina tendencia y funcionalidad.',
            website: 'https://rustyoptical.com',
            validationStatus: 'approved',
            validatedAt: new Date(),
            isFeatured: true,
          }
        }
      },
      include: { brandProfile: true }
    });
    brandProfile = user.brandProfile;
    console.log('✓ Marca Rusty creada y aprobada');
  }

  // 2. Cargar productos
  let created = 0;
  for (const p of RUSTY_PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { sku: p.sku } });
    if (existing) {
      console.log(`  ⟳ ${p.name} ya existe, salteando`);
      continue;
    }

    const { variants, ...productData } = p;
    await prisma.product.create({
      data: {
        ...productData,
        brandId: brandProfile.id,
        status: 'active',
        variants: { create: variants || [] }
      }
    });
    console.log(`  ✓ ${p.name} (${p.frameType}) — $${p.suggestedPrice?.toLocaleString('es-AR')}`);
    created++;
  }

  // 3. Resumen
  const total = await prisma.product.count({ where: { brand: { brandName: 'Rusty' } } });
  console.log(`\n✅ Listo! ${created} productos nuevos cargados. Total Rusty: ${total} productos.`);
  console.log('\nCredenciales marca Rusty:');
  console.log('  Email: rusty@rustyoptical.com');
  console.log('  Pass:  rusty2024');
}

main().catch(console.error).finally(() => prisma.$disconnect());
