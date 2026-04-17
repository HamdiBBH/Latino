-- Create app_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON public.app_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated admins" ON public.app_settings
    FOR ALL USING (auth.role() = 'authenticated'); -- Adjust if you have a specific admin role logic

-- Seed default reservation config
INSERT INTO public.app_settings (key, value)
VALUES (
    'reservation_config',
    '{
        "seasonStart": "06-01",
        "seasonEnd": "09-30",
        "restrictionStart": "06-01",
        "restrictionEnd": "07-15",
        "rules": {
            "parasolMaxGuests": 3,
            "cabanePailloteMaxGuests": 5,
            "vipMinGuests": 6
        },
        "weeklyOffers": {
            "3": { "type": "free_children", "value": "2", "description": "2 enfants gratuits" },
            "5": { "type": "discount", "value": "-20%", "description": "-20% sur votre réservation" }
        }
    }'::jsonb
) ON CONFLICT (key) DO NOTHING;
