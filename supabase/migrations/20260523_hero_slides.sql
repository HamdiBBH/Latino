-- ============================================
-- Hero Slides Table
-- Gère le slider hero avec images desktop et mobile distinctes
-- ============================================

CREATE TABLE IF NOT EXISTS hero_slides (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Image paysage pour desktop / tablette
    media_id    UUID REFERENCES site_media(id) ON DELETE SET NULL,
    -- Image portrait/verticale pour mobile (optionnelle, fallback sur media_id)
    mobile_media_id UUID REFERENCES site_media(id) ON DELETE SET NULL,
    -- Ordre d'affichage (1, 2, 3…)
    display_order INT NOT NULL DEFAULT 1,
    -- Slide visible ou masquée
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    -- Texte alternatif pour l'accessibilité
    alt_text    TEXT,
    -- Timestamps
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes ordonnées
CREATE INDEX IF NOT EXISTS hero_slides_display_order_idx ON hero_slides (display_order ASC);

-- RLS : lecture publique, écriture réservée aux authenticated
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read hero_slides"
    ON hero_slides FOR SELECT
    USING (true);

CREATE POLICY "Authenticated can manage hero_slides"
    ON hero_slides FOR ALL
    USING (auth.role() = 'authenticated');
