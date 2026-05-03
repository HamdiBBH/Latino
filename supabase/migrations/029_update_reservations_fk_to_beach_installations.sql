-- 029_update_reservations_fk_to_beach_installations.sql

-- Drop the old foreign key constraint pointing to packages
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS reservations_package_id_fkey;

-- We also need to drop alternative_package_id foreign key if it exists
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS reservations_alternative_package_id_fkey;

-- Temporarily drop check constraints to allow updating old invalid rows
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_email_format;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_phone_format;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_guest_count_range;

-- Handle existing data: set package_id to NULL if it doesn't exist in beach_installations
UPDATE public.reservations
SET package_id = NULL
WHERE package_id IS NOT NULL 
  AND package_id NOT IN (SELECT id FROM public.beach_installations);

UPDATE public.reservations
SET alternative_package_id = NULL
WHERE alternative_package_id IS NOT NULL 
  AND alternative_package_id NOT IN (SELECT id FROM public.beach_installations);

-- Add new foreign key constraints pointing to beach_installations
ALTER TABLE public.reservations
ADD CONSTRAINT reservations_package_id_fkey
FOREIGN KEY (package_id) REFERENCES public.beach_installations(id)
ON DELETE SET NULL;

ALTER TABLE public.reservations
ADD CONSTRAINT reservations_alternative_package_id_fkey
FOREIGN KEY (alternative_package_id) REFERENCES public.beach_installations(id)
ON DELETE SET NULL;

-- Re-add check constraints as NOT VALID so they don't fail on old invalid rows
ALTER TABLE public.reservations
ADD CONSTRAINT reservations_email_format
CHECK (guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') NOT VALID;

ALTER TABLE public.reservations
ADD CONSTRAINT reservations_phone_format
CHECK (guest_phone ~ '^\+?[0-9]{8,15}$') NOT VALID;

ALTER TABLE public.reservations
ADD CONSTRAINT reservations_guest_count_range
CHECK (guest_count BETWEEN 1 AND 15) NOT VALID;
