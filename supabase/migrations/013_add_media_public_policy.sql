-- Add public read access to site_media for frontend
-- This allows anonymous users to read media URLs for gallery, etc.

CREATE POLICY "cms_media_public" ON site_media 
FOR SELECT 
TO anon 
USING (true);
