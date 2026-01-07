-- ============================================
-- Latino Coucou Beach - Test User Accounts
-- Run this in your Supabase SQL Editor
-- ============================================

-- IMPORTANT: These are TEST accounts for development only
-- In production, users should register through the app

-- Note: In Supabase, we can't directly create auth.users entries via SQL
-- You need to create users via the Supabase Dashboard or Auth API first
-- Then run this script to update their roles

-- OPTION 1: Create users via Supabase Dashboard
-- Go to: Authentication > Users > Add user
-- Create these users with password "Test1234!" (or any secure password)

-- Test User Emails:
-- 1. dev@latinocoucou.test      -> Role: DEV (full CMS access)
-- 2. client@latinocoucou.test   -> Role: CLIENT (customer access)
-- 3. resto@latinocoucou.test    -> Role: RESTAURANT (kitchen/bar orders)
-- 4. manager@latinocoucou.test  -> Role: MANAGER (reservations + staff)
-- 5. admin@latinocoucou.test    -> Role: ADMIN (full access)

-- ============================================
-- After creating users in Dashboard, run these:
-- ============================================

-- Update DEV role
UPDATE profiles 
SET role = 'DEV', full_name = 'Dev User (CMS)'
WHERE email = 'dev@latinocoucou.test';

-- Update CLIENT role (default, but setting name)
UPDATE profiles 
SET role = 'CLIENT', full_name = 'Client Test'
WHERE email = 'client@latinocoucou.test';

-- Update RESTAURANT role
UPDATE profiles 
SET role = 'RESTAURANT', full_name = 'Restaurant Staff'
WHERE email = 'resto@latinocoucou.test';

-- Update MANAGER role
UPDATE profiles 
SET role = 'MANAGER', full_name = 'Manager User'
WHERE email = 'manager@latinocoucou.test';

-- Update ADMIN role
UPDATE profiles 
SET role = 'ADMIN', full_name = 'Admin User'
WHERE email = 'admin@latinocoucou.test';


-- ============================================
-- OPTION 2: Quick setup with your own email
-- ============================================
-- If you want to use ONE email and switch roles, run:

-- UPDATE profiles SET role = 'DEV' WHERE email = 'your.email@example.com';
-- UPDATE profiles SET role = 'ADMIN' WHERE email = 'your.email@example.com';
-- etc.


-- ============================================
-- Verify accounts were updated
-- ============================================
SELECT id, email, full_name, role, created_at 
FROM profiles 
ORDER BY 
  CASE role 
    WHEN 'DEV' THEN 1 
    WHEN 'ADMIN' THEN 2 
    WHEN 'MANAGER' THEN 3 
    WHEN 'RESTAURANT' THEN 4 
    WHEN 'CLIENT' THEN 5 
  END;
