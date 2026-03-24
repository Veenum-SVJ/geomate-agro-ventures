-- =============================================================
-- FIX CMS RLS POLICIES & SECURITY
-- Run this in Supabase SQL Editor before production deployment
-- =============================================================

-- ==================== 1. FIX CMS TABLE RLS POLICIES ====================
-- Replace overly permissive "any authenticated user" write policies
-- with admin-only access using has_role()

-- website_products
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.website_products;
CREATE POLICY "Admins can manage products" ON public.website_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- website_pages
DROP POLICY IF EXISTS "Authenticated users can manage pages" ON public.website_pages;
CREATE POLICY "Admins can manage pages" ON public.website_pages
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- gallery_images
DROP POLICY IF EXISTS "Authenticated users can manage gallery" ON public.gallery_images;
CREATE POLICY "Admins can manage gallery" ON public.gallery_images
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- website_settings
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.website_settings;
CREATE POLICY "Admins can manage settings" ON public.website_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- website_values
DROP POLICY IF EXISTS "Authenticated users can manage values" ON public.website_values;
CREATE POLICY "Admins can manage values" ON public.website_values
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- website_milestones
DROP POLICY IF EXISTS "Authenticated users can manage milestones" ON public.website_milestones;
CREATE POLICY "Admins can manage milestones" ON public.website_milestones
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- website_practices
DROP POLICY IF EXISTS "Authenticated users can manage practices" ON public.website_practices;
CREATE POLICY "Admins can manage practices" ON public.website_practices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- website_categories
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.website_categories;
CREATE POLICY "Admins can manage categories" ON public.website_categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage: gallery bucket
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
CREATE POLICY "Admins can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;
CREATE POLICY "Admins can delete gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

-- Inquiries: restrict read/update to admins
DROP POLICY IF EXISTS "Authenticated users can view inquiries" ON public.inquiries;
CREATE POLICY "Admins can view inquiries" ON public.inquiries
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries" ON public.inquiries
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));


-- ==================== 2. FIX AUTO-ADMIN SIGNUP ====================
-- New users should get 'worker' role, not 'admin'
-- The first user (you) already has admin. All future signups should be workers.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_farm_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Create profile with default farm
    INSERT INTO public.profiles (user_id, email, full_name, avatar_url, farm_id, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        default_farm_id,
        true
    );
    
    -- Assign worker role (NOT admin) to the default farm
    INSERT INTO public.user_roles (user_id, farm_id, role)
    VALUES (NEW.id, default_farm_id, 'worker');
    
    RETURN NEW;
END;
$$;

-- =============================================================
-- DONE! CMS is now admin-only, new users get worker role.
-- =============================================================
