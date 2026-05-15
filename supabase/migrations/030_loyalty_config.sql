-- ============================================
-- Loyalty program configuration
-- ============================================

-- Insert default loyalty config into app_settings
INSERT INTO public.app_settings (key, value)
VALUES (
    'loyalty_config',
    '{
        "pointsPerVisit": 100,
        "tiers": [
            {
                "id": "bronze",
                "name": "Bronze",
                "icon": "🥉",
                "minPoints": 0,
                "maxPoints": 299,
                "color": "#CD7F32",
                "discountPercent": 0,
                "benefits": ["Accueil personnalisé", "Newsletter exclusive"]
            },
            {
                "id": "silver",
                "name": "Silver",
                "icon": "🥈",
                "minPoints": 300,
                "maxPoints": 499,
                "color": "#C0C0C0",
                "discountPercent": 15,
                "benefits": ["15% de réduction", "Jus de bienvenue", "Réservation prioritaire"]
            },
            {
                "id": "gold",
                "name": "Gold",
                "icon": "🥇",
                "minPoints": 500,
                "maxPoints": null,
                "color": "#FFD700",
                "discountPercent": 20,
                "benefits": ["20% de réduction", "Upgrade zone gratuit", "Service conciergerie dédié"]
            }
        ]
    }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Update the increment_customer_visit function to give 100 points per visit
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
        -- Update existing customer: 100 points per visit
        UPDATE customers SET
            visit_count = visit_count + 1,
            total_spent = total_spent + COALESCE(p_amount, 0),
            loyalty_points = loyalty_points + 100,
            last_visit_date = CURRENT_DATE,
            name = COALESCE(p_name, name),
            phone = COALESCE(p_phone, phone)
        WHERE id = v_customer_id;
    ELSE
        -- Create new customer: 100 points for first visit
        INSERT INTO customers (email, name, phone, visit_count, total_spent, first_visit_date, last_visit_date, loyalty_points)
        VALUES (LOWER(p_email), p_name, p_phone, 1, COALESCE(p_amount, 0), CURRENT_DATE, CURRENT_DATE, 100)
        RETURNING id INTO v_customer_id;
    END IF;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;
