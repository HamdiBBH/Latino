-- Insert standard sections if they don't exist
INSERT INTO public.site_sections (name, label, display_order, is_active) VALUES
('hero', 'Hero Section', 1, true),
('about', 'À propos', 2, true),
('services', 'Services', 3, true),
('packages', 'Forfaits', 4, true),
('reels', 'Reels Instagram', 5, true),
('gallery', 'Galerie', 6, true),
('testimonials', 'Témoignages', 7, true),
('events', 'Événements', 8, true),
('partners', 'Partenaires', 9, true),
('cta', 'Appel à laction', 10, true),
('contact', 'Contact', 11, true),
('newsletter', 'Newsletter', 12, true)
ON CONFLICT (name) DO NOTHING;

-- Ensure explicit active status just in case they existed but were false
UPDATE public.site_sections SET is_active = true WHERE name IN ('services', 'packages');

-- Verify entries
SELECT * FROM public.site_sections ORDER BY display_order;
