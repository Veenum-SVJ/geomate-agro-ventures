-- Create a function to handle farm setup atomically
CREATE OR REPLACE FUNCTION public.create_farm_with_role(
  _name text,
  _location text DEFAULT NULL,
  _size_hectares numeric DEFAULT NULL,
  _farm_type text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _farm_id uuid;
  _user_id uuid;
BEGIN
  -- Get the current user id
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create the farm
  INSERT INTO public.farms (name, location, size_hectares, farm_type)
  VALUES (_name, _location, _size_hectares, _farm_type)
  RETURNING id INTO _farm_id;
  
  -- Create the admin role for this user
  INSERT INTO public.user_roles (user_id, farm_id, role)
  VALUES (_user_id, _farm_id, 'admin');
  
  -- Update the user's profile
  UPDATE public.profiles
  SET farm_id = _farm_id, onboarding_completed = true
  WHERE user_id = _user_id;
  
  RETURN _farm_id;
END;
$$;