-- Simplify the RLS policy for authenticated users to allow any authenticated user to create orders
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;

CREATE POLICY "Authenticated users can create orders" ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);