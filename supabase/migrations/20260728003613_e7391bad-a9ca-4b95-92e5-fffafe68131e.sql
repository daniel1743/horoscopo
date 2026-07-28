
-- =========================================================================
-- FASE B: Workflow editorial + revisiones + concurrencia optimista
-- =========================================================================

-- 1) Concurrencia optimista para editorial_articles
ALTER TABLE public.editorial_articles
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;

-- 2) content_workflow: un registro por recurso administrado
CREATE TABLE IF NOT EXISTS public.content_workflow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  workflow_state text NOT NULL DEFAULT 'draft'
    CHECK (workflow_state IN ('draft','in_review','changes_requested','approved','published','archived')),
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS content_workflow_state_idx
  ON public.content_workflow (workflow_state, updated_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.content_workflow TO authenticated;
GRANT ALL ON public.content_workflow TO service_role;

ALTER TABLE public.content_workflow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin members can view workflow"
  ON public.content_workflow FOR SELECT
  TO authenticated
  USING (public.has_admin_role(auth.uid(),
    ARRAY['super_admin','admin','editor','reviewer']));

CREATE POLICY "Editors and up can insert workflow"
  ON public.content_workflow FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_role(auth.uid(),
    ARRAY['super_admin','admin','editor']));

CREATE POLICY "Editors, reviewers and admins can update workflow"
  ON public.content_workflow FOR UPDATE
  TO authenticated
  USING (public.has_admin_role(auth.uid(),
    ARRAY['super_admin','admin','editor','reviewer']))
  WITH CHECK (public.has_admin_role(auth.uid(),
    ARRAY['super_admin','admin','editor','reviewer']));

CREATE TRIGGER content_workflow_set_updated_at
  BEFORE UPDATE ON public.content_workflow
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) content_revisions: snapshots append-only
CREATE TABLE IF NOT EXISTS public.content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resource_type, resource_id, version)
);

CREATE INDEX IF NOT EXISTS content_revisions_resource_idx
  ON public.content_revisions (resource_type, resource_id, version DESC);

GRANT SELECT, INSERT ON public.content_revisions TO authenticated;
GRANT ALL ON public.content_revisions TO service_role;

ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin members can view revisions"
  ON public.content_revisions FOR SELECT
  TO authenticated
  USING (public.has_admin_role(auth.uid(),
    ARRAY['super_admin','admin','editor','reviewer']));

CREATE POLICY "Editors and up can insert revisions"
  ON public.content_revisions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_role(auth.uid(),
    ARRAY['super_admin','admin','editor','reviewer']));

-- No UPDATE/DELETE policies → append-only para clientes (service_role bypassa).

-- 4) Endurecer editorial_articles: dar a admin/editor la capacidad de escribir
--    manteniendo intacta la lectura pública existente.
--    (Se añaden nuevas políticas sin tocar las de lectura pública.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='editorial_articles'
      AND policyname='Admin members can manage articles'
  ) THEN
    CREATE POLICY "Admin members can manage articles"
      ON public.editorial_articles FOR ALL
      TO authenticated
      USING (public.has_admin_role(auth.uid(),
        ARRAY['super_admin','admin','editor']))
      WITH CHECK (public.has_admin_role(auth.uid(),
        ARRAY['super_admin','admin','editor']));
  END IF;
END $$;
