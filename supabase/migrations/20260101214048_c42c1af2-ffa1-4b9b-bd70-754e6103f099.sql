-- Update accept_invitation function to return invitation_id
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
    
    RETURN jsonb_build_object(
        'success', true, 
        'farm_id', _invitation.farm_id,
        'invitation_id', _invitation.id
    );
END;
$$;