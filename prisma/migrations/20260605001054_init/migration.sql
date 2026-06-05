-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "consumer_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "consumer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "optica_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "matricula" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "phone" TEXT,
    "logo_url" TEXT,
    "description" TEXT,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "validated_at" DATETIME,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" REAL,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "optica_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "brand_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "website" TEXT,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "validated_at" DATETIME,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "brand_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "distributor_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "distributor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "frame_type" TEXT NOT NULL,
    "gender" TEXT,
    "material" TEXT,
    "suggested_price" REAL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "color" TEXT,
    "size" TEXT,
    "sku_variant" TEXT,
    CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "optica_inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "optica_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "stock_type" TEXT NOT NULL DEFAULT 'own',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "distributor_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "optica_inventory_optica_id_fkey" FOREIGN KEY ("optica_id") REFERENCES "optica_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "optica_inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "optica_inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "optica_inventory_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consumer_id" TEXT NOT NULL,
    "optica_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "subtotal" REAL NOT NULL,
    "shipping_cost" REAL NOT NULL DEFAULT 0,
    "platform_fee" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "shipping_address" TEXT NOT NULL,
    "shipping_city" TEXT NOT NULL,
    "shipping_province" TEXT NOT NULL,
    "tracking_number" TEXT,
    "payment_id" TEXT,
    "paid_at" DATETIME,
    "shipped_at" DATETIME,
    "delivered_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "orders_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "consumer_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_optica_id_fkey" FOREIGN KEY ("optica_id") REFERENCES "optica_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" REAL NOT NULL,
    "distributor_id" TEXT,
    "stock_type" TEXT NOT NULL,
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "optica_inventory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributor_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "optica_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "consumer_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_optica_id_fkey" FOREIGN KEY ("optica_id") REFERENCES "optica_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_id" TEXT,
    "optica_id" TEXT,
    "target" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "starts_at" DATETIME NOT NULL,
    "ends_at" DATETIME NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ads_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ads_optica_id_fkey" FOREIGN KEY ("optica_id") REFERENCES "optica_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "consumer_profiles_user_id_key" ON "consumer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "optica_profiles_user_id_key" ON "optica_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "optica_profiles_cuit_key" ON "optica_profiles"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "brand_profiles_user_id_key" ON "brand_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "brand_profiles_cuit_key" ON "brand_profiles"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "distributor_profiles_user_id_key" ON "distributor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "distributor_profiles_cuit_key" ON "distributor_profiles"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "optica_inventory_optica_id_product_id_variant_id_key" ON "optica_inventory"("optica_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");
