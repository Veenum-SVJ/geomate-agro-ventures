-- Drop problematic policies on user_roles
DROP POLICY IF EXISTS "Admins can delete roles for their farms" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles for their farms" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles for their farms" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles for their farms" ON public.user_roles;

-- Create a security definer function to check if user is admin of a farm
CREATE OR REPLACE FUNCTION public.is_farm_admin(_user_id uuid, _farm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND farm_id = _farm_id
      AND role = 'admin'
  )
$$;

-- Create a security definer function to get user's farm ids
CREATE OR REPLACE FUNCTION public.get_user_farm_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT farm_id FROM public.user_roles WHERE user_id = _user_id
$$;

-- Create a security definer function to check if farm has any roles yet
CREATE OR REPLACE FUNCTION public.farm_has_no_roles(_farm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE farm_id = _farm_id
  )
$$;

-- Recreate policies using security definer functions
CREATE POLICY "Users can view roles for their farms"
ON public.user_roles
FOR SELECT
USING (farm_id IN (SELECT public.get_user_farm_ids(auth.uid())));

CREATE POLICY "Admins can insert roles for their farms"
ON public.user_roles
FOR INSERT
WITH CHECK (
  public.is_farm_admin(auth.uid(), farm_id) 
  OR (user_id = auth.uid() AND public.farm_has_no_roles(farm_id))
);

CREATE POLICY "Admins can update roles for their farms"
ON public.user_roles
FOR UPDATE
USING (public.is_farm_admin(auth.uid(), farm_id));

CREATE POLICY "Admins can delete roles for their farms"
ON public.user_roles
FOR DELETE
USING (public.is_farm_admin(auth.uid(), farm_id));