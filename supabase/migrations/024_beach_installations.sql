-- 024_beach_installations.sql

CREATE TABLE IF NOT EXISTS public.beach_installations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    icon VARCHAR(100) NOT NULL DEFAULT 'Umbrella',
    color VARCHAR(50) NOT NULL DEFAULT '#43B0A8',
    badge VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS
ALTER TABLE public.beach_installations ENABLE ROW LEVEL SECURITY;

-- Read access for all
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.beach_installations FOR SELECT 
USING (true);

-- Full access for authenticated admins/managers
CREATE POLICY "Enable all access for authenticated users" 
ON public.beach_installations FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO public.beach_installations (id, title, description, price, image_url, icon, color, badge, sort_order)
VALUES 
    (gen_random_uuid(), 'Pack Cabane VIP', 'Espace privatif avec cabane premium, transats confort, service dédié et vue mer panoramique.', 100, 'https://images.unsplash.com/photo-1540541338287-41700c307c75?w=500&h=350&fit=crop', 'Crown', '#D4A574', 'PREMIUM', 1),
    (gen_random_uuid(), 'Pack Paillote en Mer', 'Paillote installée sur l''eau avec transats, l''expérience ultime les pieds dans la mer.', 80, 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=500&h=350&fit=crop', 'Waves', '#43B0A8', 'POPULAIRE', 2),
    (gen_random_uuid(), 'Pack Cabane sur Sable', 'Cabane ombragée directement sur le sable avec transats et table privée.', 70, 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=350&fit=crop', 'TreePalm', '#E8A87C', NULL, 3),
    (gen_random_uuid(), 'Parasol sur Plage', 'Parasol avec deux transats sur la plage, accès direct à la mer.', 65, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=350&fit=crop', 'Sun', '#FFB347', NULL, 4)
ON CONFLICT DO NOTHING;
