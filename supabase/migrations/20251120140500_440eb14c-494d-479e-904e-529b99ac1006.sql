-- Add low stock threshold column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10;

-- Create a function to get admin emails
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS TABLE(email TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email
  FROM profiles p
  INNER JOIN user_roles ur ON p.id = ur.user_id
  WHERE ur.role = 'admin'::app_role
  AND p.email IS NOT NULL;
$$;

-- Create a function to check and send low stock alerts
CREATE OR REPLACE FUNCTION public.check_low_stock_products()
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  current_stock INTEGER,
  threshold INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    name,
    stock_quantity,
    low_stock_threshold
  FROM products
  WHERE stock_quantity <= low_stock_threshold
  AND stock_quantity > 0;
$$;

-- Update orders table to link to users (if user is authenticated)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;