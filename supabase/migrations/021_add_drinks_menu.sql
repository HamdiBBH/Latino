-- Migration: Add drinks menu items
-- Cocktails, Jus Frais, Duo Jus, and Other drinks

-- Cocktails
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('cocktails', 'Mojito', 'Cocktail classique à la menthe fraîche et au citron vert', 8, ARRAY['cocktail', 'classique'], true, true),
('cocktails', 'Mojito Blue', 'Mojito revisité avec une touche de curaçao bleu', 10, ARRAY['cocktail', 'signature'], true, false),
('cocktails', 'Mojito Fraise', 'Mojito rafraîchissant aux fraises fraîches', 10, ARRAY['cocktail', 'fruité'], true, true),
('cocktails', 'Mojito Framboise', 'Mojito aux framboises fraîches', 10, ARRAY['cocktail', 'fruité'], true, false),
('cocktails', 'Pina Colada', 'Cocktail tropical à la noix de coco et ananas', 10, ARRAY['cocktail', 'tropical'], true, true),
('cocktails', 'Cocktail Spécial', 'Création exclusive du chef barman', 25, ARRAY['cocktail', 'premium', 'signature'], true, true);

-- Jus Frais (Fresh Juices)
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('boissons', 'Citronnade', 'Citronnade fraîche maison', 8, ARRAY['jus', 'agrumes'], true, true),
('boissons', 'Jus de Fraises', 'Jus de fraises fraîches pressées', 10, ARRAY['jus', 'fruits-rouges'], true, false),
('boissons', 'Jus de Framboise', 'Jus de framboises fraîches', 10, ARRAY['jus', 'fruits-rouges'], true, false),
('boissons', 'Jus de Pêche', 'Jus de pêche fraîchement pressé', 10, ARRAY['jus', 'fruits'], true, false),
('boissons', 'Jus d''Orange', 'Jus d''orange fraîchement pressé', 10, ARRAY['jus', 'agrumes'], true, true),
('boissons', 'Jus de Banane', 'Smoothie banane onctueux', 12, ARRAY['jus', 'smoothie'], true, false);

-- Duo Jus (Mixed Juices)
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('boissons', 'Duo Fraises - Banane', 'Mélange rafraîchissant fraises et banane', 12, ARRAY['duo-jus', 'smoothie'], true, true),
('boissons', 'Duo Kiwi - Banane', 'Mélange exotique kiwi et banane', 12, ARRAY['duo-jus', 'smoothie'], true, false),
('boissons', 'Duo Café - Banane', 'Mélange énergisant café et banane', 12, ARRAY['duo-jus', 'smoothie', 'café'], true, false),
('boissons', 'Duo Orange - Banane', 'Mélange vitaminé orange et banane', 12, ARRAY['duo-jus', 'smoothie'], true, false),
('boissons', 'Duo Fraises - Ananas', 'Mélange tropical fraises et ananas', 12, ARRAY['duo-jus', 'smoothie'], true, false);

-- Autres (Other drinks)
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('boissons', 'Espresso', 'Café expresso italien', 6, ARRAY['café', 'chaud'], true, false),
('boissons', 'Cappuccino', 'Cappuccino crémeux traditionnel', 5, ARRAY['café', 'chaud'], true, true),
('boissons', 'Chicha', 'Narguilé aux saveurs variées', 20, ARRAY['chicha', 'détente'], true, true);
