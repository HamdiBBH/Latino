-- CMS Schema Migration
-- Creates tables for internal content management system
-- Version 2: Fixed for re-execution

-- ============================================
-- Drop existing tables if they exist (for clean re-run)
-- ============================================
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS gallery_albums CASCADE;
DROP TABLE IF EXISTS site_branding CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS site_media CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS site_sections CASCADE;

-- ============================================
-- 1. Site Sections (visibility and order)
-- ============================================
CREATE TABLE site_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Site Content (text content per section)
-- ============================================
CREATE TABLE site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES site_sections(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) DEFAULT 'text',
    content TEXT,
    locale VARCHAR(10) DEFAULT 'fr',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, field_name, locale)
);

-- ============================================
-- 3. Site Media (uploaded files)
-- ============================================
CREATE TABLE site_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes INTEGER,
    width INTEGER,
    height INTEGER,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    folder VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Gallery Albums
-- ============================================
CREATE TABLE gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    cover_image_id UUID REFERENCES site_media(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Gallery Images
-- ============================================
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
    media_id UUID REFERENCES site_media(id) ON DELETE CASCADE,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Site Branding
-- ============================================
CREATE TABLE site_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type VARCHAR(50) NOT NULL UNIQUE,
    media_id UUID REFERENCES site_media(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Menu Items (Restaurant)
-- ============================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_id UUID REFERENCES site_media(id),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    allergens TEXT[],
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. Events
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    category VARCHAR(100),
    image_id UUID REFERENCES site_media(id),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. Testimonials
-- ============================================
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(100) NOT NULL,
    author_location VARCHAR(100),
    author_image_id UUID REFERENCES site_media(id),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Insert default data AFTER all tables are created
-- ============================================

-- Default sections
INSERT INTO site_sections (name, label, description, display_order, icon) VALUES
    ('hero', 'Hero', 'Section principale avec slider', 1, 'image'),
    ('booking', 'Barre de réservation', 'Formulaire de réservation rapide', 2, 'calendar'),
    ('about', 'À propos', 'Notre histoire et statistiques', 3, 'info'),
    ('services', 'Services', 'Nos services (restaurant, bar, plage, DJ)', 4, 'star'),
    ('packages', 'Forfaits', 'Nos offres et packages', 5, 'package'),
    ('reels', 'Reels', 'Vidéos Instagram', 6, 'video'),
    ('gallery', 'Galerie', 'Photos du lieu', 7, 'image'),
    ('testimonials', 'Avis clients', 'Témoignages', 8, 'message-circle'),
    ('events', 'Événements', 'Agenda et événements à venir', 9, 'calendar'),
    ('partners', 'Partenaires', 'Logos partenaires', 10, 'handshake'),
    ('cta', 'Call to Action', 'Section de réservation', 11, 'phone'),
    ('contact', 'Contact', 'Formulaire et informations de contact', 12, 'map-pin'),
    ('newsletter', 'Newsletter', 'Inscription newsletter', 13, 'mail'),
    ('footer', 'Footer', 'Pied de page', 14, 'layout');

-- Default content for Hero section
INSERT INTO site_content (section_id, field_name, field_type, content) 
SELECT id, 'title_light', 'text', 'Bienvenue au' FROM site_sections WHERE name = 'hero';

INSERT INTO site_content (section_id, field_name, field_type, content) 
SELECT id, 'title_bold', 'text', 'Latino Coucou Beach.' FROM site_sections WHERE name = 'hero';

INSERT INTO site_content (section_id, field_name, field_type, content) 
SELECT id, 'subtitle', 'text', 'L''expérience beach club ultime sous le soleil méditerranéen' FROM site_sections WHERE name = 'hero';

-- Default gallery albums
INSERT INTO gallery_albums (name, slug, display_order) VALUES
    ('Ambiance', 'ambiance', 1),
    ('Plage', 'plage', 2),
    ('Soirées', 'soirees', 3),
    ('Plats', 'plats', 4);

-- Default branding slots
INSERT INTO site_branding (asset_type) VALUES
    ('logo'),
    ('logo_light'),
    ('logo_dark'),
    ('favicon'),
    ('og_image');

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_site_sections_order ON site_sections(display_order);
CREATE INDEX idx_site_content_section ON site_content(section_id);
CREATE INDEX idx_gallery_images_album ON gallery_images(album_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_events_date ON events(event_date);

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['site_sections', 'site_content', 'site_media', 'gallery_albums', 'site_branding', 'menu_items', 'events', 'testimonials']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "cms_sections_auth" ON site_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_content_auth" ON site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_media_auth" ON site_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_albums_auth" ON gallery_albums FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_images_auth" ON gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_branding_auth" ON site_branding FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_menu_auth" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_events_auth" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_testimonials_auth" ON testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read policies for frontend
CREATE POLICY "cms_sections_public" ON site_sections FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "cms_content_public" ON site_content FOR SELECT TO anon USING (true);
CREATE POLICY "cms_albums_public" ON gallery_albums FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "cms_images_public" ON gallery_images FOR SELECT TO anon USING (true);
CREATE POLICY "cms_menu_public" ON menu_items FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "cms_events_public" ON events FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "cms_testimonials_public" ON testimonials FOR SELECT TO anon USING (is_active = true);
