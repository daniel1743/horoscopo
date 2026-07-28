
-- =========================================================================
-- FASE A: Admin foundation
-- =========================================================================

-- 1) Extend app_role enum with the three new values (idempotent)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reviewer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'media_manager';

-- 2) Add granted_by column to user_roles (nullable, references auth.users)
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3) Harden user_roles RLS: users can READ their own roles; NO client writes.
--    Only server (service_role) can insert/update/delete.
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Explicitly deny client-side writes (no INSERT/UPDATE/DELETE policies for
-- authenticated/anon). service_role bypasses RLS.
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;

-- 4) Secure role-check helper: accepts text[] of roles, avoids enum-literal
--    dependency in the same transaction as the enum extension.
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_role(_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_admin_role(auth.uid(), _roles);
$$;

REVOKE ALL ON FUNCTION public.has_admin_role(uuid, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_has_role(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_admin_role(uuid, text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_has_role(text[]) TO authenticated, service_role;

-- 5) admin_audit_log — append-only
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  status text NOT NULL DEFAULT 'success',
  request_id text,
  ip_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_actor_idx ON public.admin_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_resource_idx ON public.admin_audit_log (resource_type, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON public.admin_audit_log (action, created_at DESC);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Read: only admin / super_admin
CREATE POLICY "Admins can read audit log"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (public.has_admin_role(auth.uid(), ARRAY['admin','super_admin']));

-- No client-side INSERT/UPDATE/DELETE policies → append-only via service_role.
