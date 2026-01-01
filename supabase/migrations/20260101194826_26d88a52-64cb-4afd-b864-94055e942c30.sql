-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Admins can create farms" ON public.farms;

-- Create a permissive policy that allows authenticated users to create farms
CREATE POLICY "Authenticated users can create farms"
ON public.farms
FOR INSERT
TO authenticated
WITH CHECK (true);