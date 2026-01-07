-- Insert Dummy Images for Testimonials
WITH inserted_images AS (
    INSERT INTO public.site_media (filename, url, alt_text, folder, mime_type) VALUES
    ('marie.jpg', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', 'Marie L.', 'testimonials', 'image/jpeg'),
    ('thomas-julie.jpg', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', 'Thomas & Julie', 'testimonials', 'image/jpeg'),
    ('alexandre.jpg', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', 'Alexandre M.', 'testimonials', 'image/jpeg')
    RETURNING id, alt_text
)
INSERT INTO public.testimonials (author_name, author_location, author_image_id, content, rating, display_order, is_active)
SELECT 
    CASE 
        WHEN alt_text = 'Marie L.' THEN 'Marie L.'
        WHEN alt_text = 'Thomas & Julie' THEN 'Thomas & Julie'
        WHEN alt_text = 'Alexandre M.' THEN 'Alexandre M.'
    END as author_name,
    CASE 
        WHEN alt_text = 'Marie L.' THEN 'Paris, France'
        WHEN alt_text = 'Thomas & Julie' THEN 'Lyon, France'
        WHEN alt_text = 'Alexandre M.' THEN 'Marseille, France'
    END as author_location,
    id as author_image_id,
    CASE 
        WHEN alt_text = 'Marie L.' THEN 'Un endroit magique ! L''ambiance, la nourriture, le service... tout était parfait. Le coucher de soleil depuis leur terrasse est à couper le souffle. On reviendra !'
        WHEN alt_text = 'Thomas & Julie' THEN 'Nous avons célébré notre anniversaire de mariage ici. Le personnel a été aux petits soins, et l''espace VIP était sublime. Une expérience inoubliable !'
        WHEN alt_text = 'Alexandre M.' THEN 'Les meilleurs cocktails de la côte ! L''ambiance est festive sans être trop bruyante. Le DJ était excellent. L''endroit parfait pour profiter de l''été.'
    END as content,
    5 as rating,
    CASE 
        WHEN alt_text = 'Marie L.' THEN 1
        WHEN alt_text = 'Thomas & Julie' THEN 2
        WHEN alt_text = 'Alexandre M.' THEN 3
    END as display_order,
    true as is_active
FROM inserted_images;
