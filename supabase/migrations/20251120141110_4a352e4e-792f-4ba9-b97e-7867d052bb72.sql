-- Fix orders table RLS policies to allow guest checkout
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create new INSERT policy that truly allows anyone (authenticated or not)
CREATE POLICY "Allow order creation" ON orders
FOR INSERT
WITH CHECK (true);

-- Enable realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE products;