-- Installations (types d'emplacements)
CREATE TABLE IF NOT EXISTS installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    capacity_min INT DEFAULT 1,
    capacity_max INT DEFAULT 10,
    base_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id UUID REFERENCES installations(id),
    guest_name VARCHAR(200) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50) NOT NULL,
    reservation_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL CHECK (time_slot IN ('full_day', 'morning', 'afternoon')),
    guest_count INT NOT NULL DEFAULT 2,
    special_request TEXT,
    estimated_price DECIMAL(10,2),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'alternative_proposed', 'cancelled')),
    manager_notes TEXT,
    alternative_date DATE,
    alternative_installation_id UUID REFERENCES installations(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);

-- RLS Policies
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Public can view active installations
CREATE POLICY "Public read installations" ON installations 
FOR SELECT TO anon USING (is_active = true);

-- Authenticated can view all installations
CREATE POLICY "Auth read all installations" ON installations 
FOR SELECT TO authenticated USING (true);

-- Admin can manage installations
CREATE POLICY "Admin manage installations" ON installations 
FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'DEV'))
);

-- Anyone can create reservations
CREATE POLICY "Public create reservations" ON reservations 
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Auth create reservations" ON reservations 
FOR INSERT TO authenticated WITH CHECK (true);

-- Users can view their own reservations
CREATE POLICY "Users view own reservations" ON reservations 
FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'DEV'))
);

-- Managers can update reservations
CREATE POLICY "Manager update reservations" ON reservations 
FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
);

-- Insert default installations
INSERT INTO installations (name, slug, description, capacity_min, capacity_max, base_price, display_order) VALUES
('Parasol', 'parasol', 'Parasol avec 2 transats sur le sable fin', 1, 4, 35.00, 1),
('Paillote', 'paillote', 'Paillote couverte avec table et chaises longues', 2, 6, 75.00, 2),
('Cabane VIP', 'cabane-vip', 'Espace privé avec lit balinais et service premium', 2, 8, 150.00, 3),
('Espace Lounge', 'espace-lounge', 'Grand espace pour groupes avec canapés et poufs', 6, 15, 250.00, 4)
ON CONFLICT (slug) DO NOTHING;
