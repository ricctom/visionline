require('dotenv').config();
const prisma = require('./src/lib/prisma');

const BASE = 'https://rustyoptical.com/images/Rusty/productos';

const IMAGES = {
  'RST-ZAEDIT': [
    `${BASE}/ss24/zaedit/sblk-drt-03-sku-127060/ZAEDIT_SBLK_DRT03_f.jpg`,
  ],
  'RST-BLOZON': [
    `${BASE}/ss22/zinz/mblk-s10-pol-126805/ZINZ-MBLK-S10-POL-FRENTE.jpg`,
  ],
  'RST-PATIENT': [
    `${BASE}/ss22/patien/mblk-r-blue-126091/PATIEN-MBLK---R-BLUE-frente.jpg`,
  ],
  'RST-TERDEY': [
    `${BASE}/ss24/misty/mblk-s10-pol-sku-127030/MISTY_MBLK_S10_Pol_f.jpg`,
  ],
  'RST-XOLD': [
    `${BASE}/ss22/xold/sblk-s10-pol-125761/XOLD-SBLK---S10-POL-frente.jpg`,
  ],
  'RST-PROSUN': [
    `${BASE}/ss24/ruchill/mblk-s10-pol-sku-957064/RUCHILL_MBLK_S10_POL_f.jpg`,
  ],
  'RST-GENUS': [
    `${BASE}/ss24/society/mblk-s10-pol-sku-113114/SOCIETY_MBLK_S10_POL_f.jpg`,
  ],
  'RST-DECKARD-OP': [
    `${BASE}/ss24/votiv/sblk-046-s15-sku-124116/124116-VOTIV_SBLK-046-S15-frente.jpg`,
  ],
  'RST-HALLEY-OP': [
    `${BASE}/ss24/etiquet/brown-b15-pol-sku-957070/ETIQUET_BROWN_B15_POL_f.jpg`,
  ],
  'RST-JUNIOR': [
    `${BASE}/ss24/woah/c81-s10-pol-tweens-sku-956921/WOAH_C81-S10_POL_F.jpg`,
  ],
};

async function main() {
  console.log('🖼️  Cargando imágenes oficiales de Rusty...\n');

  for (const [sku, urls] of Object.entries(IMAGES)) {
    const product = await prisma.product.findFirst({ where: { sku } });
    if (!product) { console.log(`  ⚠ SKU ${sku} no encontrado`); continue; }

    // Eliminar imágenes previas
    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    // Insertar nuevas
    for (let i = 0; i < urls.length; i++) {
      await prisma.productImage.create({
        data: { productId: product.id, url: urls[i], isPrimary: i === 0, sortOrder: i }
      });
    }
    console.log(`  ✓ ${product.name}`);
  }

  console.log('\n✅ Imágenes cargadas!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
