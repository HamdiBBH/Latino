-- Fix public read policies to apply to authenticated users as well (for clients)
DROP POLICY IF EXISTS "cms_menu_public" ON public.menu_items;
CREATE POLICY "cms_menu_public" ON public.menu_items FOR SELECT USING (is_active = true);
