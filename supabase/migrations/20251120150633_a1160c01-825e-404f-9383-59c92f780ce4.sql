-- First, let's check the current state and recreate the policy to ensure it's correct
-- Drop all existing INSERT policies on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Allow order creation" ON orders;

-- Create a new INSERT policy that allows everyone (authenticated and anon)
CREATE POLICY "Enable insert for all users" ON orders
FOR INSERT
TO public
WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;