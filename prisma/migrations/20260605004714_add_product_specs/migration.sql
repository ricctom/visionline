-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "frame_type" TEXT NOT NULL,
    "gender" TEXT,
    "material" TEXT,
    "suggested_price" REAL,
    "lens_width" REAL,
    "lens_height" REAL,
    "bridge" REAL,
    "temple_length" REAL,
    "total_width" REAL,
    "lens_type" TEXT,
    "uv_protection" TEXT,
    "lens_material" TEXT,
    "frame_shape" TEXT,
    "frame_color" TEXT,
    "lens_color" TEXT,
    "is_prescription" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("brand_id", "created_at", "description", "frame_type", "gender", "id", "material", "name", "sku", "status", "suggested_price", "updated_at") SELECT "brand_id", "created_at", "description", "frame_type", "gender", "id", "material", "name", "sku", "status", "suggested_price", "updated_at" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
