-- Add image_url column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add a default placeholder for existing services
COMMENT ON COLUMN public.services.image_url IS 'URL of the service image for display in cards';
