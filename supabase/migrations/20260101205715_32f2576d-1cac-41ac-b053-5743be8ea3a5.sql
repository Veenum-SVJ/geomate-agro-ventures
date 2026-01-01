-- Create the single Geomate Agro Ventures farm if it doesn't exist
INSERT INTO public.farms (id, name, location, farm_type)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Geomate Agro Ventures',
  'Nigeria',
  ARRAY['poultry', 'fishery', 'crops', 'feedmill']
)
ON CONFLICT (id) DO NOTHING;

-- Update the handle_new_user function to auto-assign users to the single farm
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
    
    -- Auto-assign worker role to the default farm
    INSERT INTO public.user_roles (user_id, farm_id, role)
    VALUES (NEW.id, default_farm_id, 'worker');
    
    RETURN NEW;
END;
$$;

-- Update existing profiles without a farm to use the default farm
UPDATE public.profiles 
SET farm_id = '00000000-0000-0000-0000-000000000001', 
    onboarding_completed = true
WHERE farm_id IS NULL;

-- Ensure existing users have roles for the default farm
INSERT INTO public.user_roles (user_id, farm_id, role)
SELECT p.user_id, '00000000-0000-0000-0000-000000000001', 'admin'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id 
  AND ur.farm_id = '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT DO NOTHING;