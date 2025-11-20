-- Fix RLS policies for orders table to allow all users (both anonymous and authenticated) to place orders
DROP POLICY IF EXISTS "Anonymous users can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;

-- Create a single permissive policy that allows anyone to create orders
CREATE POLICY "Anyone can create orders" ON orders
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own orders
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);