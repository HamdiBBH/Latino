-- ============================================
-- Latino Coucou Beach - Database Schema
-- Run this migration in your Supabase SQL Editor
-- ============================================

-- ============================================
-- CMS TABLES (Priority for site editing)
-- ============================================

-- Site content (texts, labels)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE site_content IS 'CMS: Stores all editable text content by key';
COMMENT ON COLUMN site_content.value IS 'JSONB containing: { text: string, type: heading|paragraph|button|label }';

-- Site branding (colors, fonts, logo)
CREATE TABLE IF NOT EXISTS site_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type TEXT CHECK (type IN ('color', 'font', 'url', 'text')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE site_branding IS 'CMS: Stores theme variables (colors, fonts, logo URL)';

-- ============================================
-- USER & ROLES
-- ============================================

-- Custom role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('DEV', 'CLIENT', 'RESTAURANT', 'MANAGER', 'ADMIN');
  END IF;
END $$;

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'CLIENT',
  loyalty_points INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profiles with role-based access control';

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BUSINESS TABLES
-- ============================================

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  type TEXT CHECK (type IN ('table', 'transat', 'vip', 'event')) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE reservations IS 'Booking reservations for tables, transats, VIP, events';

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  table_number TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE orders IS 'Food & drink orders for kitchen/bar display';

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Packages/Forfaits
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'DT',
  features JSONB DEFAULT '[]',
  style TEXT DEFAULT 'white' CHECK (style IN ('white', 'gold', 'light')),
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_location TEXT,
  author_image_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery images
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  size TEXT DEFAULT 'normal' CHECK (size IN ('normal', 'large', 'wide')),
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read policies (for public site)
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public read site_branding" ON site_branding FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (available = true);
CREATE POLICY "Public read packages" ON packages FOR SELECT USING (visible = true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (visible = true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (visible = true);
CREATE POLICY "Public read gallery_images" ON gallery_images FOR SELECT USING (visible = true);

-- DEV role: Full access to CMS content
CREATE POLICY "DEV edit site_content" ON site_content FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'DEV'));
CREATE POLICY "DEV edit site_branding" ON site_branding FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'DEV'));

-- Users can view their own profile
CREATE POLICY "Users view own profile" ON profiles FOR SELECT 
  USING (id = auth.uid());
  
-- Admins/Managers can view all profiles
CREATE POLICY "Staff view all profiles" ON profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')));

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Reservations: Users see their own, staff sees all
CREATE POLICY "Users view own reservations" ON reservations FOR SELECT 
  USING (user_id = auth.uid());
  
CREATE POLICY "Staff view all reservations" ON reservations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('RESTAURANT', 'MANAGER', 'ADMIN')));

-- Allow public reservation creation (guests without account)
CREATE POLICY "Public insert reservations" ON reservations FOR INSERT 
  WITH CHECK (true);

-- Orders: Staff only
CREATE POLICY "Staff view orders" ON orders FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('RESTAURANT', 'MANAGER', 'ADMIN')));
  
CREATE POLICY "Staff manage orders" ON orders FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('RESTAURANT', 'MANAGER', 'ADMIN')));

-- Admin: Full access to everything
CREATE POLICY "Admin full access menu_items" ON menu_items FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admin full access packages" ON packages FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admin full access events" ON events FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admin full access gallery" ON gallery_images FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ============================================
-- SEED DATA (Default content)
-- ============================================

-- Insert default site content
INSERT INTO site_content (key, value, section) VALUES
  ('hero_title_light', '{"text": "Bienvenue au", "type": "heading"}', 'hero'),
  ('hero_title_bold', '{"text": "Latino Coucou Beach.", "type": "heading"}', 'hero'),
  ('hero_subtitle', '{"text": "L''expérience beach club ultime sous le soleil méditerranéen", "type": "paragraph"}', 'hero'),
  ('about_tag', '{"text": "Notre Histoire", "type": "label"}', 'about'),
  ('about_title_light', '{"text": "Un paradis", "type": "heading"}', 'about'),
  ('about_title_bold', '{"text": "au bord de l''eau", "type": "heading"}', 'about'),
  ('about_text_1', '{"text": "Niché sur les plus belles plages de la Méditerranée, Latino Coucou Beach vous offre une expérience unique alliant gastronomie raffinée, cocktails signature et ambiance festive.", "type": "paragraph"}', 'about'),
  ('about_text_2', '{"text": "Notre équipe passionnée vous accueille dans un cadre exceptionnel, entre sable fin et eaux cristallines, pour des journées ensoleillées et des soirées magiques.", "type": "paragraph"}', 'about'),
  ('services_tag', '{"text": "Ce que nous offrons", "type": "label"}', 'services'),
  ('services_title_light', '{"text": "Nos", "type": "heading"}', 'services'),
  ('services_title_bold', '{"text": "Services", "type": "heading"}', 'services'),
  ('cta_btn_book', '{"text": "Réserver une table", "type": "button"}', 'cta'),
  ('cta_btn_discover', '{"text": "Découvrir", "type": "button"}', 'cta')
ON CONFLICT (key) DO NOTHING;

-- Insert default branding
INSERT INTO site_branding (key, value, type) VALUES
  ('primary_color', '#222222', 'color'),
  ('accent_color', '#E8A87C', 'color'),
  ('font_family', 'Outfit', 'font'),
  ('logo_emoji', '🌴', 'text'),
  ('site_name', 'Latino Coucou Beach', 'text')
ON CONFLICT (key) DO NOTHING;

-- Insert default packages
INSERT INTO packages (name, price, currency, features, style, sort_order) VALUES
  ('PACK CABANE SUR SABLE', 70, 'DT', '[{"icon": "check", "text": "Parking sécurisé"}, {"icon": "check", "text": "Traversée en bateau (Zodiac)"}, {"icon": "check", "text": "Déjeuner complet poisson"}, {"icon": "check", "text": "Cabane sur sable pour la journée"}]', 'white', 1),
  ('PACK PAILLOTE EN MER', 80, 'DT', '[{"icon": "check", "text": "Parking sécurisé"}, {"icon": "check", "text": "Traversée en bateau (Zodiac)"}, {"icon": "check", "text": "Déjeuner complet poisson"}, {"icon": "check", "text": "Paillote en mer pour la journée"}]', 'gold', 2),
  ('PACK ENFANTS', 45, 'DT', '[{"icon": "check", "text": "Menu adapté pour enfant (4-12ans)"}, {"icon": "check", "text": "Enfant moins 4 ans gratuit"}]', 'light', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- REALTIME PUBLICATION (for live updates)
-- ============================================

-- Enable realtime for orders (kitchen display)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

-- ============================================
-- INDEXES for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
