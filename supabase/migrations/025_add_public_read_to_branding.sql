-- Add public read access to site_branding for frontend
-- This allows anonymous users to read branding assets like logo, favicon, etc.

CREATE POLICY "cms_branding_public" ON site_branding 
FOR SELECT 
TO anon 
USING (true);
