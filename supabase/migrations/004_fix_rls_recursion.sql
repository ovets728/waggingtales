-- Fix infinite recursion in profiles RLS policies.
--
-- Problem: The admin policies on `profiles` did
--   (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
-- Checking that SELECT triggers the profiles RLS policy again, which
-- triggers another SELECT, forever.
--
-- Fix: Use a SECURITY DEFINER function that bypasses RLS on the profiles
-- table when checking admin status.

-- Drop the recursive admin policies
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- Helper function that bypasses RLS (SECURITY DEFINER runs as owner)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role = 'admin'
  );
$$;

-- Grant execute to authenticated and anon (RLS still applies to callers)
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;

-- Recreate policies using the helper
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin(auth.uid()));
