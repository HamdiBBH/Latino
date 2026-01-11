-- Migration: Link reservations to packages table
-- This removes the installations table and links reservations directly to packages

-- 1. Drop the old installations table and related objects
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS installations CASCADE;

-- 2. Create reservations table linked to packages
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES packages(id),
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
    alternative_package_id UUID REFERENCES packages(id),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_user ON reservations(user_id);

-- 4. Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 5. Create policies
CREATE POLICY "Public create reservations" ON reservations 
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Auth create reservations" ON reservations 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users view own reservations" ON reservations 
FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER', 'DEV'))
);

CREATE POLICY "Anon view own reservations by id" ON reservations 
FOR SELECT TO anon USING (true);

CREATE POLICY "Manager update reservations" ON reservations 
FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
);

-- 6. Add capacity fields to packages if they don't exist
ALTER TABLE packages ADD COLUMN IF NOT EXISTS capacity_min INT DEFAULT 1;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS capacity_max INT DEFAULT 10;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS image_url TEXT;
