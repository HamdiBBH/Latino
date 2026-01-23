-- Migration: Add card display fields to menu_items
-- Adds rating, badge, old_price, and image_url for card-based display

-- Add rating field (1-5 stars)
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5);

-- Add badge field (e.g., "Seasonal Offers", "10% Off", "Member Discount")
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS badge VARCHAR(100);

-- Add old_price for showing discounts
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS old_price DECIMAL(10,2);

-- Add direct image_url for easier access (in addition to image_id reference)
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update some items with sample ratings and badges
UPDATE public.menu_items 
SET rating = 4.6, badge = 'Populaire'
WHERE name = 'Tagliatelle sauce Rosso aux crevettes';

UPDATE public.menu_items 
SET rating = 4.5, badge = 'Chef''s Choice'
WHERE name = 'Spaghetti fruits de mer sauce rouge';

UPDATE public.menu_items 
SET rating = 4.8, badge = 'Nouveau'
WHERE name = 'Grande gargoulette Fruits de mer';

UPDATE public.menu_items 
SET rating = 4.7
WHERE name = 'Ojja fruits de mer';

UPDATE public.menu_items 
SET rating = 4.4
WHERE name = 'Grande grillade mixte fruits de mer';
