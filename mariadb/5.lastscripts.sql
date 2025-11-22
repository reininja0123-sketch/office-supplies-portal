ALTER TABLE products 
ADD COLUMN low_stock_threshold INT NOT NULL DEFAULT 10;

ALTER TABLE orders 
ADD COLUMN user_id CHAR(36),
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;


ALTER TABLE orders MODIFY COLUMN user_id CHAR(36) NULL;

ALTER TABLE orders 
ADD COLUMN approved_at TIMESTAMP NULL,
ADD COLUMN approved_by CHAR(36) NULL;

ALTER TABLE orders 
ADD FOREIGN KEY (approved_by) REFERENCES users(id);



-- Index for faster lookups by product_id
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
