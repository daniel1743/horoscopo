-- Creovision — Muro social, lote 05 de 05
-- Moderación administrativa de reportes.
-- Ejecutar este bloque completo después del lote 04.
-- Requiere que public.has_role() y public.admin_audit_log existan
-- en el esquema administrativo ya instalado.

CREATE OR REPLACE FUNCTION public.list_open_community_reports(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  report_id UUID,
  post_id UUID,
  report_reason TEXT,
  report_details TEXT,
  report_status TEXT,
  reported_at TIMESTAMPTZ,
  post_title TEXT,
  post_body TEXT,
  post_type TEXT,
  post_status TEXT,
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
    post.id,
    report.reason,
    report.details,
    report.status,
    report.created_at,
    post.title,
    post.body,
    post.post_type,
    post.status,
    author.username,
    report.reporter_id
  FROM public.community_post_reports AS report
  INNER JOIN public.community_posts AS post ON post.id = report.post_id
  INNER JOIN public.profiles AS author ON author.id = post.user_id
  WHERE report.status = 'open'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  ORDER BY report.created_at ASC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.list_open_community_reports(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_open_community_reports(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.moderate_community_report(
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
  target_post_id UUID;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_decision NOT IN ('dismiss', 'hide') THEN
    RAISE EXCEPTION 'invalid moderation decision';
  END IF;

  SELECT post_id
  INTO target_post_id
  FROM public.community_post_reports
  WHERE id = p_report_id
    AND status = 'open';

  IF target_post_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.community_post_reports
  SET status = CASE WHEN p_decision = 'hide' THEN 'reviewed' ELSE 'dismissed' END,
      details = CASE
        WHEN p_note IS NULL OR char_length(trim(p_note)) = 0 THEN details
        ELSE concat_ws(E'\n\n', details, left(trim(p_note), 500))
      END
  WHERE id = p_report_id;

  IF p_decision = 'hide' THEN
    UPDATE public.community_posts
    SET status = 'hidden',
        updated_at = now()
    WHERE id = target_post_id
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
    concat('community_report_', p_decision),
    auth.uid(),
    jsonb_build_object('report_id', p_report_id, 'note', left(coalesce(p_note, ''), 500)),
    target_post_id,
    'community_post',
    'success'
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.moderate_community_report(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderate_community_report(UUID, TEXT, TEXT) TO authenticated;
