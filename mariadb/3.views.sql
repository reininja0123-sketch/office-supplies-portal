CREATE OR REPLACE VIEW get_admin_emails AS
SELECT 
    p.email
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin'
  AND p.email IS NOT NULL;



CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    id AS product_id,
    name AS product_name,
    stock_quantity AS current_stock,
    low_stock_threshold AS threshold
FROM products
WHERE stock_quantity <= low_stock_threshold
  AND stock_quantity > 0;