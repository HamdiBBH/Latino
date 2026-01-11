-- Migration: Add FAQ and Map sections to CMS
-- These sections can now be managed via the dashboard

-- Insert FAQ section
INSERT INTO site_sections (name, label, description, display_order, icon, is_active)
VALUES ('faq', 'Questions Fréquentes', 'Section FAQ avec accordéon', 15, 'help-circle', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Map section
INSERT INTO site_sections (name, label, description, display_order, icon, is_active)
VALUES ('map', 'Localisation', 'Carte Google Maps et infos de contact', 16, 'map-pin', true)
ON CONFLICT (name) DO NOTHING;

