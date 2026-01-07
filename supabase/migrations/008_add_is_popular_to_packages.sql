-- Fix missing column is_popular in packages table
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
