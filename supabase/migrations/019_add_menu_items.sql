-- Migration: Add menu items from paper menu
-- Latino's Pasta, Latino's Seafood, Latino's Grill, and Menu Standard

-- Latino's Pasta
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('plats', 'Tagliatelle sauce Rosso aux crevettes', 'Pâtes fraîches tagliatelle avec sauce tomate maison et crevettes', 35, ARRAY['pasta', 'fruits-de-mer'], true, true),
('plats', 'Spaghetti fruits de mer sauce rouge', 'Spaghetti aux fruits de mer variés dans une sauce tomate épicée', 35, ARRAY['pasta', 'fruits-de-mer'], true, false),
('plats', 'Pâtes Pesto Pene aux crevettes', 'Penne au pesto frais accompagnées de crevettes grillées', 35, ARRAY['pasta', 'fruits-de-mer'], true, false),
('plats', 'Pâtes sauce blanche Escalope', 'Pâtes crémeuses servies avec escalope de poulet tendre', 35, ARRAY['pasta', 'viande'], true, false);

-- Latino's Seafood
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('plats', 'Ojja fruits de mer', 'Spécialité tunisienne aux œufs, tomates et fruits de mer frais', 25, ARRAY['seafood', 'specialite'], true, true),
('plats', 'Grande gargoulette Fruits de mer', 'Généreuse portion de fruits de mer variés cuits à la gargoulette', 90, ARRAY['seafood', 'partage'], true, true),
('plats', 'Petite gargoulette Fruits de mer', 'Portion individuelle de fruits de mer à la gargoulette', 60, ARRAY['seafood'], true, false);

-- Latino's Grill
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('plats', 'Grande grillade mixte fruits de mer', 'Assortiment généreux de poissons et fruits de mer grillés', 90, ARRAY['grill', 'partage'], true, true),
('plats', 'Petite grillade mixte fruits de mer', 'Portion individuelle de grillade mixte', 50, ARRAY['grill'], true, false);

-- Menu Standard (Forfait inclus)
INSERT INTO public.menu_items (category, name, description, price, tags, is_active, is_featured) VALUES
('entrees', 'Salade Verte', 'Salade fraîche de saison - Entrée du Menu Standard', 0, ARRAY['menu-standard', 'entree'], true, false),
('entrees', 'Salade Mechouia', 'Salade tunisienne traditionnelle grillée - Entrée du Menu Standard', 0, ARRAY['menu-standard', 'entree'], true, false),
('plats', 'Daurade grillée', 'Daurade fraîche grillée - Plat principal du Menu Standard', 0, ARRAY['menu-standard', 'grill'], true, false),
('plats', 'Escalope grillée', 'Escalope tendre grillée - Plat principal du Menu Standard', 0, ARRAY['menu-standard', 'viande'], true, false),
('plats', 'Cordon bleu', 'Cordon bleu croustillant - Plat principal du Menu Standard', 0, ARRAY['menu-standard', 'viande'], true, false),
('desserts', 'Fruits du jour', 'Sélection de fruits frais de saison - Dessert du Menu Standard', 0, ARRAY['menu-standard', 'dessert'], true, false);
