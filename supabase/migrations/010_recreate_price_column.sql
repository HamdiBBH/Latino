-- Drop the problematic column and recreate it correctly as TEXT
-- This removes any hidden constraints (like CHECK price >= 0) that cause the conversion error
ALTER TABLE public.packages DROP COLUMN IF EXISTS price;
ALTER TABLE public.packages ADD COLUMN price TEXT;
