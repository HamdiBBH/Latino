-- Short-term production hardening: tighten public data access and CMS write access.

-- Helpers are kept inline in policies to avoid adding functions with elevated privileges.

-- Reservations: guests may create a reservation, but anonymous users must not list or read PII.
DROP POLICY IF EXISTS "Anon view own reservations by id" ON public.reservations;
DROP POLICY IF EXISTS "Public create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Auth create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Manager update reservations" ON public.reservations;

CREATE POLICY "Public create reservations"
ON public.reservations
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Auth create reservations"
ON public.reservations
FOR INSERT TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users view own reservations"
ON public.reservations
FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('ADMIN', 'MANAGER', 'DEV')
    )
);

CREATE POLICY "Manager update reservations"
ON public.reservations
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('ADMIN', 'MANAGER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('ADMIN', 'MANAGER')
    )
);

-- CMS tables: public read remains for published frontend data, writes are DEV/ADMIN only.
DROP POLICY IF EXISTS "cms_sections_auth" ON public.site_sections;
DROP POLICY IF EXISTS "cms_content_auth" ON public.site_content;
DROP POLICY IF EXISTS "cms_media_auth" ON public.site_media;
DROP POLICY IF EXISTS "cms_albums_auth" ON public.gallery_albums;
DROP POLICY IF EXISTS "cms_images_auth" ON public.gallery_images;
DROP POLICY IF EXISTS "cms_branding_auth" ON public.site_branding;
DROP POLICY IF EXISTS "cms_menu_auth" ON public.menu_items;
DROP POLICY IF EXISTS "cms_events_auth" ON public.events;
DROP POLICY IF EXISTS "cms_testimonials_auth" ON public.testimonials;

CREATE POLICY "cms_sections_admin" ON public.site_sections FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_content_admin" ON public.site_content FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_media_admin" ON public.site_media FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_albums_admin" ON public.gallery_albums FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_images_admin" ON public.gallery_images FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_branding_admin" ON public.site_branding FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_menu_admin" ON public.menu_items FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_events_admin" ON public.events FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "cms_testimonials_admin" ON public.testimonials FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

-- Reels/services/packages/settings/installations were previously writable by any authenticated user.
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.instagram_reels;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.instagram_reels;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.instagram_reels;
DROP POLICY IF EXISTS "Allow authenticated full access on services" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated full access on packages" ON public.packages;
DROP POLICY IF EXISTS "Enable all access for authenticated admins" ON public.app_settings;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.beach_installations;

CREATE POLICY "instagram_reels_admin" ON public.instagram_reels FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "services_admin" ON public.services FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "packages_admin" ON public.packages FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

CREATE POLICY "app_settings_admin" ON public.app_settings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "beach_installations_admin" ON public.beach_installations FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN')));

-- Storage: keep public reads for published media, restrict all writes to DEV/ADMIN.
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

CREATE POLICY "cms media admins can upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'cms-media'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN'))
);

CREATE POLICY "cms media admins can update" ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'cms-media'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN'))
)
WITH CHECK (
    bucket_id = 'cms-media'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN'))
);

CREATE POLICY "cms media admins can delete" ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'cms-media'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('DEV', 'ADMIN'))
);

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/x-icon']
WHERE id = 'cms-media';
