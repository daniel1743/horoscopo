-- Reportes y moderación de comentarios de Comunidad.
-- Ejecutar manualmente después de 07_comments_and_follows.sql.
-- Este archivo no ha sido aplicado remotamente por el agente.

CREATE TABLE IF NOT EXISTS public.community_comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.community_post_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'sensitive', 'misleading', 'other')),
  details TEXT CHECK (details IS NULL OR char_length(details) <= 500),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS community_comment_reports_open_idx
  ON public.community_comment_reports (status, created_at ASC);
CREATE INDEX IF NOT EXISTS community_comment_reports_comment_idx
  ON public.community_comment_reports (comment_id, created_at DESC);

REVOKE ALL ON TABLE public.community_comment_reports FROM anon, public;
GRANT INSERT, SELECT ON TABLE public.community_comment_reports TO authenticated;
GRANT ALL ON TABLE public.community_comment_reports TO service_role;

ALTER TABLE public.community_comment_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community comment reports own insert" ON public.community_comment_reports;
CREATE POLICY "community comment reports own insert"
  ON public.community_comment_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "community comment reports own select" ON public.community_comment_reports;
CREATE POLICY "community comment reports own select"
  ON public.community_comment_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE OR REPLACE FUNCTION public.list_open_community_comment_reports(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  report_id UUID,
  comment_id UUID,
  report_reason TEXT,
  report_details TEXT,
  report_status TEXT,
  reported_at TIMESTAMPTZ,
  comment_body TEXT,
  comment_status TEXT,
  post_id UUID,
  post_title TEXT,
  post_type TEXT,
  author_username TEXT,
  reporter_id UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    report.id,
    comment.id,
    report.reason,
    report.details,
    report.status,
    report.created_at,
    comment.body,
    comment.status,
    post.id,
    post.title,
    post.post_type,
    author.username,
    report.reporter_id
  FROM public.community_comment_reports AS report
  INNER JOIN public.community_post_comments AS comment ON comment.id = report.comment_id
  INNER JOIN public.community_posts AS post ON post.id = comment.post_id
  INNER JOIN public.profiles AS author ON author.id = comment.user_id
  WHERE report.status = 'open'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  ORDER BY report.created_at ASC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.list_open_community_comment_reports(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_open_community_comment_reports(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.moderate_community_comment_report(
  p_report_id UUID,
  p_decision TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_comment_id UUID;
  target_post_id UUID;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_decision NOT IN ('dismiss', 'hide') THEN
    RAISE EXCEPTION 'invalid moderation decision';
  END IF;

  SELECT report.comment_id, comment.post_id
  INTO target_comment_id, target_post_id
  FROM public.community_comment_reports AS report
  INNER JOIN public.community_post_comments AS comment ON comment.id = report.comment_id
  WHERE report.id = p_report_id
    AND report.status = 'open';

  IF target_comment_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.community_comment_reports
  SET status = CASE WHEN p_decision = 'hide' THEN 'reviewed' ELSE 'dismissed' END,
      details = CASE
        WHEN p_note IS NULL OR char_length(trim(p_note)) = 0 THEN details
        ELSE concat_ws(E'\n\n', details, left(trim(p_note), 500))
      END
  WHERE id = p_report_id;

  IF p_decision = 'hide' THEN
    UPDATE public.community_post_comments
    SET status = 'hidden',
        updated_at = now()
    WHERE id = target_comment_id
      AND status <> 'deleted';
  END IF;

  INSERT INTO public.admin_audit_log (
    action,
    actor_id,
    metadata,
    resource_id,
    resource_type,
    status
  )
  VALUES (
    concat('community_comment_report_', p_decision),
    auth.uid(),
    jsonb_build_object('report_id', p_report_id, 'note', left(coalesce(p_note, ''), 500)),
    target_comment_id,
    'community_comment',
    'success'
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.moderate_community_comment_report(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderate_community_comment_report(UUID, TEXT, TEXT) TO authenticated;
