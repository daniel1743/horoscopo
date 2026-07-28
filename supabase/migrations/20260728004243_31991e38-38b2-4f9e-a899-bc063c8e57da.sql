-- 1. Restrict profiles read to owner
DROP POLICY IF EXISTS "profiles public read" ON public.profiles;

CREATE POLICY "profiles owner read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Lock down SECURITY DEFINER helpers.
-- has_role / has_admin_role / current_user_has_role are called from RLS policies
-- evaluated as the invoking role, so authenticated must retain EXECUTE.
-- anon and PUBLIC never legitimately need these — revoke everywhere else.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_admin_role(uuid, text[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_has_role(text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_admin_role(uuid, text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(text[]) TO authenticated, service_role;

-- handle_new_user runs only as an AFTER INSERT trigger on auth.users.
-- No API caller should ever invoke it directly.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role, supabase_auth_admin;