require('dotenv').config();
const prisma = require('./src/lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🚀 Creando perfiles demo...\n');

  // ── 1. Óptica San Martín ─────────────────────────────────────
  let opticaUser = await prisma.user.findUnique({ where: { email: 'opticasanmartin@demo.com' } });

  if (!opticaUser) {
    const hash = await bcrypt.hash('optica2024', 10);
    opticaUser = await prisma.user.create({
      data: {
        email: 'opticasanmartin@demo.com',
        passwordHash: hash,
        role: 'optica',
        status: 'active',
        opticaProfile: {
          create: {
            businessName: 'Óptica San Martín',
            cuit: '30-55566677-8',
            matricula: 'OPT-0012-BA',
            address: 'Av. Santa Fe 2345',
            city: 'Buenos Aires',
            province: 'CABA',
            phone: '011-4821-3344',
            description: 'Óptica familiar con más de 30 años en el rubro. Especialistas en anteojos recetados, lentes de contacto y anteojos de sol de las mejores marcas. Atención personalizada y laboratorio propio.',
            validationStatus: 'approved',
            validatedAt: new Date(),
            totalSales: 148,
            avgRating: 4.8,
            isFeatured: true,
          }
        }
      },
      include: { opticaProfile: true }
    });
    console.log('✓ Óptica San Martín creada');
  } else {
    console.log('⟳ Óptica San Martín ya existe');
  }

  const optica = await prisma.opticaProfile.findUnique({ where: { userId: opticaUser.id } });

  // ── 2. Cargar inventario de Rusty en la óptica ───────────────
  const rustyProducts = await prisma.product.findMany({
    where: { brand: { brandName: 'Rusty' }, status: 'active' },
    include: { variants: true }
  });

  // Precio con markup del 15% sobre el sugerido de la marca
  let inventoryCreated = 0;
  for (const product of rustyProducts) {
    const price = Math.round((product.suggestedPrice || 50000) * 1.15);
    const existing = await prisma.opticaInventory.findFirst({
      where: { opticaId: optica.id, productId: product.id, variantId: null }
    });
    if (existing) continue;

    // Los de contacto y accesorios tienen stock propio, los anteojos son dropshipping
    const stockType = ['contacto', 'accesorios'].includes(product.frameType) ? 'own' : 'own';
    const quantity = product.frameType === 'contacto' ? 50 :
                     product.frameType === 'accesorios' ? 20 : 3;

    await prisma.opticaInventory.create({
      data: {
        opticaId: optica.id,
        productId: product.id,
        stockType,
        quantity,
        price,
        status: 'active',
      }
    });
    inventoryCreated++;
  }
  console.log(`✓ ${inventoryCreated} productos de Rusty agregados al inventario de la óptica`);

  // ── 3. Simular algunas reseñas ───────────────────────────────
  console.log('\n✅ Demo listo!\n');
  console.log('─────────────────────────────────────────');
  console.log('MARCA RUSTY');
  console.log('  Email: rusty@rustyoptical.com');
  console.log('  Pass:  rusty2024');
  console.log('');
  console.log('ÓPTICA SAN MARTÍN');
  console.log('  Email: opticasanmartin@demo.com');
  console.log('  Pass:  optica2024');
  console.log('');
  console.log('ADMIN');
  console.log('  Email: admin@optimundo.com');
  console.log('  Pass:  admin123');
  console.log('─────────────────────────────────────────');
}

main().catch(console.error).finally(() => prisma.$disconnect());
