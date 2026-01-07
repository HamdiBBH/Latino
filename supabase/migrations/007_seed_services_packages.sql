-- Insert Initial Services
INSERT INTO public.services (title, description, icon, display_order, is_active) VALUES
('Restaurant', 'Cuisine méditerranéenne raffinée, fruits de mer frais et spécialités locales préparées par notre chef étoilé.', 'Utensils', 1, true),
('Bar & Cocktails', 'Cocktails signature créés par nos mixologistes, vins sélectionnés et champagnes premium face à la mer.', 'Wine', 2, true),
('Plage Privée', 'Transats premium, parasols, service personnalisé sur la plage et accès exclusif à notre zone VIP.', 'Sun', 3, true),
('DJ & Événements', 'DJ sets quotidiens, soirées thématiques, concerts live et privatisation pour vos événements.', 'Music', 4, true);

-- Insert Initial Packages
INSERT INTO public.packages (name, price, features, is_popular, display_order, is_active) VALUES
('PACK CABANE SUR SABLE', '70 DT', '["Parking sécurisé", "Traversée en bateau (Zodiac)", "Déjeuner complet poisson", "Cabane sur sable pour la journée"]'::jsonb, false, 1, true),
('PACK PAILLOTE EN MER', '80 DT', '["Parking sécurisé", "Traversée en bateau (Zodiac)", "Déjeuner complet poisson", "Paillote en mer pour la journée"]'::jsonb, true, 2, true),
('PACK ENFANTS', '45 DT', '["Menu adapté pour enfant (4-12ans)", "Enfant moins 4 ans gratuit"]'::jsonb, false, 3, true);
