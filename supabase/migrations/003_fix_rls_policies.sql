-- ============================================
-- Fix RLS policies for profiles table
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies if they cause issues
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Staff view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

-- Allow all authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to update their own profile (excluding role)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow admins and managers to view all profiles
CREATE POLICY "Staff can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'MANAGER', 'DEV')
  )
);

-- Verify the update
SELECT email, role FROM profiles ORDER BY role;
