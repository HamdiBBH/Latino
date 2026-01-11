-- Migration: Create customers table for loyalty system
-- Run: npx supabase db push

-- ============================================
-- CUSTOMERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    name VARCHAR(255),
    
    -- Loyalty data
    visit_count INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    
    -- Personal info
    birthday DATE,
    notes TEXT,
    
    -- Metadata
    first_visit_date DATE,
    last_visit_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_visit_count ON customers(visit_count DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users (managers)
CREATE POLICY "Allow read for authenticated" ON customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert for authenticated" ON customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON customers
    FOR UPDATE
    TO authenticated
    USING (true);

-- ============================================
-- TRIGGER: Update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- ============================================
-- FUNCTION: Upsert customer and increment visit
-- ============================================

CREATE OR REPLACE FUNCTION increment_customer_visit(
    p_email VARCHAR,
    p_name VARCHAR,
    p_phone VARCHAR,
    p_amount DECIMAL
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    -- Try to find existing customer
    SELECT id INTO v_customer_id FROM customers WHERE email = LOWER(p_email);
    
    IF v_customer_id IS NOT NULL THEN
        -- Update existing customer
        UPDATE customers SET
            visit_count = visit_count + 1,
            total_spent = total_spent + COALESCE(p_amount, 0),
            loyalty_points = loyalty_points + FLOOR(COALESCE(p_amount, 0) / 10), -- 1 point per 10 DT
            last_visit_date = CURRENT_DATE,
            name = COALESCE(p_name, name),
            phone = COALESCE(p_phone, phone)
        WHERE id = v_customer_id;
    ELSE
        -- Create new customer
        INSERT INTO customers (email, name, phone, visit_count, total_spent, first_visit_date, last_visit_date, loyalty_points)
        VALUES (LOWER(p_email), p_name, p_phone, 1, COALESCE(p_amount, 0), CURRENT_DATE, CURRENT_DATE, FLOOR(COALESCE(p_amount, 0) / 10))
        RETURNING id INTO v_customer_id;
    END IF;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;
