-- ============================================================
-- OptiMundo - Base de datos
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USUARIOS
-- ============================================================

CREATE TYPE user_role AS ENUM ('consumer', 'optica', 'brand', 'distributor', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL,
  status        user_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PERFILES
-- ============================================================

CREATE TABLE consumer_profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  phone        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE validation_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE optica_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name       TEXT NOT NULL,
  cuit                TEXT UNIQUE NOT NULL,
  matricula           TEXT,
  address             TEXT,
  city                TEXT,
  province            TEXT,
  phone               TEXT,
  logo_url            TEXT,
  description         TEXT,
  validation_status   validation_status NOT NULL DEFAULT 'pending',
  validated_at        TIMESTAMPTZ,
  -- Reputación
  total_sales         INT NOT NULL DEFAULT 0,
  avg_rating          NUMERIC(3,2),
  -- Publicidad
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  featured_until      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brand_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand_name      TEXT NOT NULL,
  cuit            TEXT UNIQUE NOT NULL,
  logo_url        TEXT,
  description     TEXT,
  website         TEXT,
  validation_status validation_status NOT NULL DEFAULT 'pending',
  validated_at    TIMESTAMPTZ,
  -- Publicidad
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  featured_until  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE distributor_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  cuit          TEXT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCTOS
-- ============================================================

CREATE TYPE product_status AS ENUM ('draft', 'active', 'paused', 'deleted');
CREATE TYPE frame_type AS ENUM ('opticos', 'sol', 'contacto', 'accesorios');
CREATE TYPE gender AS ENUM ('hombre', 'mujer', 'unisex', 'ninos');

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        UUID NOT NULL REFERENCES brand_profiles(id),
  name            TEXT NOT NULL,
  sku             TEXT,
  description     TEXT,
  frame_type      frame_type NOT NULL,
  gender          gender,
  material        TEXT,
  -- Precio sugerido de la marca
  suggested_price NUMERIC(12,2),
  status          product_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE product_variants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color       TEXT,
  size        TEXT,
  sku_variant TEXT
);

-- ============================================================
-- STOCK DE ÓPTICAS
-- ============================================================

CREATE TYPE stock_type AS ENUM ('own', 'dropshipping');

CREATE TABLE optica_inventory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  optica_id       UUID NOT NULL REFERENCES optica_profiles(id),
  product_id      UUID NOT NULL REFERENCES products(id),
  variant_id      UUID REFERENCES product_variants(id),
  stock_type      stock_type NOT NULL DEFAULT 'own',
  -- Si es propio: cantidad real en el local
  quantity        INT NOT NULL DEFAULT 0,
  -- Precio que pone la óptica (puede diferir del sugerido)
  price           NUMERIC(12,2) NOT NULL,
  status          product_status NOT NULL DEFAULT 'active',
  distributor_id  UUID REFERENCES distributor_profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(optica_id, product_id, variant_id)
);

-- ============================================================
-- PEDIDOS
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consumer_id     UUID NOT NULL REFERENCES consumer_profiles(id),
  optica_id       UUID NOT NULL REFERENCES optica_profiles(id),
  status          order_status NOT NULL DEFAULT 'pending_payment',
  -- Totales
  subtotal        NUMERIC(12,2) NOT NULL,
  shipping_cost   NUMERIC(12,2) NOT NULL DEFAULT 0,
  platform_fee    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL,
  -- Envío
  shipping_address TEXT NOT NULL,
  shipping_city    TEXT NOT NULL,
  shipping_province TEXT NOT NULL,
  tracking_number  TEXT,
  -- Pago
  payment_id       TEXT,  -- ID de MercadoPago
  paid_at          TIMESTAMPTZ,
  shipped_at       TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  inventory_id  UUID NOT NULL REFERENCES optica_inventory(id),
  quantity      INT NOT NULL DEFAULT 1,
  unit_price    NUMERIC(12,2) NOT NULL,
  -- Si es dropshipping, qué distribuidora despacha
  distributor_id UUID REFERENCES distributor_profiles(id),
  stock_type    stock_type NOT NULL
);

-- ============================================================
-- REPUTACIÓN
-- ============================================================

CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID UNIQUE NOT NULL REFERENCES orders(id),
  consumer_id UUID NOT NULL REFERENCES consumer_profiles(id),
  optica_id   UUID NOT NULL REFERENCES optica_profiles(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PUBLICIDAD
-- ============================================================

CREATE TYPE ad_target AS ENUM ('consumer', 'optica');
CREATE TYPE ad_placement AS ENUM ('home_banner', 'category_top', 'search_sidebar');

CREATE TABLE ads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Puede ser una marca O una óptica quien paga
  brand_id      UUID REFERENCES brand_profiles(id),
  optica_id     UUID REFERENCES optica_profiles(id),
  target        ad_target NOT NULL,
  placement     ad_placement NOT NULL,
  image_url     TEXT NOT NULL,
  link_url      TEXT,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  impressions   INT NOT NULL DEFAULT 0,
  clicks        INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (brand_id IS NOT NULL OR optica_id IS NOT NULL)
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_frame_type ON products(frame_type);
CREATE INDEX idx_inventory_optica ON optica_inventory(optica_id);
CREATE INDEX idx_inventory_product ON optica_inventory(product_id);
CREATE INDEX idx_orders_consumer ON orders(consumer_id);
CREATE INDEX idx_orders_optica ON orders(optica_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reviews_optica ON reviews(optica_id);
