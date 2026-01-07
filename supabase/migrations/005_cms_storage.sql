-- Create storage bucket for CMS media
-- Run this in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cms-media',
    'cms-media',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for cms-media bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'cms-media');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'cms-media');

CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'cms-media');

CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'cms-media');
