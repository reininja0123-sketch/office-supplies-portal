-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Allow order creation" ON orders;

-- Create new policy that allows authenticated and anonymous users to insert orders
CREATE POLICY "Anyone can create orders" ON orders
FOR INSERT
WITH CHECK (true);

-- Also ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;