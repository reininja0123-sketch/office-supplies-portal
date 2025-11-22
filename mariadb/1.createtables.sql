-- CATEGORIES
CREATE TABLE categories (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT UUID(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
);

-- PRODUCTS
CREATE TABLE products (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT UUID(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id CHAR(36),
  stock_quantity INT NOT NULL DEFAULT 0,
  sku VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ORDERS
CREATE TABLE orders (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT UUID(),
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT UUID(),
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- USERS (auth replacement)
CREATE TABLE users (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT UUID(),
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
);

-- PROFILES
CREATE TABLE profiles (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),

  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- ROLES
CREATE TABLE user_roles (
  id CHAR(36) NOT NULL PRIMARY KEY DEFAULT UUID(),
  user_id CHAR(36) NOT NULL,
  role ENUM('admin', 'user') NOT NULL,
  UNIQUE (user_id, role),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE storage_buckets (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    file_size_limit INT,
    allowed_mime_types TEXT
);

CREATE TABLE storage_objects (
    id CHAR(36) PRIMARY KEY DEFAULT UUID(),
    bucket_id VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(255),
    size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    
    FOREIGN KEY (bucket_id) REFERENCES storage_buckets(id)
);


-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id CHAR(36) NOT NULL PRIMARY KEY DEFAULT UUID(),
    product_id CHAR(36) NOT NULL,
    variant_type VARCHAR(100) NOT NULL,   -- 'size', 'color', etc.
    variant_value VARCHAR(100) NOT NULL,  -- 'Small', 'Red', etc.
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


