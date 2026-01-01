-- Create table for team invitations
CREATE TABLE public.team_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'worker',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    token UUID NOT NULL DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(email, farm_id, status)
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Farm admins can view invitations for their farm
CREATE POLICY "Farm admins can view invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (public.is_farm_admin(auth.uid(), farm_id));

-- Policy: Farm admins can create invitations
CREATE POLICY "Farm admins can create invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (public.is_farm_admin(auth.uid(), farm_id));

-- Policy: Farm admins can update invitations (cancel them)
CREATE POLICY "Farm admins can update invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (public.is_farm_admin(auth.uid(), farm_id));

-- Policy: Farm admins can delete invitations
CREATE POLICY "Farm admins can delete invitations"
ON public.team_invitations
FOR DELETE
TO authenticated
USING (public.is_farm_admin(auth.uid(), farm_id));

-- Create trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at
BEFORE UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to accept an invitation (called by the invited user)
CREATE OR REPLACE FUNCTION public.accept_invitation(_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _invitation record;
    _user_id uuid;
BEGIN
    _user_id := auth.uid();
    
    IF _user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Find the invitation
    SELECT * INTO _invitation
    FROM public.team_invitations
    WHERE token = _token
      AND status = 'pending'
      AND expires_at > now();
    
    IF _invitation IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation not found or expired');
    END IF;
    
    -- Check if user already has a role in this farm
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND farm_id = _invitation.farm_id) THEN
        -- Update existing role
        UPDATE public.user_roles
        SET role = _invitation.role
        WHERE user_id = _user_id AND farm_id = _invitation.farm_id;
    ELSE
        -- Create new role
        INSERT INTO public.user_roles (user_id, farm_id, role)
        VALUES (_user_id, _invitation.farm_id, _invitation.role);
    END IF;
    
    -- Update user's profile farm_id if not set
    UPDATE public.profiles
    SET farm_id = _invitation.farm_id
    WHERE user_id = _user_id AND farm_id IS NULL;
    
    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET status = 'accepted', updated_at = now()
    WHERE id = _invitation.id;
    
    RETURN jsonb_build_object('success', true, 'farm_id', _invitation.farm_id);
END;
$$;