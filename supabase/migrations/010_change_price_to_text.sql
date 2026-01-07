-- Change price column to TEXT to allow formatted strings (e.g. "70 DT", "Sur devis")
ALTER TABLE public.packages 
ALTER COLUMN price TYPE TEXT USING price::text;
