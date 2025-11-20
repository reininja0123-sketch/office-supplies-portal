-- Drop the existing policy and create proper policies for different user types
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;

-- Allow authenticated users to insert their own orders
CREATE POLICY "Authenticated users can create orders" ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous users to create orders (for guest checkout if needed)
CREATE POLICY "Anonymous users can create orders" ON orders
FOR INSERT
TO anon
WITH CHECK (true);

-- Ensure similar policies for order_items
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

CREATE POLICY "Authenticated users can create order items" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anonymous users can create order items" ON order_items
FOR INSERT
TO anon
WITH CHECK (true);